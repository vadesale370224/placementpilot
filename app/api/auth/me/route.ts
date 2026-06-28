// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userIdCookie = req.cookies.get("pp_user_id")?.value;
    const profileIdCookie = req.cookies.get("pp_profile_id")?.value;

    if (!userIdCookie && !profileIdCookie) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // Try to resolve User first
    let dbUser = null;
    let profile = null;

    if (userIdCookie) {
      dbUser = await prisma.user.findUnique({
        where: { id: userIdCookie },
        include: {
          profile: {
            include: {
              skillPassport: true,
            },
          },
        },
      });
      profile = dbUser?.profile || null;
    } else if (profileIdCookie) {
      // Fallback by profile ID
      profile = await prisma.profile.findUnique({
        where: { id: profileIdCookie },
        include: {
          skillPassport: true,
          user: true,
        },
      });
      dbUser = profile?.user || null;
    }

    if (!dbUser && !profile) {
      return NextResponse.json({ error: "User/Profile not found" }, { status: 404 });
    }

    // Helper functions to unpack serialized bio if stored as JSON
    let unpackedBio = profile?.bio || "";
    let metadata: Record<string, any> = {};

    if (profile?.bio && profile.bio.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(profile.bio);
        unpackedBio = parsed.text || "";
        metadata = parsed;
      } catch (err) {
        // Fallback if not JSON
        unpackedBio = profile.bio;
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser?.id || profile?.userId,
        email: dbUser?.email || null,
        role: dbUser?.role || "JOB_SEEKER",
      },
      profile: profile ? {
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
        extractedFields: metadata.extractedFields || "",
        extractionConfidence: metadata.extractionConfidence || 0,
      } : null,
      passport: profile?.skillPassport ? {
        id: profile.skillPassport.id,
        profileId: profile.skillPassport.profileId,
        skills: profile.skillPassport.skills,
        readinessScore: profile.skillPassport.readinessScore,
        verificationLevel: profile.skillPassport.verificationLevel,
      } : null,
    });
  } catch (err: unknown) {
    console.error("Auth me error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
