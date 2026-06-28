"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MockProfile, MockSkillPassport } from "@/lib/dbMock";
import { setLocale } from "@/lib/i18n";
import { useLocale } from "next-intl";
import { calculateProfileCompletion, getProfileCompletionBadge } from "@/lib/profile-utils";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const currentLocale = useLocale();

  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [passport, setPassport] = useState<MockSkillPassport | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [state, setState] = useState("");
  
  // Education fields (starts empty, no fake details)
  const [collegeName, setCollegeName] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");

  // Career fields
  const [preferredRole, setPreferredRole] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  // Settings
  const [notifsEnabled, setNotifsEnabled] = useState(true);

  // Stats states
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [sessionsCount, setSessionsCount] = useState(0);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const res = await api.getProfile();
        if (!res || !res.profile) {
          router.push("/onboarding");
          return;
        }

        const activeProfile = res.profile;
        setProfile(activeProfile);
        setPassport(res.passport);

        setFullName(activeProfile.fullName || "");
        setPhone(activeProfile.phone || "");
        setBio(activeProfile.bio || "");
        setState(activeProfile.state || "");
        setCollegeName(activeProfile.collegeName || "");
        setDegree(activeProfile.degree || "");
        setBranch(activeProfile.branch || "");
        setYear(activeProfile.year || "");
        setCgpa(activeProfile.cgpa || "");
        setPreferredRole(activeProfile.preferredRole || "");
        setPreferredLocation(activeProfile.preferredLocation || "");
        setExpectedSalary(activeProfile.expectedSalary || "");
        setEmploymentType(activeProfile.employmentType || "");
        setResumeUrl(activeProfile.resumeUrl || "");

        const appsRes = await api.getApplications().catch(() => ({ applications: [] }));
        setApplicationsCount(appsRes.applications?.length || 0);

        const sessionsRes = await api.getInterviewSessions().catch(() => ({ sessions: [] }));
        setSessionsCount(sessionsRes.sessions?.length || 0);
      } catch (err) {
        console.error("Profile load error:", err);
        router.push("/onboarding");
      }
    }
    loadProfileData();
  }, [router]);

  const handleSave = () => {
    if (!profile) return;
    const updated = {
      fullName,
      phone,
      bio,
      state,
      collegeName,
      degree,
      branch,
      year,
      cgpa,
      preferredRole,
      preferredLocation,
      expectedSalary,
      employmentType,
      resumeUrl,
    };

    api.saveProfile(updated)
      .then((res) => {
        if (res.success && res.profile) {
          setProfile(res.profile);
        }
        setIsEditing(false);
        router.refresh();
      })
      .catch((err) => {
        console.error("Save profile error:", err);
      });
  };

  const handleLogout = () => {
    api.logout()
      .then(() => {
        window.location.href = "/login";
      })
      .catch((err) => {
        console.error("Logout error:", err);
        window.location.href = "/login";
      });
  };

  const handleLanguageChange = (lang: string) => {
    setLocale(lang);
    if (profile) {
      api.saveProfile({ preferredLanguage: lang }).catch(() => {});
    }
  };

  if (!profile || !passport) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060212]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const completionPercent = calculateProfileCompletion(profile, passport);
  const badge = getProfileCompletionBadge(completionPercent);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header Profile Summary banner */}
      <div className="bg-gradient-to-r from-violet-650 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none transition-transform duration-500 group-hover:scale-110">
          👤
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center text-white text-4xl font-black shadow-inner border border-white/20 select-none">
            {fullName.charAt(0) || "S"}
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-black tracking-tight">{fullName}</h1>
            <p className="text-white/80 text-sm font-semibold max-w-lg leading-relaxed">
              {bio || "No biography added yet."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start items-center">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-bold border border-white/10">
                📍 {state}
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-bold border border-white/10">
                ⭐ Gold Tier
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                completionPercent < 50 
                  ? "bg-red-500/20 text-red-300 border-red-500/40" 
                  : completionPercent <= 80 
                  ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" 
                  : "bg-emerald-500/20 text-emerald-350 border-emerald-500/40"
              }`}>
                {badge.text} ({completionPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Navigation/Actions & Quick Stats */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Stats */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <h3 className="font-extrabold text-lg bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              My Activity
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Ready Score</span>
                <div className="text-2xl font-black text-violet-400">{passport.readinessScore}%</div>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Applied Jobs</span>
                <div className="text-2xl font-black text-blue-400">{applicationsCount}</div>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-center space-y-1 col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Completed Mocks</span>
                <div className="text-2xl font-black text-cyan-400">{sessionsCount}</div>
              </div>
            </div>
          </div>

          {/* Quick Settings */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <h3 className="font-extrabold text-lg text-white">System Settings</h3>
            
            <div className="space-y-4 text-sm font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Language Preference</span>
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

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Notification Alerts</span>
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

              <div className="pt-4 border-t border-white/5 flex gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black rounded-xl text-xs transition cursor-pointer"
                >
                  🚪 Log Out Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details Form */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-xl font-extrabold text-white">Detailed Information</h2>
            <button
              onClick={() => {
                if (isEditing) handleSave();
                else setIsEditing(true);
              }}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-xl transition"
            >
              {isEditing ? "💾 Save Changes" : "✏️ Edit Profile"}
            </button>
          </div>

          <div className="space-y-6">
            {/* Section 1: Personal info */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest font-mono">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-450 font-bold">Full Name</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-455 font-bold">Phone Number</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Education */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest font-mono">Academic Background</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-450 font-bold">College / Institute Name</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-450 font-bold">Degree / Certification</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-450 font-bold">Branch</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-gray-450 font-bold">Graduation Year</span>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-gray-450 font-bold">CGPA / Score</span>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Career Info */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest font-mono">Target Career Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-455 font-bold">Preferred Job Role</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={preferredRole}
                    onChange={(e) => setPreferredRole(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-455 font-bold">Target Location</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-455 font-bold">Expected Salary Package</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={expectedSalary}
                    onChange={(e) => setExpectedSalary(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-gray-455 font-bold">Employment Preference</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold outline-none focus:border-violet-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Skills Checklist */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black text-emerald-450 uppercase tracking-widest font-mono">Skill Passport Endorsements</h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {passport.skills.map((s, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-2xl text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    🛠️ {s.name} <span className="text-[10px] opacity-60">({s.proficiency})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 5: Documents */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-sm font-black text-violet-400 uppercase tracking-widest font-mono">Documents</h3>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-gray-450 font-bold block">Resume / CV</span>
                  {resumeUrl ? (
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      📄 {resumeUrl}
                    </span>
                  ) : (
                    <span className="text-xs text-red-400 font-semibold block">No resume uploaded yet.</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="resumeUpload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setResumeUrl(file.name);
                        api.saveProfile({ resumeUrl: file.name })
                          .then((res) => {
                            if (res.success && res.profile) {
                              setProfile(res.profile);
                            }
                            router.refresh();
                          })
                          .catch((err) => console.error("Resume upload error:", err));
                      }
                    }}
                  />
                  <label
                    htmlFor="resumeUpload"
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-md shadow-violet-500/10"
                  >
                    {resumeUrl ? "Change Resume" : "Upload Resume"}
                  </label>
                  {resumeUrl && (
                    <button
                      onClick={() => {
                        setResumeUrl("");
                        api.saveProfile({ resumeUrl: "" })
                          .then((res) => {
                            if (res.success && res.profile) {
                              setProfile(res.profile);
                            }
                            router.refresh();
                          })
                          .catch((err) => console.error("Resume delete error:", err));
                      }}
                      className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold rounded-xl transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
