"use client";

import React from "react";

// Set to true to bypass Clerk entirely
export const BYPASS_CLERK = true;

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useUser() {
  return {
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "mock-user-id",
      fullName: "Rahul Ghadge",
      primaryEmailAddress: { emailAddress: "rahul.ghadge@example.com" },
      imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    },
  };
}

export function UserButton() {
  return (
    <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 py-1.5 px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer select-none">
      <img
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
        alt="User Profile"
        className="w-6 h-6 rounded-full border border-blue-500/20"
      />
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 hidden sm:inline">
        Rahul Ghadge
      </span>
    </div>
  );
}
