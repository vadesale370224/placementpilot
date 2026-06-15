"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterMatchingPage() {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<string>("c1");

  const candidatesMatch = [
    { id: "c1", name: "Rahul Ghadge", role: "ITI Electrician", matchScore: 95, location: "Mumbai", skills: ["Wiring", "Electrical Maintenance", "Safety Protocols"], gap: ["Troubleshooting"], explanation: "Excellent state alignment (Maharashtra) and speaks Marathi. 3 out of 4 core technical skills are verified by AI speech analyzer." },
    { id: "c2", name: "Amit Sharma", role: "MIG/TIG Welder", matchScore: 88, location: "Pune", skills: ["Welding", "Metal Fabrication", "Grinding"], gap: ["Blueprints"], explanation: "Matches MIG/TIG welder requirements closely. Speaks Hindi. Missing blueprints verification." },
  ];

  const current = candidatesMatch.find(c => c.id === selectedCandidate) || candidatesMatch[0];

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          AI Candidate Matching
        </h1>
        <p className="text-gray-400 mt-1 font-semibold text-sm">
          Evaluate matches using semantic embedding cosine similarity and skill gap analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidates Panel */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono block">Candidates List</span>
          <div className="space-y-3">
            {candidatesMatch.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCandidate(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedCandidate === c.id
                    ? "border-blue-500 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 text-white"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm">{c.name}</h4>
                  <span className="text-xs text-gray-400 font-semibold">{c.role}</span>
                </div>
                <span className="text-xs font-black px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  {c.matchScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Match Evaluation Sheet */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white">{current.name}</h2>
              <span className="text-xs text-cyan-400 font-bold">{current.role} • {current.location}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-gray-450 uppercase tracking-widest font-mono">Semantic Match Score</span>
              <div className="text-3xl font-black text-cyan-400">{current.matchScore}%</div>
            </div>
          </div>

          {/* Alignment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono block">Matched Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {current.skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-lg text-xs font-black">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono block">Skill Gaps Identified</span>
              <div className="flex flex-wrap gap-1.5">
                {current.gap.map((g, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/15 rounded-lg text-xs font-black">
                    ⚠ {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl space-y-2">
            <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest font-mono">
              💡 AI Match Explanation
            </h4>
            <p className="text-xs text-gray-300 font-bold leading-relaxed">
              {current.explanation}
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
            <button
              onClick={() => router.push("/recruiter/shortlisted")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              ⭐ Add to Shortlist
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
