"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Exclude navbar/sidebar from login page
  const isLoginPage = pathname === "/recruiter/login";

  const menuItems = [
    { href: "/recruiter/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/recruiter/post-job", label: "Post Job", icon: "➕" },
    { href: "/recruiter/search", label: "Candidate Search", icon: "🔍" },
    { href: "/recruiter/matching", label: "AI Matching", icon: "⚡" },
    { href: "/recruiter/shortlisted", label: "Shortlisted", icon: "⭐" },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#060212] text-white font-sans overflow-hidden select-none selection:bg-violet-500/30">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 shadow-sm backdrop-blur-md flex items-center px-6 h-16 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileOpen(!isMobileOpen);
              } else {
                setIsSidebarCollapsed(!isSidebarCollapsed);
              }
            }}
            className="p-2 mr-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-gray-300 transition cursor-pointer"
            title="Toggle Navigation"
          >
            ☰
          </button>
          <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
            <span className="text-xl font-black bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              PlacementPilot Recruiter 💼
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={async () => {
              try {
                const { api } = await import("@/lib/api");
                await api.logout();
                window.location.href = "/login?role=recruiter";
              } catch (err) {
                console.error("Logout failed:", err);
              }
            }}
            className="px-4 py-2 rounded-xl bg-red-505/10 hover:bg-red-650 hover:text-white border border-red-500/20 text-xs font-bold transition cursor-pointer"
          >
            Logout
          </button>
          <div className="flex items-center gap-2 border border-white/10 bg-white/[0.03] py-1.5 px-3 rounded-full">
            <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center font-bold text-xs">
              R
            </div>
            <span className="text-xs font-bold text-gray-300 hidden sm:inline">
              Recruiter Demo
            </span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Drawer Overlay */}
        {isMobileOpen && (
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 p-4 flex flex-col h-full transition-all duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isSidebarCollapsed ? "w-20" : "w-64"}
        `}>
          <nav className="glass-panel rounded-3xl p-4 flex-1 space-y-2 flex flex-col justify-start overflow-y-auto">
            <div className={`
              px-4 py-3 mb-4 text-[10px] font-bold text-violet-400 uppercase tracking-widest font-mono border-b border-white/5
              ${isSidebarCollapsed ? "text-center px-0 font-light" : ""}
            `}>
              {isSidebarCollapsed ? "WORK" : "Workspace"}
            </div>
            
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group ${
                      isActive
                        ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/10 translate-x-1"
                        : "text-gray-400 hover:bg-white/[0.03] hover:text-white"
                    }`}
                    title={item.label}
                  >
                    <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? "scale-110" : ""} ${isSidebarCollapsed ? "mx-auto" : "mr-3"}`}>
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && <span className="flex-1">{item.label}</span>}
                    {isActive && !isSidebarCollapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
