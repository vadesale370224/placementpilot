"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth-compat";
import { useTranslations } from "next-intl";
import { dbMock, MockProfile, MockSkillPassport } from "@/lib/dbMock";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [passport, setPassport] = useState<MockSkillPassport | null>(null);
  const [jobCount, setJobCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    const activeProfile = dbMock.getProfile();
    const activePassport = dbMock.getSkillPassport();

    if (!activeProfile) {
      router.push("/onboarding");
      return;
    }

    setProfile(activeProfile);
    setPassport(activePassport);
    setJobCount(dbMock.getJobListings().length);
    setSessionCount(dbMock.getInterviewSessions().length);
  }, [router]);

  if (!isLoaded || !profile || !passport) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const welcomeMessage = t("welcome", { name: profile.fullName });

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white font-sans overflow-hidden select-none">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
          {/* Welcome Hero banner */}
          <div className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              🧭
            </div>
            <div className="max-w-2xl space-y-3 relative z-10">
              <h2 className="text-3xl font-black tracking-tight">{welcomeMessage}</h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed font-semibold">
                Your Placement Pilot AI assistant is ready. Complete mock interviews with your AI coach to boost your Skill Passport readiness score and access top matches!
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
                <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest font-mono">Skill Passport</span>
                <h3 className="text-2xl font-black mt-1 text-violet-600 dark:text-violet-400 group-hover:text-cyan-500 transition-colors">
                  {passport.skills.length} Skills
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
                  Readiness: {passport.readinessScore}%
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
                  {jobCount} Matches
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
                  Based on location & language
                </span>
              </div>
              <span className="text-4xl transition-transform duration-300 group-hover:scale-115">💼</span>
            </div>

            <div 
              onClick={() => router.push("/coach")}
              className="glass-card rounded-3xl p-6 flex justify-between items-center cursor-pointer select-none group"
            >
              <div>
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest font-mono">Interview Coach</span>
                <h3 className="text-2xl font-black mt-1 text-cyan-600 dark:text-cyan-400 group-hover:text-violet-500 transition-colors">
                  {sessionCount} Sessions
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1 block">
                  Practice vocal answers now
                </span>
              </div>
              <span className="text-4xl transition-transform duration-300 group-hover:scale-115">🎙️</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}