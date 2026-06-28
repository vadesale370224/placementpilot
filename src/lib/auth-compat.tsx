"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/user-store";

// Set to true to bypass Clerk entirely
export const BYPASS_CLERK = true;

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useUser() {
  const { user, setUser, clearUser } = useUserStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setUser({
              id: data.user.id,
              email: data.user.email || "",
              firstName: data.profile.fullName.split(" ")[0] || "",
              lastName: data.profile.fullName.split(" ").slice(1).join(" ") || "",
              imageUrl: data.profile.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
              fullName: data.profile.fullName,
              phone: data.profile.phone,
              role: data.user.role,
              profileId: data.profile.id,
            } as any);
          } else {
            setUser({
              id: data.user.id,
              email: data.user.email || "",
              firstName: "User",
              lastName: "",
              imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
              fullName: "User",
              role: data.user.role,
            } as any);
          }
        } else {
          clearUser();
        }
      } catch (err) {
        console.error("Failed to load authenticated user:", err);
      } finally {
        setIsLoaded(true);
      }
    }

    loadUser();
  }, [setUser, clearUser]);

  const isSignedIn = !!user;

  return {
    isLoaded,
    isSignedIn,
    user: isSignedIn && user ? {
      id: user.id,
      fullName: (user as any).fullName || `${user.firstName} ${user.lastName}`,
      primaryEmailAddress: { emailAddress: user.email },
      imageUrl: user.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
      role: (user as any).role,
      profileId: (user as any).profileId,
    } : null,
  };
}

export function UserButton() {
  const { user, isSignedIn } = useUser();

  const handleAuthClick = () => {
    if (!isSignedIn) {
      window.location.href = "/login";
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
