import { Outlet, Link } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <Link
            to="/"
            className="text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            <span className="text-blue-700 dark:text-blue-400">
              Ranker
            </span>{" "}
            <span className="text-yellow-500">
              Bhaiya
            </span>
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
