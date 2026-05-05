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

    if (type === 'final_exam') {
      await UserProgress.findOneAndUpdate(
        { userId },
        {
          $set: updateData,
          $push: {
            examHistory: {
              $each: [{ score, chapterBreakdown, date: new Date() }],
              $slice: -20
            }
          },
          $max: { totalPoints: score }
        },
        { upsert: true }
      );
    }

    if (type === 'cloud_sync' && fullStats) {
      const sanitizedPoints = Math.min(
        Math.max(0, parseInt(fullStats.totalPoints) || 0),
        MAX_POINTS
      );
      const sanitizedSolved = Math.min(
        Math.max(0, parseInt(fullStats.questionsSolved) || 0),
        10000
      );

      await UserProgress.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...updateData,
            email,
            recentActivity: (fullStats.recentActivity || []).slice(0, 10),
            chapterProgress: fullStats.chapterProgress || {},
          },
          $max: {
            totalPoints: sanitizedPoints,
            questionsSolved: sanitizedSolved,
          },
          $addToSet: {
            badges: { $each: fullStats.badges || [] }
          }
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ message: "Sync successful" });
  } catch (e) {
    console.error("Sync Error:", e);
    return NextResponse.json({ error: "Server Error", details: e.message }, { status: 500 });
  }
}
