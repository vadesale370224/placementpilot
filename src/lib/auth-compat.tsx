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
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: profile?.id || "mock-user-id",
      fullName: profile?.fullName || "Rahul Ghadge",
      primaryEmailAddress: { emailAddress: profile?.phone ? `${profile.id}@example.com` : "rahul.ghadge@example.com" },
      imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    },
  };
}

export function UserButton() {
  const { user } = useUser();
  return (
    <div className="flex items-center gap-2 border border-gray-250 dark:border-violet-950/20 bg-gray-50/50 dark:bg-violet-950/5 py-1.5 px-3 rounded-full hover:bg-gray-100 dark:hover:bg-violet-950/15 transition cursor-pointer select-none">
      <img
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
        alt="User Profile"
        className="w-6 h-6 rounded-full border border-blue-500/20"
      />
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden sm:inline">
        {user.fullName}
      </span>
    </div>
  );
}
