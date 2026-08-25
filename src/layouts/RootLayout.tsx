import { Link, Outlet } from "react-router-dom";
import { Logo } from "../components/Logo";
import { LanguageToggle } from "../components/LanguageToggle";
import { ThemeToggle } from "../components/ThemeToggle";

export function RootLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      <header className="border-b border-ink/10 dark:border-paper/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" aria-label="PadhAI home">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink/10 dark:border-paper/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 text-sm text-ink-soft dark:text-paper/60">
          © {new Date().getFullYear()} PadhAI
        </div>
      </footer>
    </div>
  );
}
