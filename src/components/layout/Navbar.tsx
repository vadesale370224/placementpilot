import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                PlacementPilot
              </h1>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:ml-6">
            <Link href="/dashboard" className="mx-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Dashboard
            </Link>
          </div>
          <div className="flex-shrink-0 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}