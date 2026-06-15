"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { dbMock, MockProfile, MockSkillPassport, MockJobListing, MockApplication } from "@/lib/dbMock";

interface EnrichedJobMatch {
  job: MockJobListing;
  score: number;
  skillsMatched: string[];
  missingSkills: string[];
  languagesMatched: string[];
  missingLanguages: string[];
  stateMatch: boolean;
  explanation: string;
  isApplied: boolean;
}

export default function JobMatchesPage() {
  const t = useTranslations("jobs");
  const router = useRouter();

  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [passport, setPassport] = useState<MockSkillPassport | null>(null);
  const [matches, setMatches] = useState<EnrichedJobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const activeProfile = dbMock.getProfile();
    const activePassport = dbMock.getSkillPassport();

    if (!activeProfile || !activePassport) {
      router.push("/onboarding");
      return;
    }

    setProfile(activeProfile);
    setPassport(activePassport);

    const apps = dbMock.getApplications();
    setAppliedJobIds(apps.map(a => a.jobId));

    const jobs = dbMock.getJobListings();
    const computedMatches: EnrichedJobMatch[] = jobs.map((job) => {
      const userSkills = activePassport.skills.map(s => s.name.toLowerCase());
      const skillsMatched = job.requirements.filter(req => 
        userSkills.some(us => us.includes(req.toLowerCase()) || req.toLowerCase().includes(us))
      );
      const missingSkills = job.requirements.filter(req => !skillsMatched.includes(req));

      const userLangs = activeProfile.languages.map(l => l.toLowerCase());
      const languagesMatched = job.requiredLanguages.filter(lang => 
        userLangs.includes(lang.toLowerCase())
      );
      const missingLanguages = job.requiredLanguages.filter(lang => !languagesMatched.includes(lang));

      const stateMatch = job.location.toLowerCase().includes(activeProfile.state.toLowerCase()) || 
                         activeProfile.state.toLowerCase().includes(job.location.toLowerCase()) ||
                         activeProfile.state === "Maharashtra" && (job.location === "Mumbai" || job.location === "Pune" || job.location === "Nagpur");

      let skillScore = job.requirements.length > 0 ? (skillsMatched.length / job.requirements.length) * 50 : 50;
      let langScore = job.requiredLanguages.length > 0 ? (languagesMatched.length / job.requiredLanguages.length) * 30 : 30;
      let locationScore = stateMatch ? 20 : 5;
      const finalScore = Math.round(skillScore + langScore + locationScore);

      const langNames = { en: "English", hi: "Hindi", mr: "Marathi" } as any;
      const matchedLangList = languagesMatched.map(l => langNames[l] || l).join(", ");

      let explanation = "";
      if (activeProfile.preferredLanguage === "hi") {
        explanation = `कौशल मिलान: आपकी प्रोफ़ाइल इस नौकरी के लिए आवश्यक कौशल (${skillsMatched.join(", ") || "बुनियादी कौशल"}) से मेल खाती है। ${missingSkills.length > 0 ? "हम सुझाव देते हैं कि आप " + missingSkills.join(", ") + " के लिए थोड़ा और अभ्यास करें।" : "सभी आवश्यक कौशल मौजूद हैं।"}\n`;
        explanation += `भाषा संगतता: आप कंपनी की आवश्यकता के अनुरूप ${matchedLangList || "आवश्यक"} भाषा बोलते हैं, जो टीम के साथ बातचीत करने में सहायक होगी।\n`;
        explanation += `स्थानीय संरेखण: आपकी प्रोफ़ाइल का राज्य (${activeProfile.state}) और नौकरी का स्थान (${job.location}) मेल खाते हैं, जिससे आपको काम शुरू करने में आसानी होगी।`;
      } else if (activeProfile.preferredLanguage === "mr") {
        explanation = `कौशल्य जुळणी: ${skillsMatched.join(", ") || "मूलभूत कौशल्ये"} या आवश्यक कौशल्य गरजांशी तुमची प्रोफाइल जुळते. ${missingSkills.length > 0 ? "अधिक चांगल्या संधीसाठी " + missingSkills.join(", ") + " वर सराव शिफारसित आहे." : "सर्व आवश्यक कौशल्ये जुळली आहेत."}\n`;
        explanation += `भाषा अनुकूलता: तुम्ही बोलत असलेली भाषा (${matchedLangList || "आवश्यक"}) ही कंपनीच्या कामासाठी अत्यंत योग्य आहे.\n`;
        explanation += `स्थान संरेखण: Marathi भाषिक उमेदवारांसाठी तुमचे राज्य (${activeProfile.state}) आणि कामाचे ठिकाण (${job.location}) जुळत असल्याने स्थानिक प्रवासासाठी अनुकूल आहे.`;
      } else {
        explanation = `Skill Alignment: Your capabilities in ${skillsMatched.join(", ") || "basic skills"} align with the job criteria. ${missingSkills.length > 0 ? "Focus on practicing " + missingSkills.join(", ") + " in the coach." : "All skill requirements matched."}\n`;
        explanation += `Language Compatibility: Your spoken languages (${matchedLangList || "required"}) satisfy the company communication requirements.\n`;
        explanation += `Geographic Proximity: Both your registered state (${activeProfile.state}) and the job location (${job.location}) are highly compatible.`;
      }

      return {
        job,
        score: finalScore,
        skillsMatched,
        missingSkills,
        languagesMatched,
        missingLanguages,
        stateMatch,
        explanation,
        isApplied: apps.some(a => a.jobId === job.id)
      };
    });

    computedMatches.sort((a, b) => b.score - a.score);
    setMatches(computedMatches);
    setLoading(false);
  }, [router]);

  const handleApply = (jobId: string) => {
    if (!profile) return;

    const newApp: MockApplication = {
      id: "app-" + Math.random().toString(36).substring(2, 9),
      jobId,
      jobSeekerId: profile.id,
      status: "PENDING",
      createdAt: new Date().toISOString()
    };
    dbMock.saveApplication(newApp);

    setAppliedJobIds(prev => [...prev, jobId]);
    
    setMatches(prev => 
      prev.map(m => m.job.id === jobId ? { ...m, isApplied: true } : m)
    );
  };

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-violet-950/20 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-gray-550 dark:text-gray-400 mt-1 font-semibold text-sm">
          {t("subtitle")}
        </p>
      </div>

      {/* Matches List */}
      <div className="max-w-4xl space-y-6">
        {matches.length === 0 ? (
          <p className="text-center py-12 text-gray-550">{t("noMatches")}</p>
        ) : (
          matches.map((match) => (
            <div
              key={match.job.id}
              className="glass-card rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-850 hover:border-violet-400 dark:hover:border-violet-900 transition-all duration-300 space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                    {match.job.title}
                  </h2>
                  <span className="text-xs font-black text-violet-600 dark:text-violet-400 block mt-0.5">
                    {match.job.companyName}
                  </span>
                </div>

                {/* Match Score Gauge */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                    {t("matchScore")}
                  </span>
                  <span className={`text-sm font-black px-3 py-1 rounded-full mt-1.5 border ${
                    match.score >= 80
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  }`}>
                    {match.score}% MATCH
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-gray-650 dark:text-gray-300 leading-relaxed">
                {match.job.description}
              </p>

              {/* Metadata Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-1.5 text-xs">
                <div className="p-3 bg-white/40 dark:bg-black/10 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase font-mono tracking-wider">📍 Location</span>
                  <span className="font-extrabold text-gray-800 dark:text-gray-200">{match.job.location}</span>
                </div>
                <div className="p-3 bg-white/40 dark:bg-black/10 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase font-mono tracking-wider">💰 Salary Range</span>
                  <span className="font-extrabold text-emerald-500">{match.job.salary}</span>
                </div>
                <div className="p-3 bg-white/40 dark:bg-black/10 border border-gray-150 dark:border-gray-800 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase font-mono tracking-wider">🗣️ Required Languages</span>
                  <div className="flex gap-1.5 mt-1">
                    {match.job.requiredLanguages.map((lang) => (
                      <span key={lang} className="px-2 py-0.5 bg-gray-250 dark:bg-gray-800 rounded-lg font-black uppercase text-[9px] text-gray-650 dark:text-gray-300">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Explanation Box */}
              <div className="p-4 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-900/30 rounded-2xl space-y-2">
                <h4 className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  💡 {t("explanationTitle")}
                </h4>
                <div className="text-xs text-violet-900/90 dark:text-violet-300 font-bold space-y-1.5 leading-relaxed">
                  {match.explanation.split("\n").map((line, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-violet-500 font-black mt-0.5">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply Action Bar */}
              <div className="flex justify-between items-center pt-2 gap-4 flex-wrap">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider font-mono">Matched:</span>
                  {match.skillsMatched.map(skill => (
                    <span key={skill} className="text-[9px] font-extrabold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                      ✓ {skill}
                    </span>
                  ))}
                </div>

                <button
                  disabled={match.isApplied}
                  onClick={() => handleApply(match.job.id)}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition duration-200 cursor-pointer ${
                    match.isApplied
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-750 shadow-none cursor-not-allowed"
                      : "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 text-white hover:scale-[1.03] active:scale-[0.97]"
                  }`}
                >
                  {match.isApplied ? t("applied") : t("applyNow")}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
