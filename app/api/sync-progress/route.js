import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

const MAX_POINTS = 100000; // FIX #5: Cap points to prevent manipulation

export async function POST(req) {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const body = await req.json();
    const { userId, email, name, score, chapterBreakdown, type, fullStats } = body;

    if (!clerkUserId || clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("farooq_platform");
    const collection = db.collection("user_progress");

    const updateData = { userId, email, name, updatedAt: new Date() };

    if (type === 'final_exam') {
      await collection.updateOne(
        { email },
        {
          $set: updateData,
          $push: {
            examHistory: {
              $each: [{ score, chapterBreakdown, date: new Date() }],
              $slice: -20
            }
          },
          $max: { totalScore: score }
        },
        { upsert: true }
      );
    }

    if (type === 'cloud_sync' && fullStats) {
      // FIX #5: Validate and cap points
      const sanitizedPoints = Math.min(
        Math.max(0, parseInt(fullStats.totalPoints) || 0),
        MAX_POINTS
      );
      const sanitizedSolved = Math.min(
        Math.max(0, parseInt(fullStats.questionsSolved) || 0),
        10000
      );

      // FIX #6: Single atomic update with proper operators
      await collection.updateOne(
        { email },
        {
          $set: {
            ...updateData,
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
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
