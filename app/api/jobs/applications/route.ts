// app/api/jobs/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { jobSeekerId: profileId },
      include: {
        job: {
          include: {
            employer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedApplications = applications.map((app) => ({
      ...app,
      job: app.job ? {
        ...app.job,
        companyName: app.job.employer?.companyName || "Nashik MSME Partner Company",
      } : undefined,
    }));

    return NextResponse.json({ success: true, applications: enrichedApplications });
  } catch (err: unknown) {
    console.error("Fetch applications error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
