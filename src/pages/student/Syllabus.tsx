import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface SyllabusRow {
  id: string;
  external_id: string;
  category: "school" | "government_exam";
  class_name: string | null;
  board: string | null;
  exam: string | null;
  subject: string;
  chapter_name: string;
  topic_name: string | null;
  key_points: string | null;
  order_no: number;
  is_active: boolean;
}

export function StudentSyllabus() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [syllabus, setSyllabus] = useState<SyllabusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("all");

  async function loadSyllabus() {
    if (!user || !profile) {
      setLoading(false);
      return;
    }

    if (!profile.class_name || !profile.board) {
      setError(
        "Please complete your profile with Class and Board first.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: syllabusError } = await supabase
        .from("syllabi")
        .select("*")
        .eq("category", "school")
        .eq("class_name", profile.class_name)
        .eq("board", profile.board)
        .eq("is_active", true)
        .order("subject", { ascending: true })
        .order("order_no", { ascending: true });

      if (syllabusError) {
        throw syllabusError;
      }

      setSyllabus((data ?? []) as SyllabusRow[]);
    } catch (err) {
      console.error("Syllabus loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load syllabus.",
      );

      setSyllabus([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSyllabus();
  }, [
    user?.id,
    profile?.class_name,
    profile?.board,
  ]);

  const subjects = useMemo(() => {
    return Array.from(
      new Set(syllabus.map((item) => item.subject)),
    );
  }, [syllabus]);

  const filteredSyllabus = useMemo(() => {
    if (selectedSubject === "all") {
      return syllabus;
    }

    return syllabus.filter(
      (item) => item.subject === selectedSubject,
    );
  }, [syllabus, selectedSubject]);

  const groupedSyllabus = useMemo(() => {
    const groups: Record<string, SyllabusRow[]> = {};

    for (const row of filteredSyllabus) {
      if (!groups[row.subject]) {
        groups[row.subject] = [];
      }

      groups[row.subject].push(row);
    }

    return groups;
  }, [filteredSyllabus]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Login Required
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please login to view your syllabus.
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/login")}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Student Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              My Syllabus
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Title */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Your Personalized Syllabus
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                Class {profile?.class_name || "—"} Syllabus
              </h2>

              <p className="mt-2 text-slate-500 dark:text-slate-400">
                {profile?.board || "Board not set"}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-4 dark:bg-blue-950/40">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Chapters
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {syllabus.length}
              </p>
            </div>
          </div>
        </div>

        {/* Profile incomplete */}
        {(!profile?.class_name || !profile?.board) && (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-900 dark:bg-yellow-950/30">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-300">
              Complete your profile
            </h3>

            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              We need your Class and Board to automatically show
              the correct syllabus.
            </p>

            <button
              type="button"
              onClick={() => navigate("/student/profile")}
              className="mt-4 rounded-xl bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading your syllabus...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl bg-red-50 p-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <h3 className="font-bold">
              Unable to load syllabus
            </h3>

            <p className="mt-2 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={loadSyllabus}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Syllabus */}
        {!loading &&
          !error &&
          profile?.class_name &&
          profile?.board && (
            <>
              {/* Subject Filter */}
              {subjects.length > 0 && (
                <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubject("all")}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        selectedSubject === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      All Subjects
                    </button>

                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() =>
                          setSelectedSubject(subject)
                        }
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          selectedSubject === subject
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty */}
              {syllabus.length === 0 && (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">
                  <div className="text-5xl">📚</div>

                  <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                    Syllabus not available yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
                    No active syllabus was found for Class{" "}
                    {profile.class_name} and {profile.board}.
                    Please contact the administrator or try again
                    later.
                  </p>

                  <button
                    type="button"
                    onClick={loadSyllabus}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Refresh Syllabus
                  </button>
                </div>
              )}

              {/* Subject Cards */}
              <div className="space-y-6">
                {Object.entries(groupedSyllabus).map(
                  ([subject, chapters]) => (
                    <section
                      key={subject}
                      className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-slate-900"
                    >
                      {/* Subject Header */}
                      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {subject}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {chapters.length} chapter
                              {chapters.length === 1
                                ? ""
                                : "s"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            {profile.board}
                          </div>
                        </div>
                      </div>

                      {/* Chapter List */}
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {chapters.map((chapter, index) => (
                          <div
                            key={
                              chapter.external_id ||
                              chapter.id
                            }
                            className="p-6 transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          >
                            <div className="flex gap-4">
                              {/* Number */}
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                                {index + 1}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900 dark:text-white">
                                  {chapter.chapter_name}
                                </h4>

                                {chapter.topic_name && (
                                  <p className="mt-1 text-sm font-medium text-blue-600">
                                    {chapter.topic_name}
                                  </p>
                                )}

                                {chapter.key_points && (
                                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    {chapter.key_points}
                                  </p>
                                )}
                              </div>

                              {/* Order */}
                              <div className="hidden text-xs font-medium text-slate-400 sm:block">
                                #{chapter.order_no}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ),
                )}
              </div>
            </>
          )}
      </main>
    </div>
  );
}
