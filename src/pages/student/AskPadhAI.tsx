import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function AskPadhAI() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Load latest conversation
  // =====================================================

  useEffect(() => {
    async function loadConversation() {
      if (!user) {
        setLoadingHistory(false);
        return;
      }

      try {
        const { data: conversation, error: conversationError } =
          await supabase
            .from("ai_conversations")
            .select("id")
            .eq("user_id", user.id)
            .order("updated_at", {
              ascending: false,
            })
            .limit(1)
            .maybeSingle();

        if (conversationError) {
          throw conversationError;
        }

        if (!conversation) {
          setConversationId(null);
          setMessages([]);
          return;
        }

        setConversationId(conversation.id);

        const { data: history, error: historyError } =
          await supabase
            .from("ai_messages")
            .select("id, role, content, created_at")
            .eq(
              "conversation_id",
              conversation.id,
            )
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: true,
            });

        if (historyError) {
          throw historyError;
        }

        setMessages(
          (history ?? []).map((message) => ({
            id: message.id,
            role:
              message.role === "assistant"
                ? "assistant"
                : "user",
            content: message.content,
            created_at: message.created_at,
          })),
        );
      } catch (err) {
        console.error(
          "Load PadhAI history error:",
          err,
        );

        setError(
          "Unable to load previous chat.",
        );
      } finally {
        setLoadingHistory(false);
      }
    }

    loadConversation();
  }, [user]);

  // =====================================================
  // Create new conversation
  // =====================================================

  async function createConversation(
    firstQuestion: string,
  ) {
    if (!user) {
      throw new Error("Please login first.");
    }

    const title =
      firstQuestion.length > 60
        ? `${firstQuestion.slice(0, 60)}...`
        : firstQuestion;

    const { data, error: createError } =
      await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title,
        })
        .select("id")
        .single();

    if (createError) {
      throw createError;
    }

    setConversationId(data.id);

    return data.id;
  }

  // =====================================================
  // Save message
  // =====================================================

  async function saveMessage(
    conversation_id: string,
    role: "user" | "assistant",
    content: string,
  ) {
    if (!user) {
      throw new Error("Please login first.");
    }

    const { data, error: saveError } =
      await supabase
        .from("ai_messages")
        .insert({
          conversation_id,
          user_id: user.id,
          role,
          content,
        })
        .select(
          "id, role, content, created_at",
        )
        .single();

    if (saveError) {
      throw saveError;
    }

    return data;
  }

  // =====================================================
  // Ask PadhAI
  // =====================================================

  async function handleAsk(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion) {
      setError(
        "Please enter your question.",
      );
      return;
    }

    if (!user) {
      setError("Please login first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // -------------------------------------------------
      // Create conversation if needed
      // -------------------------------------------------

      let activeConversationId =
        conversationId;

      if (!activeConversationId) {
        activeConversationId =
          await createConversation(
            trimmedQuestion,
          );
      }

      // -------------------------------------------------
      // Save student message
      // -------------------------------------------------

      const userMessage =
        await saveMessage(
          activeConversationId,
          "user",
          trimmedQuestion,
        );

      setMessages((previous) => [
        ...previous,
        {
          id: userMessage.id,
          role: "user",
          content: userMessage.content,
          created_at:
            userMessage.created_at,
        },
      ]);

      setQuestion("");

      // -------------------------------------------------
      // Call Gemini Edge Function
      // -------------------------------------------------

      const {
        data,
        error: functionError,
      } = await supabase.functions.invoke(
        "ask-padhai",
        {
          body: {
            question: trimmedQuestion,

            conversation_id:
              activeConversationId,

            student: {
              class_name:
                profile?.class_name ??
                null,

              board:
                profile?.board ?? null,

              exam:
                profile?.exam ?? null,
            },
          },
        },
      );

      if (functionError) {
        throw functionError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.answer) {
        throw new Error(
          "AI did not return an answer.",
        );
      }

      // -------------------------------------------------
      // Save AI answer
      // -------------------------------------------------

      const assistantMessage =
        await saveMessage(
          activeConversationId,
          "assistant",
          data.answer,
        );

      setMessages((previous) => [
        ...previous,
        {
          id: assistantMessage.id,
          role: "assistant",
          content:
            assistantMessage.content,
          created_at:
            assistantMessage.created_at,
        },
      ]);
    } catch (err) {
      console.error(
        "Ask PadhAI error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect with PadhAI.",
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // New Chat
  // =====================================================

  async function handleNewChat() {
    if (loading) return;

    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI 🤖
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your AI Study Assistant
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              + New Chat
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/student/dashboard",
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Student Context */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Asking as
          </p>

          <h2 className="mt-1 text-lg font-bold">
            {profile?.full_name ||
              user?.email ||
              "Student"}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {profile?.class_name && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                Class{" "}
                {profile.class_name}
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

        {/* Chat */}
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-lg font-bold">
              Ask your question
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ask anything related to your studies.
            </p>
          </div>

          {/* Loading History */}
          {loadingHistory && (
            <div className="mb-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              Loading previous chat...
            </div>
          )}

          {/* Messages */}
          {!loadingHistory &&
            messages.length > 0 && (
              <div className="mb-6 space-y-4">
                {messages.map(
                  (message) => (
                    <div
                      key={message.id}
                      className={
                        message.role ===
                        "user"
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >
                      <div
                        className={
                          message.role ===
                          "user"
                            ? "max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white"
                            : "max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        }
                      >
                        {message.role ===
                          "assistant" && (
                          <div className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
                            🤖 PadhAI
                          </div>
                        )}

                        <div className="whitespace-pre-wrap">
                          {
                            message.content
                          }
                        </div>
                      </div>
                    </div>
                  ),
                )}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      🤖 PadhAI is
                      thinking...
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Empty State */}
          {!loadingHistory &&
            messages.length === 0 && (
              <div className="mb-6 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <div className="text-4xl">
                  🤖
                </div>

                <h3 className="mt-3 font-bold">
                  Start learning with PadhAI
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Ask your first question
                  below.
                </p>
              </div>
            )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          {/* Ask Form */}
          <form onSubmit={handleAsk}>
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value,
                )
              }
              placeholder="Example: What is photosynthesis?"
              rows={5}
              disabled={loading}
              className="w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
            />

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400">
                PadhAI can make mistakes.
                Verify important information.
              </p>

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Thinking..."
                  : "Ask PadhAI 🤖"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
