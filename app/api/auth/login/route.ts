// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const isPlaceholder = 
      process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder") ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (isPlaceholder) {
      console.log(`[Supabase Auth Mock] OTP requested for phone: ${phone}`);
      return NextResponse.json({ 
        success: true, 
        message: "OTP sent (mock mode)", 
        mock: true 
      });
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.startsWith("+") ? phone : `+91${phone}`,
    });

    if (error) {
      console.error("Supabase signInWithOtp error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (err: unknown) {
    console.error("Auth login error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
