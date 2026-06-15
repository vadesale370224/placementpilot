"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const candidates = [
    { id: "c1", name: "Rahul Ghadge", role: "ITI Electrician", location: "Maharashtra", state: "Maharashtra", lang: "Marathi, Hindi", readiness: 75, skills: ["Wiring", "Electrical Maintenance", "Safety Protocols"] },
    { id: "c2", name: "Amit Sharma", role: "MIG/TIG Welder", location: "Maharashtra", state: "Maharashtra", lang: "Hindi", readiness: 88, skills: ["Welding", "Metal Fabrication", "Grinding"] },
    { id: "c3", name: "Priya Patil", role: "Customer Support Executive", location: "Maharashtra", state: "Maharashtra", lang: "Marathi, English, Hindi", readiness: 92, skills: ["Communication", "Problem Solving", "Data Entry"] },
    { id: "c4", name: "Vikram Malhotra", role: "Retail Sales Associate", location: "Delhi", state: "Delhi", lang: "Hindi, English", readiness: 81, skills: ["Sales", "Customer Relations", "Inventory Management"] },
  ];

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.role.toLowerCase().includes(query.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Candidate Search Directory
        </h1>
        <p className="text-gray-400 mt-1 font-semibold text-sm">
          Audit vocational candidates, verified skills, and Placement Readiness Scores.
        </p>
      </div>

      {/* Filter Box */}
      <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Search candidates by name, job role, or skill..."
            className="flex-1 p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
          />
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="glass-panel rounded-3xl p-6 border border-white/5 hover:border-violet-500/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-black text-lg">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white leading-tight">{c.name}</h3>
                  <span className="text-xs font-black text-cyan-400">{c.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase font-mono tracking-wider">📍 Location / State</span>
                  <span className="font-bold text-gray-200">{c.location}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase font-mono tracking-wider">🗣️ Spoken Languages</span>
                  <span className="font-bold text-gray-200">{c.lang}</span>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <span className="text-gray-400 font-bold block text-[10px] uppercase font-mono tracking-wider">🛠️ Verified Skills</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.skills.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded text-[9px] font-black uppercase">
                        {s}
                      </span>
                    ))}
                    {c.skills.length > 2 && <span className="text-[9px] text-gray-400">+{c.skills.length - 2} more</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Score & Actions */}
            <div className="flex flex-col items-center md:items-end justify-between min-h-[100px] border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 gap-4">
              <div className="text-center md:text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Readiness Score</span>
                <div className="text-2xl font-black text-emerald-400 mt-0.5">{c.readiness}%</div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={() => router.push("/recruiter/matching")}
                  className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  ⚡ Match AI
                </button>
                <button
                  onClick={() => router.push("/recruiter/shortlisted")}
                  className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Shortlist"
                >
                  ⭐
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-450 py-12">No candidates matches your search query.</p>
        )}
      </div>
    </main>
  );
}
