// Set to true to bypass Clerk entirely
export const BYPASS_CLERK = true;

export async function auth() {
  return {
    userId: "mock-user-id",
    sessionClaims: {},
    orgId: null,
    orgRole: null,
    orgSlug: null,
  };
}
