"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const menuItems = [
    { href: "/dashboard", label: t("dashboard"), icon: "📊" },
    { href: "/passport", label: t("passport"), icon: "🪪" },
    { href: "/jobs", label: t("jobs"), icon: "💼" },
    { href: "/coach", label: t("coach"), icon: "🎙️" },
    { href: "/onboarding", label: t("onboarding"), icon: "👤" },
  ];

  return (
    <aside className="w-64 p-4 flex flex-col h-full z-20 select-none">
      <nav className="glass-panel rounded-3xl p-4 flex-1 space-y-2 flex flex-col justify-start">
        <div className="px-4 py-3 mb-4 text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest font-mono border-b border-gray-100 dark:border-gray-800">
          Navigation
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/10 translate-x-1"
                  : "text-gray-600 dark:text-gray-300 hover:bg-violet-50/50 dark:hover:bg-violet-950/10 hover:text-violet-600 dark:hover:text-violet-300"
              }`}
            >
              <span className={`mr-3 text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? "scale-110" : ""}`}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}