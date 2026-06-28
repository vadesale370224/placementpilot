// app/api/profile/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, fullName, phone, preferredLanguage, languages, state, skills } = body;

    if (!userId || !fullName) {
      return NextResponse.json({ error: "userId and fullName are required" }, { status: 400 });
    }

    // Default serialize metadata into bio column
    const metadata = {
      text: "",
      collegeName: "",
      degree: "",
      branch: "",
      year: "",
      cgpa: "",
      preferredRole: "",
      preferredLocation: "",
      expectedSalary: "",
      employmentType: "",
      originalTranscript: "",
      extractedFields: "",
      extractionConfidence: 100,
    };
    const serializedBio = JSON.stringify(metadata);

    // 1. Create or update user role to JOB_SEEKER (Candidate)
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: { role: "JOB_SEEKER" },
      create: {
        id: userId,
        role: "JOB_SEEKER",
        email: phone ? `${phone}@placementpilot.ai` : null,
      },
    });

    // 2. Create Profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        fullName,
        phone,
        bio: serializedBio,
        preferredLanguage: preferredLanguage || "en",
        languages: languages || ["en"],
        state: state || "",
        isVerified: true,
      },
    });

    // 3. Create SkillPassport
    const mappedSkills = (skills || []).map((s: any) => {
      if (typeof s === "string") {
        return { name: s, proficiency: "Intermediate", status: "AI_VERIFIED" };
      }
      return {
        name: s.name,
        proficiency: s.proficiency || "Intermediate",
        status: s.status || "AI_VERIFIED",
      };
    });

    const passport = await prisma.skillPassport.create({
      data: {
        profileId: profile.id,
        skills: mappedSkills,
        readinessScore: 75.0,
        verificationLevel: "AI_VERIFIED",
      },
    });

    const response = NextResponse.json({
      success: true,
      profile,
      passport,
      user: dbUser,
    });

    // Set cookies as required by 4a
    const oneYear = 60 * 60 * 24 * 365;
    response.cookies.set("pp_profile_id", profile.id, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });
    response.cookies.set("pp_role", dbUser.role, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });

    // Sync with Supabase session user metadata if not in mock mode
    const isMockMode =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isMockMode) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        await supabase.auth.updateUser({
          data: {
            role: "JOB_SEEKER",
            profile_id: profile.id,
          },
        });
      } catch (err) {
        console.error("Failed to sync profile_id to Supabase metadata:", err);
      }
    }

    return response;
  } catch (err: any) {
    console.error("Create profile error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
