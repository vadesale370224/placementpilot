// app/api/passport/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing passport ID" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        skillPassport: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Passport not found" }, { status: 404 });
    }

    // Unpack serialized bio if stored as JSON
    let unpackedBio = profile.bio || "";
    let metadata: Record<string, any> = {};

    if (profile.bio && profile.bio.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(profile.bio);
        unpackedBio = parsed.text || "";
        metadata = parsed;
      } catch (err) {
        unpackedBio = profile.bio;
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        phone: profile.phone,
        bio: unpackedBio,
        avatarUrl: profile.avatarUrl,
        companyName: profile.companyName,
        preferredLanguage: profile.preferredLanguage,
        languages: profile.languages,
        state: profile.state,
        isVerified: profile.isVerified,
        collegeName: metadata.collegeName || "",
        degree: metadata.degree || "",
        branch: metadata.branch || "",
        year: metadata.year || "",
        cgpa: metadata.cgpa || "",
        preferredRole: metadata.preferredRole || "",
        preferredLocation: metadata.preferredLocation || "",
        expectedSalary: metadata.expectedSalary || "",
        employmentType: metadata.employmentType || "",
        originalTranscript: metadata.originalTranscript || "",
      },
      passport: profile.skillPassport ? {
        id: profile.skillPassport.id,
        profileId: profile.skillPassport.profileId,
        skills: profile.skillPassport.skills,
        readinessScore: profile.skillPassport.readinessScore,
        verificationLevel: profile.skillPassport.verificationLevel,
      } : null,
    });
  } catch (err: unknown) {
    console.error("Fetch public passport error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
