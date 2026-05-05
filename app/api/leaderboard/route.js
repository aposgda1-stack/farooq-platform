import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("farooq_platform");
    const collection = db.collection("user_progress");

    // FIX: Sort by totalPoints (effort/loyalty) instead of just last score
    // This makes the leaderboard much more logical and rewarding
    const topStudents = await collection
      .find({ totalPoints: { $exists: true } })
      .sort({ totalPoints: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(topStudents);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
