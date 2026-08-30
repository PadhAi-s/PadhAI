import { Outlet, Link } from "react-router-dom";
import { LanguageToggle } from "../components/LanguageToggle";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          {/* LOGO */}
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 sm:text-2xl"
          >
            PadhAI
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center">
            <LanguageToggle />
          </div>
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
