// app/api/interview/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId, questions, answers, scores, overallScore, language } = body;

    if (!profileId) {
      return NextResponse.json({ error: "profileId is required" }, { status: 400 });
    }

    const feedback = {
      questions: questions || [],
      answers: answers || [],
      scores: scores || [],
      overallScore: overallScore || 0,
      language: language || "en",
    };

    const session = await prisma.interviewSession.create({
      data: {
        profileId,
        topic: "AI Onboarding Interview",
        status: "COMPLETED",
        scheduledAt: new Date(),
        feedback,
        transcript: (answers || []).join("\n"),
      },
    });

    // Boost SkillPassport readiness score on completing interview
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
  } catch (err: any) {
    console.error("Save interview/save error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
