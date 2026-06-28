"use client";

import { useState } from "react";
import { setLocale } from "@/lib/i18n";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const currentLocale = useLocale();
  const [notifsEnabled, setNotifsEnabled] = useState(true);

  const handleLanguageChange = (lang: string) => {
    setLocale(lang);
    api.saveProfile({ preferredLanguage: lang }).catch(() => {});
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to log out and clear your session?")) {
      api.logout().then(() => {
        window.location.href = "/";
      });
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn max-w-3xl mx-auto">
      <div className="border-b border-gray-250/50 dark:border-violet-950/20 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-gray-550 dark:text-gray-400 mt-1 font-semibold text-sm">
          Customize your dashboard experience, language configurations, and preferences.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest font-mono">App Configuration</h3>
          
          <div className="space-y-4 text-sm font-semibold divide-y divide-white/5">
            <div className="flex justify-between items-center py-4 first:pt-0">
              <div className="space-y-1">
                <span className="text-white block">Language Preference</span>
                <p className="text-xs text-gray-500 font-semibold">Change local content labels translation.</p>
              </div>
              <select
                value={currentLocale}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-900 border border-white/10 rounded-xl text-xs py-1.5 px-3 font-extrabold cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <div className="flex justify-between items-center py-4">
              <div className="space-y-1">
                <span className="text-white block">Theme Setting</span>
                <p className="text-xs text-gray-500 font-semibold">Toggle dark and light view modes.</p>
              </div>
              <span className="text-xs font-black px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/25 rounded-full uppercase">
                DARK MODE
              </span>
            </div>

            <div className="flex justify-between items-center py-4">
              <div className="space-y-1">
                <span className="text-white block">Notification Alerts</span>
                <p className="text-xs text-gray-500 font-semibold">Enable or disable SMS / email push reminders.</p>
              </div>
              <button
                onClick={() => setNotifsEnabled(!notifsEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  notifsEnabled 
                    ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" 
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {notifsEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="flex justify-between items-center py-4 last:pb-0">
              <div className="space-y-1">
                <span className="text-red-500 block">Dangerous Actions</span>
                <p className="text-xs text-gray-500 font-semibold">Purge all local files and reset application state.</p>
              </div>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-black rounded-xl transition"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
