// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass authentication checks for public shared Skill Passport links
  const isPublicPassport = pathname.startsWith("/passport/") && pathname.split("/").length === 3;
  if (isPublicPassport) {
    return NextResponse.next();
  }

  // Check if mock mode is active
  const isMockMode =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  let userId: string | undefined = undefined;
  let profileId: string | undefined = undefined;
  let role: string | undefined = undefined; // "JOB_SEEKER" or "EMPLOYER"

  let supabaseResponse = NextResponse.next({
    request: req,
  });

  if (isMockMode) {
    userId = req.cookies.get("pp_user_id")?.value;
    profileId = req.cookies.get("pp_profile_id")?.value;
    role = req.cookies.get("pp_role")?.value;
  } else {
    // Real Supabase Auth checks
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request: req,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      role = user.user_metadata?.role; // "JOB_SEEKER" or "EMPLOYER"
      profileId = user.user_metadata?.profile_id;
    }
  }

  // Define route protections
  const isCandidateRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/passport") ||
    pathname.startsWith("/coach") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/applications") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");

  const isRecruiterRoute = pathname.startsWith("/recruiter") && !pathname.startsWith("/recruiter/login");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isLoginRoute = pathname.startsWith("/login") || pathname.startsWith("/recruiter/login");

  // 1. If not authenticated, redirect to /login
  if (!userId && (isCandidateRoute || isRecruiterRoute || isOnboardingRoute)) {
    const roleParam = isRecruiterRoute ? "recruiter" : "candidate";
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("role", roleParam);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated
  if (userId) {
    // If onboarding is not completed (missing profile ID), redirect to onboarding
    if (!profileId && !isOnboardingRoute && !isLoginRoute && !pathname.startsWith("/api")) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Role verification
    if (role === "JOB_SEEKER" && isRecruiterRoute) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (role === "EMPLOYER" && isCandidateRoute) {
      return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
    }

    // If logged in and attempts to access login, redirect to respective dashboard
    if (isLoginRoute) {
      if (role === "EMPLOYER") {
        return NextResponse.redirect(new URL("/recruiter/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/passport/:path*",
    "/coach/:path*",
    "/jobs/:path*",
    "/applications/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/recruiter/:path*",
    "/login",
  ],
};
