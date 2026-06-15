"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dbMock, MockProfile, MockSkillPassport } from "@/lib/dbMock";
import { setLocale } from "@/lib/i18n";
import { useLocale } from "next-intl";

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
  
  // Education fields (defaults since onboarding was basic)
  const [collegeName, setCollegeName] = useState("Government ITI College");
  const [degree, setDegree] = useState("ITI Certification");
  const [branch, setBranch] = useState("Electrical / Electrician");
  const [year, setYear] = useState("2026");
  const [cgpa, setCgpa] = useState("8.2");

  // Career fields
  const [preferredRole, setPreferredRole] = useState("ITI Electrician");
  const [preferredLocation, setPreferredLocation] = useState("Mumbai, Maharashtra");
  const [expectedSalary, setExpectedSalary] = useState("₹20,000 - ₹25,000 / month");
  const [employmentType, setEmploymentType] = useState("Full-time");

  // Settings
  const [notifsEnabled, setNotifsEnabled] = useState(true);

  useEffect(() => {
    const activeProfile = dbMock.getProfile();
    const activePassport = dbMock.getSkillPassport();

    if (!activeProfile) {
      router.push("/onboarding");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(activeProfile);
    setPassport(activePassport);

    setFullName(activeProfile.fullName);
    setPhone(activeProfile.phone);
    setBio(activeProfile.bio);
    setState(activeProfile.state);
  }, [router]);

  const handleSave = () => {
    if (!profile) return;
    const updated: MockProfile = {
      ...profile,
      fullName,
      phone,
      bio,
      state,
    };
    dbMock.saveProfile(updated);
    setProfile(updated);
    setIsEditing(false);
    
    // Trigger header refresh by reloading or just setting state
    router.refresh();
  };

  const handleLogout = () => {
    dbMock.clearAll();
    document.cookie = "pp_profile_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    window.location.href = "/";
  };

  const handleLanguageChange = (lang: string) => {
    setLocale(lang);
  };

  if (!profile || !passport) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060212]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const applicationsCount = dbMock.getApplications().length;
  const sessionsCount = dbMock.getInterviewSessions().length;

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
            <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-bold border border-white/10">
                📍 {state}
              </span>
              <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-bold border border-white/10">
                ⭐ Gold Tier
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
          </div>
        </div>

      </div>
    </main>
  );
}
