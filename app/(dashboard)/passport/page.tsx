"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MockProfile, MockSkillPassport, MockSkill } from "@/lib/dbMock";
import { calculateProfileCompletion, getProfileCompletionBadge } from "@/lib/profile-utils";
import { api } from "@/lib/api";
import QRCode from "qrcode";

export default function SkillPassportPage() {
  const t = useTranslations("passport");
  const tNav = useTranslations("nav");
  const router = useRouter();

  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [passport, setPassport] = useState<MockSkillPassport | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [showAddForm, setShowAddForm] = useState(false);

  const [shareSuccess, setShareSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    async function loadPassport() {
      try {
        const res = await api.getProfile();
        if (!res || !res.profile) {
          router.push("/onboarding");
          return;
        }
        setProfile(res.profile);
        setPassport(res.passport);
      } catch (err) {
        console.error("Passport load error:", err);
        router.push("/onboarding");
      }
    }
    loadPassport();
  }, [router]);

  useEffect(() => {
    if (profile) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
      const url = `${appUrl}/passport/${profile.id}`;
      QRCode.toDataURL(url, { margin: 1, width: 256 })
        .then((dataUrl) => setQrCodeUrl(dataUrl))
        .catch((err) => console.error("QR Code generation failed", err));
    }
  }, [profile]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !passport) return;

    const updatedSkills: MockSkill[] = [
      ...passport.skills,
      {
        name: newSkillName.trim(),
        proficiency: newSkillLevel,
        status: "SELF_REPORTED"
      }
    ];

    const updatedScore = Math.min(100, parseFloat((passport.readinessScore + 1.5).toFixed(1)));

    api.saveSkillPassport({
      skills: updatedSkills,
      readinessScore: updatedScore
    }).then((res) => {
      if (res.success && res.passport) {
        setPassport(res.passport);
      }
    }).catch((err) => {
      console.error("Failed to save skill passport:", err);
    });

    setNewSkillName("");
    setShowAddForm(false);
  };

  const getVerificationBadge = (status: MockSkill["status"]) => {
    switch (status) {
      case "EMPLOYER_VERIFIED":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50";
      case "INSTITUTE_VERIFIED":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50";
      case "AI_VERIFIED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50";
      default:
        return "bg-gray-150 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  if (!profile || !passport) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Circular ring variables
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (passport.readinessScore / 100) * circumference;

  const completionPercent = calculateProfileCompletion(profile, passport);
  const badge = getProfileCompletionBadge(completionPercent);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-250/50 dark:border-violet-950/20 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <p className="text-gray-550 dark:text-gray-400 font-semibold text-sm">
              {t("subtitle")}
            </p>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
              completionPercent < 50 
                ? "bg-red-500/20 text-red-400 border-red-500/30" 
                : completionPercent <= 80 
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}>
              {badge.text} ({completionPercent}%)
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/coach")}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-750 hover:to-blue-750 text-white font-bold rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            {t("mockInterviewBtn")}
          </button>
          <button
            onClick={() => router.push("/jobs")}
            className="px-5 py-2.5 bg-gray-105 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-950 dark:text-gray-200 font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            {t("jobsBtn")}
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: ID card & Score */}
        <div className="lg:col-span-1 space-y-6">
          {/* Premium Holographic Skill Passport Card */}
          <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950 rounded-3xl border border-violet-500/20 shadow-2xl p-6 text-white space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_rgba(124,58,237,0.25)] transition-all duration-500">
            {/* Diagonal Holographic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl" />
            
            {/* Card Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px]">🇮🇳</span>
                <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase font-mono">
                  NATIONAL SKILL PASSPORT / राष्ट्रीय कौशल पासपोर्ट
                </span>
              </div>
              <span className="text-[8px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                VERIFIED
              </span>
            </div>

            {/* Card Main */}
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-inner border border-white/20 relative">
                {profile.fullName.charAt(0)}
                {/* Micro chip design */}
                <div className="absolute bottom-1 right-1 w-3.5 h-3 bg-amber-400 rounded-sm border border-amber-600/40 flex items-center justify-center">
                  <div className="w-1.5 h-1 bg-amber-600/60 rounded-sm" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h2 className="font-extrabold text-lg tracking-tight leading-none bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  {profile.fullName}
                </h2>
                <span className="text-[10px] text-blue-300 font-mono tracking-wider block">
                  PASSPORT ID: PP-{profile.id.toUpperCase()}
                </span>
              </div>
            </div>

            {/* QR and Metadata split */}
            <div className="flex justify-between items-end pt-2 gap-4">
              <div className="space-y-2.5 text-xs flex-1">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">State / राज्य</span>
                    <span className="font-bold text-white text-sm">{profile.state}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Status / दर्जा</span>
                    <span className="font-bold text-amber-400 text-xs">GOLD TIER</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Languages / भाषा</span>
                  <div className="flex gap-1.5 mt-1">
                    {profile.languages.map((lang) => (
                      <span key={lang} className="text-[9px] px-2 py-0.5 bg-white/10 rounded font-black uppercase tracking-wider text-slate-200">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center select-none shadow">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
                )}
              </div>
            </div>

            {/* Footer Dates */}
            <div className="flex justify-between items-center text-[9px] font-mono text-slate-450 border-t border-white/5 pt-3">
              <span>ISSUED: 06/2026</span>
              <span>EXPIRY: PERMANENT</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setDownloadSuccess(true);
                setTimeout(() => setDownloadSuccess(false), 2000);
              }}
              className="flex-1 py-3 bg-violet-600/10 hover:bg-violet-600 text-violet-650 dark:text-violet-400 hover:text-white border border-violet-500/30 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-lg shadow-violet-500/5"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{downloadSuccess ? t("downloadedBtn") : t("downloadBtn")}</span>
            </button>
            <button
              onClick={() => {
                if (profile) {
                  navigator.clipboard.writeText(`${window.location.origin}/passport/${profile.id}`);
                }
                setShareSuccess(true);
                setTimeout(() => setShareSuccess(false), 2000);
              }}
              className="flex-1 py-3 bg-cyan-500/10 hover:bg-cyan-505 text-cyan-600 dark:text-cyan-400 hover:text-slate-905 dark:hover:text-slate-950 border border-cyan-500/30 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shadow-lg shadow-cyan-500/5"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 10.742l4.636-2.318a3 3 0 10-.224-2.614l-4.636 2.318a3 3 0 100 4.195l4.636 2.318a3 3 0 10.224-2.614l-4.636-2.318z" />
              </svg>
              <span>{shareSuccess ? t("sharedBtn") : t("shareBtn")}</span>
            </button>
          </div>

          {/* Hero Readiness Score Card */}
          <div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200">{t("readinessScore")}</h3>
              <p className="text-[11px] text-gray-550 dark:text-gray-400 font-medium px-4">{t("readinessScoreHelp")}</p>
            </div>
            
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center select-none">
              <svg className="w-36 h-36">
                <defs>
                  <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle
                  className="text-gray-150 dark:text-violet-950/20"
                  strokeWidth={stroke}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius + stroke}
                  cy={radius + stroke}
                />
                <circle
                  stroke="url(#scoreRingGradient)"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + " " + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius + stroke}
                  cy={radius + stroke}
                  transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {passport.readinessScore}%
                </span>
                <span className="text-[9px] font-black text-emerald-500 tracking-wider uppercase mt-0.5">
                  {t("jobReady")}
                </span>
              </div>
            </div>

            <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-500 border border-emerald-500/20">
              {t("goldPartner")}
            </div>
          </div>
        </div>

        {/* Right Column: Skills Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-xl bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">
                {t("skillsSection")}
              </h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-sm font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                {showAddForm ? t("cancel") : `➕ ${t("addSkill")}`}
              </button>
            </div>

            {/* Add Skill Form */}
            {showAddForm && (
              <form onSubmit={handleAddSkill} className="p-4 bg-white/50 dark:bg-black/10 border border-gray-200 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row gap-4 items-end animate-fadeIn">
                <div className="flex-1 flex flex-col gap-1.5 w-full">
                  <span className="text-[10px] font-black text-gray-500 uppercase font-mono">{t("skillNameLabel")}</span>
                  <input
                    type="text"
                    required
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder={t("skillNamePlaceholder")}
                    className="p-2.5 bg-white dark:bg-gray-855 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-full sm:w-44">
                  <span className="text-[10px] font-black text-gray-500 uppercase font-mono">{t("proficiencyLabel")}</span>
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className="p-2.5 bg-white dark:bg-gray-855 border border-gray-200 dark:border-gray-750 rounded-xl text-sm font-bold cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-xl text-sm shadow cursor-pointer w-full sm:w-auto"
                >
                  {t("add")}
                </button>
              </form>
            )}

            {/* Skills list */}
            <div className="space-y-4">
              {passport.skills.length === 0 ? (
                <p className="text-gray-550 text-center py-8">{t("noSkillsYet")}</p>
              ) : (
                passport.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/40 dark:bg-black/10 border border-gray-200/50 dark:border-gray-850/60 rounded-2xl hover:border-violet-300 dark:hover:border-violet-900 transition-all gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🛠️</span>
                      <div>
                        <h4 className="font-extrabold text-base text-gray-900 dark:text-white">{skill.name}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                          Level: {skill.proficiency}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider font-mono">
                        {t("verificationLevel")}:
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getVerificationBadge(skill.status)}`}>
                        {t(`status.${skill.status}`)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
