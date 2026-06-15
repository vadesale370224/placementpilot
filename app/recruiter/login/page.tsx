"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("recruiter@placementpilot.ai");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/recruiter/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#060212] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none selection:bg-violet-500/30">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-panel border border-white/10 shadow-2xl rounded-3xl p-8 sm:p-10 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20 mx-auto">
            💼
          </div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Recruiter Workspace
          </h1>
          <p className="text-xs text-gray-400 font-semibold">
            Access talent analytics and manage candidates.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold transition"
              placeholder="recruiter@company.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Logging in..." : "Login as Recruiter"}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-xs font-semibold text-gray-450 hover:text-white transition cursor-pointer"
          >
            ← Back to Portal Gateway
          </button>
        </div>
      </div>
    </div>
  );
}
