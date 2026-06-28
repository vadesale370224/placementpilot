import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }: SidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding profile via cookie presence
    const hasProfileCookie = typeof document !== "undefined" && document.cookie.split("; ").some(row => row.startsWith("pp_profile_id="));
    setHasProfile(hasProfileCookie);
  }, [pathname]);

  const menuItems = [
    { href: "/dashboard", label: t("dashboard"), icon: "📊" },
    ...(hasProfile 
      ? [{ href: "/profile", label: t("profile"), icon: "👤" }] 
      : [{ href: "/onboarding", label: t("onboarding"), icon: "👤" }]
    ),
    { href: "/passport", label: t("passport"), icon: "🪪" },
    { href: "/resume", label: t("resume"), icon: "📄" },
    { href: "/jobs", label: t("jobs"), icon: "💼" },
    { href: "/jobs?filter=recommended", label: t("jobsForYou"), icon: "🎯" },
    { href: "/coach", label: t("coach"), icon: "🎙️" },
    { href: "/applications", label: t("applications"), icon: "📝" },
    { href: "/settings", label: t("settings"), icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 p-4 flex flex-col h-full select-none transition-all duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-64"}
      `}>
        <nav className="glass-panel rounded-3xl p-4 flex-1 space-y-2 flex flex-col justify-start overflow-y-auto">
          {/* Section: Navigation */}
          <div className={`
            px-4 py-3 mb-4 text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest font-mono border-b border-gray-100 dark:border-gray-800
            ${isCollapsed ? "text-center px-0 font-light" : ""}
          `}>
            {isCollapsed ? "NAV" : t("navigation")}
          </div>
          
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/10 translate-x-1"
                      : "text-gray-600 dark:text-gray-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/10 hover:text-violet-600 dark:hover:text-violet-300"
                  }`}
                  title={item.label}
                >
                  <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? "scale-110" : ""} ${isCollapsed ? "mx-auto" : "mr-3"}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="flex-1">{item.label}</span>}
                  {isActive && !isCollapsed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Section: Jobs For You */}
          {!isCollapsed && (
            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="px-4 text-[10px] font-bold text-blue-550 dark:text-blue-400 uppercase tracking-widest font-mono">
                {t("jobsForYou")}
              </div>
              <div className="mx-2 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                {t("personalMatches")}
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}