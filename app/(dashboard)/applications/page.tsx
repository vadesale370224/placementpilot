"use client";

import { useEffect, useState } from "react";
import { MockJobListing, MockApplication } from "@/lib/dbMock";
import { api } from "@/lib/api";

interface EnrichedApplication {
  app: MockApplication;
  job: MockJobListing | undefined;
}

export default function ApplicationsPage() {
  const [enrichedApps, setEnrichedApps] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await api.getApplications();
        const enriched = (res.applications || []).map((app: any) => ({
          app,
          job: app.job,
        }));
        setEnrichedApps(enriched);
        setLoading(false);
      } catch (err) {
        console.error("Applications load error:", err);
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060212]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-650"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="border-b border-gray-250/50 dark:border-violet-950/20 pb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          My Applications
        </h1>
        <p className="text-gray-550 dark:text-gray-400 mt-1 font-semibold text-sm">
          Track the status of your vocational applications and interview outcomes.
        </p>
      </div>

      <div className="space-y-4">
        {enrichedApps.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl border border-white/5 space-y-3">
            <span className="text-4xl block">💼</span>
            <p className="text-gray-400 font-bold text-sm">No applications submitted yet.</p>
            <p className="text-xs text-gray-500 font-semibold">Visit the Job Matches tab to find matching placements!</p>
          </div>
        ) : (
          enrichedApps.map((item) => (
            <div 
              key={item.app.id} 
              className="glass-card rounded-3xl p-6 border border-white/5 hover:border-violet-500/20 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-white">
                  {item.job?.title || "Unknown Job Role"}
                </h3>
                <span className="text-xs font-black text-violet-400 block">
                  {item.job?.companyName || "Employer"}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold block">
                  Applied on: {new Date(item.app.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black tracking-wider px-3 py-1 bg-yellow-500/10 text-yellow-450 border border-yellow-500/25 rounded-full uppercase">
                  {item.app.status}
                </span>
                <button 
                  onClick={() => window.location.href = "/coach"}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-lg border border-white/10 transition"
                >
                  Practice Interview
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
