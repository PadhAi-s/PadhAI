import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AskPadhAI() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askAI() {
    const text = question.trim();

    if (!text) return;

    if (!user) {
      setError("Please login first.");
      return;
    }

    setLoading(true);
    setError("");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setQuestion("");

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("ask-padhai", {
          body: {
            question: text,
            student: {
              class_name: profile?.class_name,
              board: profile?.board,
              exam: profile?.exam,
            },
          },
        });

      if (functionError) {
        throw functionError;
      }

      if (!data?.answer) {
        throw new Error("AI did not return an answer.");
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("Ask PadhAI error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to get AI response.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      askAI();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask PadhAI
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/dashboard")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-3xl bg-white shadow-sm dark:bg-slate-900">
          {/* Intro */}
          <div className="border-b border-slate-200 p-6 dark:border-slate-800">
            <h2 className="text-2xl font-bold">
              🤖 Ask PadhAI
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Ask anything about your studies and get an
              AI-powered explanation.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {profile?.class_name && (
                <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                  Class {profile.class_name}
                </span>
              )}

              {profile?.board && (
                <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700 dark:bg-green-950/40 dark:text-green-300">
                  {profile.board}
                </span>
              )}

              {profile?.exam && (
                <span className="rounded-full bg-purple-50 px-3 py-1 font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                  {profile.exam}
                </span>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="min-h-[420px] space-y-4 p-6">
            {messages.length === 0 && (
              <div className="flex min-h-[350px] items-center justify-center text-center">
                <div>
                  <div className="text-6xl">🤖</div>

                  <h3 className="mt-4 text-xl font-bold">
                    What do you want to learn?
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Example: Explain Newton's third law in
                    simple language.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm text-white"
                      : "max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }
                >
                  <p className="whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  PadhAI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex gap-3">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={handleKeyDown}
                disabled={loading}
                rows={2}
                placeholder="Ask your question..."
                className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
              />

              <button
                type="button"
                onClick={askAI}
                disabled={loading || !question.trim()}
                className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "..." : "Ask"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Enter to ask • Shift + Enter for new line
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
