// src/lib/api.ts

export const api = {
  async getProfile() {
    const res = await fetch("/api/profile");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async saveProfile(profileData: any) {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getSkillPassport() {
    const res = await fetch("/api/passport");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async saveSkillPassport(passportData: any) {
    const res = await fetch("/api/passport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passportData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getJobListings() {
    const res = await fetch("/api/jobs");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getApplications() {
    const res = await fetch("/api/jobs/applications");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async applyJob(jobId: string) {
    const res = await fetch("/api/jobs/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getJobMatches() {
    const res = await fetch("/api/jobs/match");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getInterviewSessions() {
    const res = await fetch("/api/interview");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async saveInterviewSession(sessionData: { topic: string; feedback: any; transcript?: string }) {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sessionData),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async login(phone: string, role: string) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role }),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!res.ok) {
        let errMsg = "";
        try {
          const json = await res.json();
          errMsg = json.error || json.message || "Failed to send OTP.";
        } catch {
          errMsg = await res.text() || "Failed to send OTP.";
        }
        const error = new Error(errMsg);
        (error as any).status = res.status;
        throw error;
      }
      return res.json();
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === "AbortError") {
        const error = new Error("Request timed out.");
        (error as any).status = 408;
        throw error;
      }
      if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("unreachable"))) {
        const error = new Error("Server unavailable.");
        (error as any).status = 503;
        throw error;
      }
      throw err;
    }
  },

  async verifyOtp(phone: string, code: string, role: string) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, role }),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!res.ok) {
        let errMsg = "";
        try {
          const json = await res.json();
          errMsg = json.error || json.message || "Verification failed";
        } catch {
          errMsg = await res.text() || "Verification failed";
        }
        const error = new Error(errMsg);
        (error as any).status = res.status;
        throw error;
      }
      return res.json();
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === "AbortError") {
        const error = new Error("Request timed out.");
        (error as any).status = 408;
        throw error;
      }
      if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError") || err.message.includes("unreachable"))) {
        const error = new Error("Server unavailable.");
        (error as any).status = 503;
        throw error;
      }
      throw err;
    }
  },

  async logout() {
    const isMockMode =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (!isMockMode) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Supabase signOut error:", err);
      }
    }

    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (!res.ok) throw new Error("Logout failed");

    // Clear cookies client side as well for safety
    if (typeof document !== "undefined") {
      document.cookie = "pp_user_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "pp_profile_id=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = "pp_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }

    return res.json();
  },

  async preloadDemoUser() {
    const res = await fetch("/api/auth/preload-demo", { method: "POST" });
    if (!res.ok) throw new Error("Preload failed");
    return res.json();
  },
};
