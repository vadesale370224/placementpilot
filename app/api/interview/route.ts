// app/api/interview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { profileId },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (err: unknown) {
    console.error("Fetch interviews error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { topic, feedback, transcript } = body;

    if (!topic || !feedback) {
      return NextResponse.json({ error: "Topic and feedback are required" }, { status: 400 });
    }

    // Save Interview Session in PostgreSQL
    const session = await prisma.interviewSession.create({
      data: {
        profileId,
        topic,
        status: "COMPLETED",
        scheduledAt: new Date(),
        feedback,
        transcript,
      },
    });

    // Update SkillPassport readiness score & verification level
    const passport = await prisma.skillPassport.findUnique({
      where: { profileId },
    });

    let updatedPassport = null;
    if (passport) {
      const currentScore = passport.readinessScore || 75.0;
      const newScore = Math.min(100.0, parseFloat((currentScore + 10.0).toFixed(1)));
      
      updatedPassport = await prisma.skillPassport.update({
        where: { profileId },
        data: {
          readinessScore: newScore,
          verificationLevel: "AI_VERIFIED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      session,
      passport: updatedPassport,
    });
  } catch (err: unknown) {
    console.error("Save interview error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
