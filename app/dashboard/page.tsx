"use client";

import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Welcome, {user.firstName || user.username || "User"}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is your protected dashboard page.
          </p>
          <UserButton />
        </div>
      </div>
    </main>
  );
}