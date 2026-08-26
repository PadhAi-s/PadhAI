import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export function AskPadhAI() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAsk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter your question.");
      return;
    }

    if (!user) {
      setError("Please login first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("ask-padhai", {
          body: {
            question: trimmedQuestion,
            student: {
              class_name: profile?.class_name ?? null,
              board: profile?.board ?? null,
              exam: profile?.exam ?? null,
            },
          },
        });

      if (functionError) {
        throw functionError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.answer) {
        throw new Error("AI did not return an answer.");
      }

      setAnswer(data.answer);
    } catch (err) {
      console.error("Ask PadhAI error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect with PadhAI.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI 🤖
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your AI Study Assistant
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

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Student context */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Asking as
          </p>

          <h2 className="mt-1 text-lg font-bold">
            {profile?.full_name || user?.email || "Student"}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {profile?.class_name && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                Class {profile.class_name}
              </span>
            )}

            {profile?.board && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/50 dark:text-green-300">
                {profile.board}
              </span>
            )}

            {profile?.exam && (
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                {profile.exam}
              </span>
            )}
          </div>
        </div>

        {/* Ask form */}
        <form
          onSubmit={handleAsk}
          className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900"
        >
          <label
            htmlFor="question"
            className="block text-lg font-bold"
          >
            Ask your question
          </label>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ask anything related to your studies.
          </p>

          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: Explain Newton's third law with an example."
            rows={6}
            disabled={loading}
            className="mt-5 w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
          />

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "PadhAI is thinking..." : "Ask PadhAI 🤖"}
          </button>
        </form>

        {/* Answer */}
        {answer && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>

              <h2 className="text-lg font-bold">
                PadhAI Answer
              </h2>
            </div>

            <div className="mt-5 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-300">
              {answer}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
