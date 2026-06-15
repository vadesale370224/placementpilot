// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const analyzeSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string().url(),
  extractedText: z.string().min(10, "Text is too short to analyze"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fileName, fileUrl, extractedText } = parsed.data;

    // In a real scenario, you would pass `extractedText` to an AI model here.
    // For now, we generate a mock analysis.
    const analysisJson = {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      strengths: ["Clear formatting", "Relevant keywords detected"],
      weaknesses: ["Lacks quantifiable achievements", "Could improve action verbs"],
      summary: "A solid baseline resume, but it needs more impact-driven bullet points.",
    };

    const record = await prisma.resumeAnalysis.create({
      data: {
        userId,
        fileName,
        fileUrl,
        extractedText,
        analysisJson,
      },
    });

    return NextResponse.json({ success: true, analysis: record });
  } catch (error) {
    console.error("Analyze route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
