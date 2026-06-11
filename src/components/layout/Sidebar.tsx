import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="px-4 pt-5 pb-3">
        <Link href="/" className="flex items-center h-10">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            PlacementPilot
          </h1>
        </Link>
      </div>
      <nav className="mt-10">
        <Link
          href="/dashboard"
          className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Dashboard
        </Link>
      </nav>
    </aside>
  );
}