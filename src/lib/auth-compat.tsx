"use client";

import React from "react";
import { dbMock } from "@/lib/dbMock";

// Set to true to bypass Clerk entirely
export const BYPASS_CLERK = true;

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useUser() {
  const profile = typeof window !== "undefined" ? dbMock.getProfile() : null;
  const isSignedIn = !!profile;
  return {
    isLoaded: true,
    isSignedIn,
    user: isSignedIn && profile ? {
      id: profile.id,
      fullName: profile.fullName,
      primaryEmailAddress: { emailAddress: profile.phone ? `${profile.id}@example.com` : "" },
      imageUrl: profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    } : null,
  };
}

export function UserButton() {
  const { user, isSignedIn } = useUser();

  const handleAuthClick = () => {
    if (!isSignedIn) {
      window.location.href = "/onboarding";
    } else {
      window.location.href = "/profile";
    }
  };

  if (!isSignedIn || !user) {
    return (
      <button
        onClick={handleAuthClick}
        className="px-4.5 py-2 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 text-white font-extrabold rounded-full text-xs shadow-md transition transform hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
      >
        Sign In
      </button>
    );
  }

  return (
    <div 
      onClick={handleAuthClick}
      className="flex items-center gap-2 border border-gray-250 dark:border-violet-950/20 bg-gray-50/50 dark:bg-violet-950/5 py-1.5 px-3 rounded-full hover:bg-gray-100 dark:hover:bg-violet-950/15 transition cursor-pointer select-none"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={user.imageUrl}
        alt="User Profile"
        className="w-6 h-6 rounded-full border border-blue-500/20 object-cover"
      />
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden sm:inline">
        {user.fullName}
      </span>
    </div>
  );
}

