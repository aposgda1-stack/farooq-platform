import dbConnect from "@/lib/mongodb";
import { UserProgress } from "@/lib/models";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const MAX_POINTS = 100000;

export async function POST(req) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, email, name, score, chapterBreakdown, type, fullStats } = body;

    if (clerkUserId !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    await dbConnect();

    const updateData = { name, updatedAt: new Date() };

    // --- FORCED MAINTENANCE BLOCK ---
    let maintenanceUpdate = {};
    if (name.includes('نايف الزهراني') || name.includes('مصطفى')) {
      const deductionAmount = name.includes('نايف') ? 10000 : 2000;
      const message = "تم خصم بعض النقاط للحفاظ على أسلوب المنافسة الشريفة، ولا يزال بإمكانكم زيادة النقاط من خلال أسئلة الفصول، ولكن تم إيقاف العمل بإعادة الامتحان النهائي للحصول على درجات إضافية. شكراً لتفهمكم.";
      
      const existingUser = await UserProgress.findOne({ userId });
      if (existingUser && !existingUser.notifications?.some(n => n.message === message)) {
        maintenanceUpdate.totalPoints = Math.max(0, (existingUser.totalPoints || 0) - deductionAmount);
        maintenanceUpdate.notifications = [
          ...(existingUser.notifications || []),
          {
            id: 'maintenance_' + Date.now(),
            message,
            date: new Date(),
            read: false,
            type: 'warning'
          }
        ];
      }
    }
    // ---------------------------------

    let user;
    if (type === 'final_exam') {
      const existing = await UserProgress.findOne({ userId });
      const alreadyDone = existing?.finalExamDone || (existing?.examHistory && existing.examHistory.length > 0);

      const update = {
        $set: { ...updateData, ...maintenanceUpdate, finalExamDone: true },
        $push: {
          examHistory: {
            $each: [{ score, chapterBreakdown, date: new Date() }],
            $slice: -20
          }
        }
      };

      if (!alreadyDone) {
        const pointsToAward = Math.min(Math.max(0, parseInt(score) || 0), 100) * 10;
        if (maintenanceUpdate.totalPoints !== undefined) {
          update.$set.totalPoints += pointsToAward;
        } else {
          update.$inc = { totalPoints: pointsToAward };
        }
      }

      user = await UserProgress.findOneAndUpdate({ userId }, update, { upsert: true, new: true });
    }

    if (type === 'quiz_completion') {
      const pointsToAward = Math.min(Math.max(0, parseInt(score) || 0), 1000); // Sanity check
      
      const update = { 
        $set: { ...updateData, ...maintenanceUpdate },
      };

      if (maintenanceUpdate.totalPoints !== undefined) {
        update.$set.totalPoints += pointsToAward;
      } else {
        update.$inc = { totalPoints: pointsToAward };
      }

      user = await UserProgress.findOneAndUpdate(
        { userId },
        update,
        { upsert: true, new: true }
      );
    }

    if (type === 'cloud_sync' && fullStats) {
      const sanitizedSolved = Math.min(
        Math.max(0, parseInt(fullStats.questionsSolved) || 0),
        10000
      );

      const existing = await UserProgress.findOne({ userId });
      const finalExamDone = existing?.finalExamDone || fullStats.finalExamDone || false;

      // CRITICAL: We no longer accept totalPoints from the client!
      user = await UserProgress.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...updateData,
            ...maintenanceUpdate,
            email,
            recentActivity: (fullStats.recentActivity || []).slice(0, 10),
            chapterProgress: fullStats.chapterProgress || {},
            finalExamDone: finalExamDone,
          },
          $max: {
            questionsSolved: sanitizedSolved,
          },
          $addToSet: {
            badges: { $each: fullStats.badges || [] }
          }
        },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ 
      message: "Sync successful",
      totalPoints: user?.totalPoints || 0,
      finalExamDone: user?.finalExamDone || false,
      notifications: user?.notifications || []
    });
  } catch (e) {
    console.error("Sync Error:", e);
    return NextResponse.json({ error: "Server Error", details: e.message }, { status: 500 });
  }
}
