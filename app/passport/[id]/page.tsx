"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

interface Skill {
  name: string;
  proficiency: string;
  status: "SELF_REPORTED" | "AI_VERIFIED" | "INSTITUTE_VERIFIED" | "EMPLOYER_VERIFIED";
}

interface Profile {
  id: string;
  fullName: string;
  phone: string;
  bio: string;
  state: string;
  languages: string[];
  collegeName?: string;
  degree?: string;
  branch?: string;
  year?: string;
  cgpa?: string;
  preferredRole?: string;
  preferredLocation?: string;
  expectedSalary?: string;
  employmentType?: string;
  resumeUrl?: string;
}

interface SkillPassport {
  id: string;
  skills: Skill[];
  readinessScore: number;
  verificationLevel: string;
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export default function PublicPassportPage({ params }: RouteParams) {
  const router = useRouter();
  const { id } = use(params);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    async function fetchPublicPassport() {
      try {
        const res = await fetch(`/api/passport/${id}`);
        if (!res.ok) {
          throw new Error("Credentials not found or expired");
        }
        const data = await res.json();
        if (data.success) {
          setProfile(data.profile);
          setPassport(data.passport);
          
          // Generate local QR Code pointing to this verification URL
          const currentUrl = typeof window !== "undefined" ? window.location.href : "";
          const code = await QRCode.toDataURL(currentUrl, { margin: 1, width: 200 });
          setQrCodeUrl(code);
        } else {
          throw new Error(data.error || "Failed to load credentials");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load credentials");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchPublicPassport();
    }
  }, [id]);

  const getVerificationBadge = (status: Skill["status"]) => {
    switch (status) {
      case "EMPLOYER_VERIFIED":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-850 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50";
      case "INSTITUTE_VERIFIED":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-850 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/50";
      case "AI_VERIFIED":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-850 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusText = (status: Skill["status"]) => {
    switch (status) {
      case "EMPLOYER_VERIFIED":
        return "Employer Verified / नियोक्ता सत्यापित";
      case "INSTITUTE_VERIFIED":
        return "Institute Verified / संस्थान सत्यापित";
      case "AI_VERIFIED":
        return "AI Assessed / एआई मूल्यांकित";
      default:
        return "Self Reported / स्व-घोषित";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060212] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error || !profile || !passport) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#060212] text-white space-y-4 px-4 text-center">
        <span className="text-5xl">⚠️</span>
        <h1 className="text-2xl font-black text-red-500">Invalid Credentials</h1>
        <p className="text-gray-400 max-w-md font-semibold text-sm">
          {error || "The Skill Passport profile you requested does not exist or has been disabled."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl text-xs transition"
        >
          Return to PlacementPilot
        </button>
      </div>
    );
  }

  // Circular progress ring parameters
  const radius = 58;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (passport.readinessScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060212] text-gray-900 dark:text-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start space-y-10 animate-fadeIn">
      {/* Brand logo & header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent uppercase">
            PlacementPilot
          </span>
        </div>
        <h1 className="text-xl font-bold text-gray-500 dark:text-gray-400 tracking-wide uppercase text-xs">
          Verified National Skill Passport / राष्ट्रीय कौशल पासपोर्ट
        </h1>
      </div>

      {/* Grid of details */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Holographic Passport Card & Score */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-violet-950 via-slate-900 to-cyan-950 rounded-3xl border border-violet-500/20 shadow-2xl p-6 text-white space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_rgba(124,58,237,0.25)] transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
            <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px]">🇮🇳</span>
                <span className="text-[8px] font-black tracking-widest text-slate-300 uppercase font-mono">
                  NATIONAL SKILL PASSPORT / राष्ट्रीय कौशल पासपोर्ट
                </span>
              </div>
              {passport.verificationLevel !== "SELF_REPORTED" ? (
                <span className="text-[8px] font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  Verified by RozgaarPilot AI
                </span>
              ) : (
                <span className="text-[8px] font-extrabold px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full border border-gray-500/30">
                  SELF REPORTED
                </span>
              )}
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 via-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-inner border border-white/20 relative select-none">
                {profile.fullName.charAt(0)}
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

              {/* Verified QR Code linking to itself */}
              <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center select-none shadow">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Verification QR" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 border-t border-white/5 pt-3">
              <span>ISSUED: 06/2026</span>
              <span>EXPIRY: PERMANENT</span>
            </div>
          </div>

          {/* Verification Readiness Score Gauge */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow">
            <div>
              <h3 className="font-extrabold text-base text-gray-800 dark:text-gray-200">Vocational Readiness Score</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-4">Standardized job readiness based on AI interview and skills verification.</p>
            </div>
            
            <div className="relative flex items-center justify-center select-none">
              <svg className="w-36 h-36">
                <defs>
                  <linearGradient id="pubScoreRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle
                  className="text-gray-200 dark:text-violet-950/20"
                  strokeWidth={stroke}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius + stroke}
                  cy={radius + stroke}
                />
                <circle
                  stroke="url(#pubScoreRing)"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + " " + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={radius + stroke}
                  cy={radius + stroke}
                  transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {passport.readinessScore}%
                </span>
                <span className="text-[9px] font-black text-emerald-500 tracking-wider uppercase mt-0.5">
                  JOB READY
                </span>
              </div>
            </div>

            <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-500 border border-emerald-500/20">
              Gold Tier Assessed Profile
            </div>
          </div>
        </div>

        {/* Detailed profile details & verified skills */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Bio section */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 shadow">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
              Candidate Biography
            </h3>
            <p className="text-sm text-gray-650 dark:text-gray-300 leading-relaxed font-semibold">
              {profile.bio || "No summary provided."}
            </p>
          </div>

          {/* Academic Background */}
          {(profile.collegeName || profile.degree) && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 shadow">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                Academic Background
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                {profile.collegeName && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">College / Institute</span>
                    <span className="text-gray-900 dark:text-white">{profile.collegeName}</span>
                  </div>
                )}
                {profile.degree && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Degree / Course</span>
                    <span className="text-gray-900 dark:text-white">{profile.degree}</span>
                  </div>
                )}
                {profile.branch && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Branch / Specialization</span>
                    <span className="text-gray-900 dark:text-white">{profile.branch}</span>
                  </div>
                )}
                {(profile.year || profile.cgpa) && (
                  <div className="grid grid-cols-2 gap-2">
                    {profile.year && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Grad Year</span>
                        <span className="text-gray-900 dark:text-white">{profile.year}</span>
                      </div>
                    )}
                    {profile.cgpa && (
                      <div className="space-y-1">
                        <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">CGPA / Score</span>
                        <span className="text-gray-900 dark:text-white">{profile.cgpa}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verified Skills */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
              Skills Checklist & Endorsements
            </h3>

            <div className="space-y-4">
              {passport.skills.length === 0 ? (
                <p className="text-gray-450 text-center py-6">No skills added to this passport yet.</p>
              ) : (
                passport.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.01] border border-gray-150 dark:border-white/5 rounded-2xl gap-4"
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
                      <span className="text-[10px] text-gray-450 font-black uppercase tracking-wider font-mono">
                        Verification Status:
                      </span>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${getVerificationBadge(skill.status)}`}>
                        {getStatusText(skill.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Job Target details */}
          {(profile.preferredRole || profile.preferredLocation || profile.expectedSalary) && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 shadow">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                Employment Target Preferences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                {profile.preferredRole && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Target Job Role</span>
                    <span className="text-gray-900 dark:text-white">{profile.preferredRole}</span>
                  </div>
                )}
                {profile.preferredLocation && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Target Location</span>
                    <span className="text-gray-900 dark:text-white">{profile.preferredLocation}</span>
                  </div>
                )}
                {profile.expectedSalary && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Expected Salary</span>
                    <span className="text-emerald-500">{profile.expectedSalary}</span>
                  </div>
                )}
                {profile.employmentType && (
                  <div className="space-y-1">
                    <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Employment Type</span>
                    <span className="text-gray-900 dark:text-white">{profile.employmentType}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Logs */}
          <div className="text-center pt-4">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">
              Digitally Signed and Verified Profile
            </span>
            <span className="text-[9px] font-mono text-gray-500 block mt-1">
              Prisma UUID: {profile.id} • SkillPassport UUID: {passport.id}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
