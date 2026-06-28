// app/api/auth/preload-demo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const demoUserId = "usr-demo-iti";
    const demoProfileId = "prof-demo-iti";
    const demoPassportId = "pass-demo-iti";

    // 1. Create/upsert Demo User
    const user = await prisma.user.upsert({
      where: { id: demoUserId },
      update: { role: "JOB_SEEKER" },
      create: {
        id: demoUserId,
        email: "rahul.ghadge@example.com",
        role: "JOB_SEEKER",
      },
    });

    // 2. Clear old demo sessions & applications to make it a clean slate
    await prisma.interviewSession.deleteMany({
      where: { profileId: demoProfileId },
    });
    await prisma.application.deleteMany({
      where: { jobSeekerId: demoProfileId },
    });
    await prisma.matchResult.deleteMany({
      where: { profileId: demoProfileId },
    });

    // 3. Serialized metadata for Profile
    const profileMetadata = {
      text: "मी एक आयटीआय इलेक्ट्रिशियन आहे. मला वायरिंग, इलेक्ट्रिकल मेंटेनन्स आणि सेफ्टीचे ज्ञान आहे. मी मराठी आणि हिंदी दोन्ही बोलू शकतो.",
      collegeName: "Government ITI Nashik College",
      degree: "ITI Certification",
      branch: "Electrical / Electrician",
      year: "2026",
      cgpa: "8.2",
      preferredRole: "ITI Electrician",
      preferredLocation: "Nashik, Maharashtra",
      expectedSalary: "₹20,000 - ₹25,000 / month",
      employmentType: "Full-time",
      onboardingCompleted: true,
    };

    // 4. Create/upsert Profile
    const profile = await prisma.profile.upsert({
      where: { id: demoProfileId },
      update: {
        fullName: "Rahul Ghadge (राहुल घाडगे)",
        phone: "+91 98765 43210",
        bio: JSON.stringify(profileMetadata),
        preferredLanguage: "mr",
        languages: ["mr", "hi"],
        state: "Maharashtra",
        isVerified: true,
      },
      create: {
        id: demoProfileId,
        userId: demoUserId,
        fullName: "Rahul Ghadge (राहुल घाडगे)",
        phone: "+91 98765 43210",
        bio: JSON.stringify(profileMetadata),
        preferredLanguage: "mr",
        languages: ["mr", "hi"],
        state: "Maharashtra",
        isVerified: true,
      },
    });

    // 5. Create/upsert SkillPassport
    const demoSkills = [
      { name: "Wiring", proficiency: "Expert", status: "AI_VERIFIED" },
      { name: "Electrical Maintenance", proficiency: "Expert", status: "AI_VERIFIED" },
      { name: "Safety Protocols", proficiency: "Intermediate", status: "SELF_REPORTED" }
    ];

    await prisma.skillPassport.upsert({
      where: { profileId: demoProfileId },
      update: {
        skills: demoSkills,
        readinessScore: 75.0,
        verificationLevel: "AI_VERIFIED",
      },
      create: {
        id: demoPassportId,
        profileId: demoProfileId,
        skills: demoSkills,
        readinessScore: 75.0,
        verificationLevel: "AI_VERIFIED",
      },
    });

    const response = NextResponse.json({
      success: true,
      profileId: demoProfileId,
      message: "Demo user loaded successfully",
    });

    // Set secure long-lived session cookies for the demo user
    const oneYear = 60 * 60 * 24 * 365;
    response.cookies.set("pp_user_id", demoUserId, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });
    response.cookies.set("pp_profile_id", demoProfileId, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });
    response.cookies.set("pp_role", "JOB_SEEKER", {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });
    response.cookies.set("NEXT_LOCALE", "mr", {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    console.error("Demo preload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
