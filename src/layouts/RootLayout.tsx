import { Outlet, Link } from "react-router-dom";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* GLOBAL HEADER */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          {/* LOGO */}
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 sm:text-2xl"
          >
            PadhAI
          </Link>
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default RootLayout;
