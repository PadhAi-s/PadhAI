import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface Message {
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

  const [subject, setSubject] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [topicName, setTopicName] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

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

    const userMessage: Message = {
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion("");

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke(
          "ask-padhai",
          {
            body: {
              question: trimmedQuestion,

              class_name:
                profile?.class_name ?? null,

              board:
                profile?.board ?? null,

              exam:
                profile?.exam ?? null,

              subject:
                subject || null,

              chapter_name:
                chapterName || null,

              topic_name:
                topicName || null,
            },
          },
        );

      if (functionError) {
        throw functionError;
      }

      if (!data?.answer) {
        throw new Error(
          "AI did not return an answer.",
        );
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to get AI response.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI Study Assistant
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/student/dashboard")
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Context */}

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-xl font-bold">
            🤖 Ask PadhAI
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ask questions based on your class,
            board and syllabus.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <input
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              placeholder="Subject e.g. Mathematics"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />

            <input
              value={chapterName}
              onChange={(event) =>
                setChapterName(event.target.value)
              }
              placeholder="Chapter"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />

            <input
              value={topicName}
              onChange={(event) =>
                setTopicName(event.target.value)
              }
              placeholder="Topic (optional)"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              Class: {profile?.class_name || "Not set"}
            </span>

            <span className="rounded-full bg-green-50 px-3 py-1 text-green-700 dark:bg-green-950/40 dark:text-green-300">
              Board: {profile?.board || "Not set"}
            </span>

            <span className="rounded-full bg-purple-50 px-3 py-1 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Exam: {profile?.exam || "Not set"}
            </span>
          </div>
        </div>

        {/* Chat */}

        <div className="rounded-2xl bg-white shadow-sm dark:bg-slate-900">
          <div className="min-h-[420px] space-y-5 p-6">
            {messages.length === 0 && (
              <div className="flex min-h-[350px] items-center justify-center text-center">
                <div>
                  <div className="text-5xl">
                    🤖
                  </div>

                  <h3 className="mt-4 text-xl font-bold">
                    How can I help you?
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Ask me to explain a concept,
                    solve a problem, create notes,
                    or help you prepare for an exam.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-5 py-3 text-white"
                      : "max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-5 py-3 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  }
                >
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-5 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  PadhAI is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Error */}

          {error && (
            <div className="mx-6 mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          {/* Input */}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 p-4 dark:border-slate-800"
          >
            <div className="flex gap-3">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                disabled={loading}
                rows={2}
                placeholder="Ask PadhAI anything..."
                className="min-w-0 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-blue-950"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
                className="self-end rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "..."
                  : "Ask"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
