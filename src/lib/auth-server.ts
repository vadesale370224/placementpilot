import { cookies } from "next/headers";

// Set to true to bypass Clerk entirely
export const BYPASS_CLERK = true;

export async function auth() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("pp_profile_id")?.value || "temp-guest-id";
  return {
    userId,
    sessionClaims: {},
    orgId: null,
    orgRole: null,
    orgSlug: null,
  };
}

