"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function RecruiterDashboardPage() {
  const router = useRouter();

  const stats = [
    { label: "Active Jobs", count: "8 Jobs", icon: "💼", color: "text-blue-400" },
    { label: "Candidates Sourced", count: "142 Candidates", icon: "👥", color: "text-violet-400" },
    { label: "AI Match Proposals", count: "37 Matches", icon: "⚡", color: "text-cyan-400" },
    { label: "Shortlisted candidates", count: "14 Candidates", icon: "⭐", color: "text-emerald-400" },
  ];

  const recentCandidates = [
    { name: "Rahul Ghadge", role: "ITI Electrician", location: "Maharashtra", matchScore: 95 },
    { name: "Amit Sharma", role: "MIG/TIG Welder", location: "Maharashtra", matchScore: 88 },
    { name: "Priya Patil", role: "Customer Support Executive", location: "Maharashtra", matchScore: 92 },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 opacity-10 text-9xl font-black select-none pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
          💼
        </div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <h2 className="text-3xl font-black tracking-tight">Recruiter Workspace</h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed font-semibold">
            Post new positions, utilize semantic AI candidate matching, and coordinate shortlisted files for local vocational placements.
          </p>
        </div>
      </div>

      {/* Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card rounded-3xl p-6 flex justify-between items-center hover:scale-[1.02] transition-transform select-none">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">{stat.label}</span>
              <h3 className={`text-2xl font-black mt-1 ${stat.color}`}>
                {stat.count}
              </h3>
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>
        ))}
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recents list */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Top Candidates Suggested by AI
            </h3>
            <button 
              onClick={() => router.push("/recruiter/search")}
              className="text-xs font-bold text-cyan-400 hover:underline cursor-pointer"
            >
              View All Candidates
            </button>
          </div>

          <div className="space-y-4">
            {recentCandidates.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-violet-500/20 transition-all gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{c.name}</h4>
                    <span className="text-xs text-gray-400 font-semibold">{c.role} • {c.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {c.matchScore}% Match
                  </span>
                  <button 
                    onClick={() => router.push("/recruiter/matching")}
                    className="px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 space-y-6 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="font-extrabold text-lg text-white">Quick Actions</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                Use these panels to publish job details or audit semantic match roadmaps for candidates.
              </p>
            </div>
            
            <div className="space-y-3 pt-6">
              <button 
                onClick={() => router.push("/recruiter/post-job")}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                ➕ Post a New Job
              </button>
              <button 
                onClick={() => router.push("/recruiter/matching")}
                className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                ⚡ AI Candidate Matching
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
