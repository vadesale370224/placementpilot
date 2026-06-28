"use client";

import { useRouter } from "next/navigation";
import { dbMock } from "@/lib/dbMock";

export default function Home() {
  const router = useRouter();

  const handleStudentClick = () => {
    router.push("/login?role=candidate");
  };
 
   const handleRecruiterClick = () => {
    router.push("/login?role=recruiter");
  };

  return (
    <div className="min-h-screen bg-[#060212] text-white flex flex-col items-center justify-center p-6 relative overflow-x-hidden overflow-y-auto font-sans select-none selection:bg-violet-500/30">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
      
      {/* Header/Branding */}
      <div className="mb-12 text-center relative z-10">
        <span className="text-sm font-black text-violet-400 tracking-[0.2em] uppercase font-mono">
          Welcome to PlacementPilot
        </span>
        <h1 className="text-4xl sm:text-5xl font-black mt-3 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Choose Your Experience
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto mt-4 text-sm sm:text-base font-semibold leading-relaxed">
          PlacementPilot AI connects students with career opportunities and helps recruiters discover qualified talent.
        </p>
      </div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        {/* Student Card */}
        <div 
          onClick={handleStudentClick}
          className="glass-card group rounded-3xl p-8 border border-white/5 hover:border-violet-500/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 cursor-pointer shadow-2xl flex flex-col justify-between min-h-[320px]"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
              🎓
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white group-hover:text-violet-400 transition-colors">
                Student
              </h2>
              <p className="text-gray-450 text-sm font-medium leading-relaxed">
                Prepare for placements, improve your resume, practice interviews, track applications, and build your career profile.
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="w-full mt-8 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-750 hover:to-blue-750 text-white font-bold rounded-xl shadow-md transition duration-300 transform group-hover:translate-y-[-2px] active:scale-[0.98]"
          >
            Continue as Student
          </button>
        </div>

        {/* Recruiter Card */}
        <div 
          onClick={handleRecruiterClick}
          className="glass-card group rounded-3xl p-8 border border-white/5 hover:border-cyan-500/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 cursor-pointer shadow-2xl flex flex-col justify-between min-h-[320px]"
        >
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
              💼
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
                Recruiter
              </h2>
              <p className="text-gray-455 text-sm font-medium leading-relaxed">
                Post jobs, discover talent, review candidate profiles, and find the right candidates faster.
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="w-full mt-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-750 hover:to-cyan-750 text-white font-bold rounded-xl shadow-md transition duration-300 transform group-hover:translate-y-[-2px] active:scale-[0.98]"
          >
            Continue as Recruiter
          </button>
        </div>
      </div>
      
      {/* Footer copyright */}
      <div className="mt-16 text-xs text-gray-500 font-medium tracking-wider font-mono">
        © 2026 PlacementPilot AI. All rights reserved.
      </div>
    </div>
  );
}
