// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const jobs = await prisma.jobListing.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        employer: true,
      },
    });

    if (jobs.length === 0) {
      const { dbMock } = await import("@/lib/dbMock");
      const fallbackJobs = dbMock.getJobListings();
      return NextResponse.json({ success: true, jobs: fallbackJobs });
    }

    const enrichedJobs = jobs.map((job) => ({
      ...job,
      companyName: job.employer?.companyName || "Nashik MSME Partner Company",
    }));

    return NextResponse.json({ success: true, jobs: enrichedJobs });
  } catch (err: unknown) {
    console.error("Fetch jobs error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
