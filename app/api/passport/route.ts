// app/api/passport/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "No profile session found" }, { status: 400 });
    }

    const passport = await prisma.skillPassport.findUnique({
      where: { profileId },
    });

    if (!passport) {
      return NextResponse.json({ error: "Skill passport not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, passport });
  } catch (err: unknown) {
    console.error("Fetch passport error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profileId = req.cookies.get("pp_profile_id")?.value;
    if (!profileId) {
      return NextResponse.json({ error: "No profile session found" }, { status: 400 });
    }

    const body = await req.json();
    const { skills, readinessScore, verificationLevel } = body;

    const updateData: any = {};
    if (skills !== undefined) updateData.skills = skills;
    if (readinessScore !== undefined) updateData.readinessScore = parseFloat(readinessScore);
    if (verificationLevel !== undefined) updateData.verificationLevel = verificationLevel;

    const passport = await prisma.skillPassport.update({
      where: { profileId },
      data: updateData,
    });

    return NextResponse.json({ success: true, passport });
  } catch (err: unknown) {
    console.error("Save passport error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
