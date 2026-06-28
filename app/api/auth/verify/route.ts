// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, role } = await req.json();
    if (!phone || !code || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isPlaceholder = 
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL;

    let userId: string;
    let userEmail: string | null = null;

    if (isPlaceholder) {
      // Mock validation fallback
      console.log(`[Supabase Auth Mock] Verifying OTP ${code} for phone ${phone}`);
      if (code !== "123456" && code !== "000000") {
        return NextResponse.json({ error: "Invalid OTP code (Use 123456 for testing)" }, { status: 400 });
      }
      // Generate deterministic UUID-like string from phone number
      const sanitizedPhone = phone.replace(/[^0-9]/g, "");
      userId = `usr-${sanitizedPhone || "mock-candidate"}`;
      userEmail = `${sanitizedPhone || "mock"}@placementpilot.ai`;
    } else {
      // Real Supabase verification
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: "sms",
      });

      if (error || !data.user) {
        console.error("Supabase verifyOtp error:", error?.message);
        return NextResponse.json({ error: error?.message || "Verification failed" }, { status: 400 });
      }

      userId = data.user.id;
      userEmail = data.user.email || null;
    }

    // Upsert User in PostgreSQL using Prisma
    const mappedRole = role === "recruiter" ? "EMPLOYER" : "JOB_SEEKER";
    const dbUser = await prisma.user.upsert({
      where: { id: userId },
      update: { role: mappedRole },
      create: {
        id: userId,
        email: userEmail,
        role: mappedRole,
      },
    });

    // Check if user has an associated profile
    const profile = await prisma.profile.findUnique({
      where: { userId: dbUser.id },
    });

    if (!isPlaceholder) {
      try {
        const { createClient } = await import("@/lib/supabase/server");
        const supabaseClient = await createClient();
        await supabaseClient.auth.updateUser({
          data: {
            role: mappedRole,
            profile_id: profile ? profile.id : null,
          },
        });
      } catch (err) {
        console.error("Failed to sync user metadata to Supabase in verify route:", err);
      }
    }

    const response = NextResponse.json({
      success: true,
      userExists: !!profile,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      },
      profile: profile ? {
        id: profile.id,
        fullName: profile.fullName,
      } : null,
    });

    // Set secure long-lived session cookies
    const oneYear = 60 * 60 * 24 * 365;
    response.cookies.set("pp_user_id", dbUser.id, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false, // Accessible to client-side auth-compat.tsx hooks
      sameSite: "lax",
    });
    response.cookies.set("pp_role", dbUser.role, {
      path: "/",
      maxAge: oneYear,
      httpOnly: false,
      sameSite: "lax",
    });

    if (profile) {
      response.cookies.set("pp_profile_id", profile.id, {
        path: "/",
        maxAge: oneYear,
        httpOnly: false,
        sameSite: "lax",
      });
      // Set NEXT_LOCALE to match their preferred language
      response.cookies.set("NEXT_LOCALE", profile.preferredLanguage, {
        path: "/",
        maxAge: oneYear,
        httpOnly: false,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err: unknown) {
    console.error("Auth verify error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
