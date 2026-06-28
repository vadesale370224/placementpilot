"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth-compat";
import { useTranslations } from "next-intl";
import { MockProfile, MockSkillPassport } from "@/lib/dbMock";
import { api } from "@/lib/api";
import AnalyticsDashboard from "@/components/ui/AnalyticsDashboard";
import { calculateProfileCompletion, getProfileCompletionBadge } from "@/lib/profile-utils";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const { isLoaded } = useUser();

  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [passport, setPassport] = useState<MockSkillPassport | null>(null);
  const [jobCount, setJobCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const profileRes = await api.getProfile();
        if (!profileRes || !profileRes.profile) {
          router.push("/onboarding");
          return;
        }

        setProfile(profileRes.profile);
        setPassport(profileRes.passport);

        const jobsRes = await api.getJobListings().catch(() => ({ jobs: [] }));
        setJobCount(jobsRes.jobs?.length || 0);

        const sessionsRes = await api.getInterviewSessions().catch(() => ({ sessions: [] }));
        setSessionCount(sessionsRes.sessions?.length || 0);
      } catch (err) {
        console.error("Dashboard load error:", err);
        router.push("/onboarding");
      }
    }

    loadDashboardData();
  }, [router]);

  if (!isLoaded || !profile || !passport) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const welcomeMessage = t("welcome", { name: profile.fullName });
  const completionPercent = calculateProfileCompletion(profile, passport);
  const badge = getProfileCompletionBadge(completionPercent);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Welcome Hero banner */}
      <div className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
          🧭
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight">{welcomeMessage}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-auto border ${
              completionPercent < 50 
                ? "bg-red-500/25 text-red-200 border-red-500/40" 
                : completionPercent <= 80 
                ? "bg-yellow-500/25 text-yellow-200 border-yellow-500/40" 
                : "bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
            }`}>
              {badge.text} ({completionPercent}%)
            </span>
          </div>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed font-semibold">
            {t("readyText")}
          </p>
        </div>
      </div>

      {/* Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div 
          onClick={() => router.push("/passport")}
          className="glass-card rounded-3xl p-6 flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest font-mono">{tNav("passport")}</span>
            <h3 className="text-2xl font-black mt-1 text-violet-600 dark:text-violet-400 group-hover:text-cyan-500 transition-colors">
              {t("skillsCount", { count: passport.skills.length })}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
              {t("readiness", { score: passport.readinessScore })}
            </span>
          </div>
          <span className="text-4xl transition-transform duration-300 group-hover:scale-115">🪪</span>
        </div>

        <div 
          onClick={() => router.push("/jobs")}
          className="glass-card rounded-3xl p-6 flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-mono">{t("recentMatches")}</span>
            <h3 className="text-2xl font-black mt-1 text-blue-600 dark:text-blue-400 group-hover:text-cyan-500 transition-colors">
              {t("matchesCount", { count: jobCount })}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
              {t("basedOn")}
            </span>
          </div>
          <span className="text-4xl transition-transform duration-300 group-hover:scale-115">💼</span>
        </div>

        <div 
          onClick={() => router.push("/coach")}
          className="glass-card rounded-3xl p-6 flex justify-between items-center cursor-pointer select-none group"
        >
          <div>
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono">{tNav("coach")}</span>
            <h3 className="text-2xl font-black mt-1 text-cyan-600 dark:text-cyan-400 group-hover:text-violet-500 transition-colors">
              {t("sessionsCount", { count: sessionCount })}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
              {t("practiceVocal")}
            </span>
          </div>
        </div>
      </div>

      {/* ML Intelligence Layer Diagnostics */}
      <AnalyticsDashboard />
    </main>
  );
}