// app/api/jobs/apply/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: {
        jobId,
        jobSeekerId: profileId,
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, application: existing, message: "Already applied" });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        jobSeekerId: profileId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (err: unknown) {
    console.error("Apply job error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
