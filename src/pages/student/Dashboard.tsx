import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/student/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>
            <p className="text-sm text-slate-500">
              Student Dashboard
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

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome to PadhAI 👋
          </h2>

          <p className="mt-2 text-slate-600">
            {profile?.full_name || user?.email || "Student"}
          </p>

          {/* Student Profile Information */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Class
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {profile?.class_name || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Board
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {profile?.board || "Not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-5">
              <p className="text-sm font-medium text-slate-500">
                Exam
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {profile?.exam || "Not set"}
              </p>
            </div>
          </div>

          {/* Dashboard Features */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 transition hover:shadow-md">
              <div className="text-3xl">📚</div>

              <h3 className="mt-4 font-semibold text-slate-900">
                My Syllabus
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Your class and syllabus will appear here.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 transition hover:shadow-md">
              <div className="text-3xl">🤖</div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Ask PadhAI
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Ask questions and get AI-powered solutions.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 transition hover:shadow-md">
              <div className="text-3xl">🎥</div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Study Videos
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Relevant learning videos will appear here.
              </p>
            </div>
          </div>

          {/* Profile Button */}
          <div className="mt-8 border-t pt-6">
            <button
              onClick={() => navigate("/student/profile")}
              className="rounded-xl border border-blue-600 px-5 py-3 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Edit My Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
