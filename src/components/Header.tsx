import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-slate-900 sm:text-2xl"
        >
          Padh<span className="text-blue-600">AI</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Hindi / English */}
          <LanguageToggle />

          {/* Login / Dashboard */}
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
