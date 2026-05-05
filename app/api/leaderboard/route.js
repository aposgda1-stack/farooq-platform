import dbConnect from "@/lib/mongodb";
import { UserProgress } from "@/lib/models";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    const topStudents = await UserProgress.find({ totalPoints: { $exists: true } })
      .sort({ totalPoints: -1 })
      .limit(20)
      .lean();

    return NextResponse.json(topStudents);
  } catch (e) {
    console.error("Leaderboard Error:", e);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
