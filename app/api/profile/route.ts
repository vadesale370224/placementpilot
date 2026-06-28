// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get("pp_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        skillPassport: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
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
  } catch (err: unknown) {
    console.error("Fetch profile error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.cookies.get("pp_user_id")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      bio,
      companyName,
      preferredLanguage,
      languages,
      state,
      // Metadata fields to serialize in bio
      collegeName,
      degree,
      branch,
      year,
      cgpa,
      preferredRole,
      preferredLocation,
      expectedSalary,
      employmentType,
      originalTranscript,
      extractedFields,
      extractionConfidence,
    } = body;

    if (!fullName) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    // Construct metadata object to serialize in bio
    const metadata = {
      text: bio || "",
      collegeName: collegeName || "",
      degree: degree || "",
      branch: branch || "",
      year: year || "",
      cgpa: cgpa || "",
      preferredRole: preferredRole || "",
      preferredLocation: preferredLocation || "",
      expectedSalary: expectedSalary || "",
      employmentType: employmentType || "",
      originalTranscript: originalTranscript || "",
      extractedFields: extractedFields || "",
      extractionConfidence: extractionConfidence || 0,
    };

    const serializedBio = JSON.stringify(metadata);

    // Upsert Profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        fullName,
        phone,
        bio: serializedBio,
        companyName,
        preferredLanguage: preferredLanguage || "en",
        languages: languages || ["en"],
        state,
        isVerified: true,
      },
      create: {
        userId,
        fullName,
        phone,
        bio: serializedBio,
        companyName,
        preferredLanguage: preferredLanguage || "en",
        languages: languages || ["en"],
        state,
        isVerified: true,
      },
    });

    // Create a default SkillPassport if it doesn't exist
    let passport = await prisma.skillPassport.findUnique({
      where: { profileId: profile.id },
    });

    if (!passport) {
      // Map any extracted skills passed during onboarding
      let initialSkills: any[] = [];
      if (body.skills) {
        initialSkills = body.skills;
      }
      
      passport = await prisma.skillPassport.create({
        data: {
          profileId: profile.id,
          skills: initialSkills,
          readinessScore: 75.0, // default starting score
          verificationLevel: "AI_VERIFIED",
        },
      });
    } else if (body.skills) {
      // Update skills if they are passed
      passport = await prisma.skillPassport.update({
        where: { profileId: profile.id },
        data: {
          skills: body.skills,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      profile,
      passport,
    });

    // Set pp_profile_id cookie
    const oneYear = 60 * 60 * 24 * 365;
    response.cookies.set("pp_profile_id", profile.id, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });

    if (preferredLanguage) {
      response.cookies.set("NEXT_LOCALE", preferredLanguage, {
        path: "/",
        maxAge: oneYear,
        httpOnly: false,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err: unknown) {
    console.error("Save profile error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
