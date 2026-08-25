import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export function StudentSettings() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    await signOut();
    navigate("/student/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ←
          </button>

          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your PadhAI account
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Account */}
        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Account
          </h2>

          <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Name
            </p>

            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {profile?.full_name || "Not set"}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Email
            </p>

            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {user?.email || "Not available"}
            </p>
          </div>

          <button
            onClick={() => navigate("/student/profile")}
            className="mt-4 rounded-xl border border-blue-600 px-4 py-2.5 font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            Edit Profile
          </button>
        </section>

        {/* Appearance */}
        <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Appearance
          </h2>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Choose how PadhAI looks.
              </p>
            </div>

            <button
              onClick={toggleTheme}
              className="rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </section>

        {/* Logout */}
        <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Account Actions
          </h2>

          <button
            onClick={handleLogout}
            className="mt-4 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-600"
          >
            🚪 Logout
          </button>
        </section>
      </main>
    </div>
  );
}
