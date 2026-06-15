"use client";

import { UserButton } from "@/lib/auth-compat";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { setLocale } from "@/lib/i18n";
import { useState } from "react";
import { dbMock } from "@/lib/dbMock";

export default function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [showJudgeConsole, setShowJudgeConsole] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocale(e.target.value);
  };

  const handlePreloadDemo = () => {
    dbMock.preloadDemoData();
    document.cookie = `NEXT_LOCALE=mr; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `pp_profile_id=prof-demo-iti; path=/; max-age=31536000; SameSite=Lax`;
    setShowJudgeConsole(false);
    window.location.href = "/passport";
  };

  const handleClearData = () => {
    dbMock.clearAll();
    document.cookie = "pp_profile_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    setShowJudgeConsole(false);
    window.location.href = "/onboarding";
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200/50 dark:border-violet-950/20 shadow-sm backdrop-blur-md select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 mr-3 rounded-xl bg-gray-50/50 dark:bg-violet-950/5 hover:bg-gray-100 dark:hover:bg-violet-950/15 border border-gray-200 dark:border-violet-950/20 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                title="Toggle Navigation"
              >
                ☰
              </button>
            )}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 hover:opacity-95 transition-opacity">
              <span className="text-xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                PlacementPilot 🧭
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Judge Demo Console Trigger */}
            <button
              onClick={() => setShowJudgeConsole(!showJudgeConsole)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 text-white font-extrabold rounded-full text-[11px] sm:text-xs shadow-lg shadow-violet-500/10 hover:scale-[1.03] active:scale-[0.97] transition flex items-center gap-1 cursor-pointer"
            >
              🚀 Judge Console
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold hidden sm:inline">
                {t("language")}:
              </span>
              <select
                value={locale}
                onChange={handleLanguageChange}
                className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-950 dark:text-white text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-violet-500 p-1 sm:p-1.5 font-bold cursor-pointer transition"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <UserButton />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Judge Console Modal overlay */}
      {showJudgeConsole && (
        <div className="absolute top-18 right-4 w-80 sm:w-96 glass-panel border border-violet-500/20 dark:border-violet-500/30 rounded-3xl shadow-2xl p-6 text-gray-900 dark:text-white space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-850 pb-3">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-450">
              🧭 Judge Demo Console
            </h3>
            <button
              onClick={() => setShowJudgeConsole(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
            Run the preset candidate journey to test the Placement Pilot platform. Follow the demo steps.
          </p>

          <div className="grid grid-cols-2 gap-3 pb-1">
            <button
              onClick={handlePreloadDemo}
              className="py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-750 hover:to-blue-750 text-white font-bold rounded-2xl text-xs shadow-md transition cursor-pointer"
            >
              🚀 Preload Demo User
            </button>
            <button
              onClick={handleClearData}
              className="py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-250 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-xs transition cursor-pointer"
            >
              🧹 Reset / Clear
            </button>
          </div>

          {/* Steps Guideline */}
          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
            <span className="font-black text-gray-400 uppercase tracking-wider block text-[10px]">
              Preset Demo User Journey Checklist
            </span>
            <div className="space-y-2 font-medium">
              <div className="flex gap-2">
                <span className="text-violet-500 font-black">1.</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Click <strong>Preload Demo User</strong>. This preloads <strong>Rahul Ghadge</strong> (ITI Electrician, Maharashtra, Marathi preferred).
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-500 font-black">2.</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Inspect the **Skill Passport** card with verified skills and a starting readiness score of <strong>75%</strong>.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-500 font-black">3.</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Check **Job Matches**. See <strong>Shree Electricals</strong> at <strong>95% match</strong> with rich AI compatibility reasons.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-500 font-black">4.</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Navigate to **Interview Coach** and start the Electrician session. Click &ldquo;Speak Answer&rdquo; to see technical feedback.
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-500 font-black">5.</span>
                <span className="text-gray-600 dark:text-gray-300">
                  Click &ldquo;Finish&rdquo; to view your <strong>Readiness Score</strong> boost to <strong>85%</strong>!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}