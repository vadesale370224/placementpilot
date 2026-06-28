// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear cookies by setting maxAge: 0 or blanking them
    response.cookies.set("pp_user_id", "", { path: "/", maxAge: 0 });
    response.cookies.set("pp_profile_id", "", { path: "/", maxAge: 0 });
    response.cookies.set("pp_role", "", { path: "/", maxAge: 0 });

    return response;
  } catch (err: unknown) {
    console.error("Auth logout error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
