import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface SyllabusItem {
  id: number;
  class_name: string;
  board: string;
  exam: string;
  subject: string;
  chapter: string;
  topic: string | null;
  syllabus_type: string;
  academic_year: string | null;
  source_url: string | null;
  sort_order: number | null;
}

export function StudentSyllabus() {
  const { profile } = useAuth();

  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSyllabus() {
      if (!profile?.class_name || !profile?.board || !profile?.exam) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("syllabus")
        .select("*")
        .eq("class_name", profile.class_name)
        .eq("board", profile.board)
        .eq("exam", profile.exam)
        .order("sort_order", { ascending: true });

      if (fetchError) {
        console.error("Syllabus loading error:", fetchError);
        setError("Unable to load syllabus.");
        setSyllabus([]);
      } else {
        setSyllabus((data ?? []) as SyllabusItem[]);
      }

      setLoading(false);
    }

    loadSyllabus();
  }, [profile?.class_name, profile?.board, profile?.exam]);

  const subjects = Array.from(
    new Set(syllabus.map((item) => item.subject)),
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            PadhAI
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            My Syllabus
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {profile?.class_name
              ? `Class ${profile.class_name} • ${profile.board} • ${profile.exam}`
              : "Your personalized syllabus"}
          </p>
        </div>

        {!profile?.class_name ||
        !profile?.board ||
        !profile?.exam ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="text-4xl">📚</div>

            <h2 className="mt-4 text-xl font-bold">
              Complete your profile first
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please select your class, board and exam so PadhAI
              can show the correct syllabus.
            </p>
          </div>
        ) : loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400">
              Loading your syllabus...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : syllabus.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm dark:bg-slate-900">
            <div className="text-5xl">📚</div>

            <h2 className="mt-4 text-xl font-bold">
              Syllabus not available yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
              We don't have the syllabus for your selected
              class, board and exam yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {subjects.map((subject) => {
              const subjectItems = syllabus.filter(
                (item) => item.subject === subject,
              );

              return (
                <div
                  key={subject}
                  className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/40">
                      📖
                    </div>

                    <h2 className="text-xl font-bold">
                      {subject}
                    </h2>
                  </div>

                  <div className="mt-5 space-y-3">
                    {subjectItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                      >
                        <div className="flex gap-3">
                          <span className="font-mono text-sm text-blue-600">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div>
                            <h3 className="font-semibold">
                              {item.chapter}
                            </h3>

                            {item.topic && (
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {item.topic}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
