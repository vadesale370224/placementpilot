"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dbMock } from "@/lib/dbMock";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const profile = dbMock.getProfile();
    if (profile) {
      router.replace("/passport");
    } else {
      router.replace("/onboarding");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );
}
