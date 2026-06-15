"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterPostJobPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      router.push("/recruiter/dashboard");
    }, 1500);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn">
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          Post a New Position
        </h1>
        <p className="text-gray-400 mt-1 font-semibold text-sm">
          Publish vacancies to matches seekers in Pune, Nagpur, and Mumbai.
        </p>
      </div>

      <div className="max-w-2xl glass-panel rounded-3xl p-8 space-y-6 shadow-xl relative">
        {success && (
          <div className="absolute inset-0 bg-[#060212]/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-center p-6 z-20 animate-fadeIn">
            <span className="text-5xl mb-4">🎉</span>
            <h3 className="text-2xl font-black text-white">Job Posted Successfully!</h3>
            <p className="text-gray-400 text-sm font-semibold mt-2">
              Semantic algorithms will analyze candidates' Skill Passports now.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Job Title</label>
              <input
                type="text"
                required
                defaultValue="Industrial Electrician"
                className="p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Company Name</label>
              <input
                type="text"
                required
                defaultValue="Shree Electricals & Power Ltd"
                className="p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Location</label>
              <input
                type="text"
                required
                defaultValue="Mumbai, Maharashtra"
                className="p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Salary Range</label>
              <input
                type="text"
                required
                defaultValue="₹18,000 - ₹25,000 / month"
                className="p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Key Requirements (Comma Separated)</label>
            <input
              type="text"
              required
              defaultValue="Wiring, Electrical Maintenance, Troubleshooting, Safety Protocols"
              className="p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Required Spoken Languages (Comma Separated)</label>
            <input
              type="text"
              required
              defaultValue="Hindi, Marathi"
              className="p-3 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => router.push("/recruiter/dashboard")}
              className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              Publish Vacancy
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
