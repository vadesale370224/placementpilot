// app/api/profile/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    let userId = "";

    const isMockMode =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isMockMode) {
      userId = req.cookies.get("pp_user_id")?.value || "";
    } else {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || "";
      } catch (err) {
        console.error("Failed to read Supabase user in profile/me:", err);
      }
    }

    if (!userId) {
      return NextResponse.json({ success: true, profile: null, passport: null });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        skillPassport: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ success: true, profile: null, passport: null });
    }

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
        extractedFields: metadata.extractedFields || "",
        extractionConfidence: metadata.extractionConfidence || 0,
      },
      passport: profile.skillPassport ? {
        id: profile.skillPassport.id,
        profileId: profile.skillPassport.profileId,
        skills: profile.skillPassport.skills,
        readinessScore: profile.skillPassport.readinessScore,
        verificationLevel: profile.skillPassport.verificationLevel,
      } : null,
    });
  } catch (err: any) {
    console.error("Fetch profile/me error:", err);
    // Graceful fallback to empty state instead of crashing
    return NextResponse.json({ success: true, profile: null, passport: null });
  }
}
