"use client";

import React, { useState } from "react";

export default function RecruiterShortlistedPage() {

  const [shortlisted, setShortlisted] = useState([
    { id: "c1", name: "Rahul Ghadge", role: "ITI Electrician", readiness: 75, date: "06/15/2026" },
    { id: "c3", name: "Priya Patil", role: "Customer Support Executive", readiness: 92, date: "06/14/2026" },
  ]);

  const handleRemove = (id: string) => {
    setShortlisted(prev => prev.filter(c => c.id !== id));
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Shortlisted Candidates
        </h1>
        <p className="text-gray-400 mt-1 font-semibold text-sm">
          Manage profiles earmarked for interviews and placements.
        </p>
      </div>

      <div className="max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono block">Shortlist Pipeline</span>
        
        <div className="space-y-4">
          {shortlisted.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-violet-500/20 transition-all gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-white">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm">{c.name}</h4>
                  <span className="text-xs text-gray-450 font-semibold">{c.role} • Earmarked {c.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-[9px] font-black text-gray-500 uppercase font-mono tracking-wider">Readiness</span>
                  <div className="text-sm font-black text-emerald-400">{c.readiness}%</div>
                </div>
                
                <button
                  onClick={() => handleRemove(c.id)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold transition cursor-pointer"
                  title="Remove from shortlist"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {shortlisted.length === 0 && (
            <p className="text-center text-gray-450 py-12">No candidates have been shortlisted yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
