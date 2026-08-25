import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              PadhAI Admin
            </h1>
            <p className="text-sm text-slate-500">
              Administration Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">Welcome Admin</p>

          <h2 className="mt-1 text-2xl font-bold">
            {profile?.full_name || user?.email || "Administrator"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            You have administrator access to PadhAI.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl">📚</div>
            <h3 className="mt-4 font-bold text-slate-900">
              Syllabus
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Upload and manage class-wise syllabus.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl">👨‍🎓</div>
            <h3 className="mt-4 font-bold text-slate-900">
              Students
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage student accounts and profiles.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl">🤖</div>
            <h3 className="mt-4 font-bold text-slate-900">
              AI Settings
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Configure PadhAI AI features.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl">🎥</div>
            <h3 className="mt-4 font-bold text-slate-900">
              Videos
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Manage educational video content.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
