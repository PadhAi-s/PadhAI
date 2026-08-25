import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export function StudentProfile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [className, setClassName] = useState("");
  const [board, setBoard] = useState("");
  const [exam, setExam] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setClassName(profile.class_name ?? "");
      setBoard(profile.board ?? "");
      setExam(profile.exam ?? "");
    }
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!user) {
      setError("You must be logged in to update your profile.");
      return;
    }

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Please enter a valid full name.");
      return;
    }

    if (!className) {
      setError("Please select your class.");
      return;
    }

    if (!board) {
      setError("Please select your board.");
      return;
    }

    if (!exam) {
      setError("Please select your exam.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          class_name: className,
          board,
          exam,
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();

      setSuccess("Profile saved successfully! 🎉");

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 700);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save profile.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:py-10">
      <div className="mx-auto w-full max-w-2xl">

        {/* Top Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            Student Profile
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
            P
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Keep your study information updated for a personalized PadhAI
            experience.
          </p>
        </div>

        {/* Profile Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
        >
          <div className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={user?.email ?? ""}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Your email is linked to your account and cannot be changed here.
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-950"
              />
            </div>

            {/* Class */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Class
              </label>

              <select
                value={className}
                onChange={(event) => setClassName(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              >
                <option value="">Select your class</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>

            {/* Board */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Board
              </label>

              <select
                value={board}
                onChange={(event) => setBoard(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              >
                <option value="">Select your board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Exam */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Exam
              </label>

              <select
                value={exam}
                onChange={(event) => setExam(event.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              >
                <option value="">Select your exam</option>
                <option value="School Exams">School Exams</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="CUET">CUET</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
              {success}
            </div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving Profile..." : "Save Profile"}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            disabled={loading}
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
