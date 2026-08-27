import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function AskPadhAI() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load conversations
  // --------------------------------------------------

  async function loadConversations() {
    if (!user) return;

    setHistoryLoading(true);

    const { data, error } = await supabase
      .from("ai_conversations")
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Conversation loading error:", error);
      setError("Unable to load chat history.");
    } else {
      setConversations(data ?? []);
    }

    setHistoryLoading(false);
  }

  // --------------------------------------------------
  // Load messages
  // --------------------------------------------------

  async function loadMessages(id: string) {
    setError("");

    const { data, error } = await supabase
      .from("ai_messages")
      .select("id, conversation_id, role, content, created_at")
      .eq("conversation_id", id)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Message loading error:", error);
      setError("Unable to load conversation.");
      return;
    }

    setConversationId(id);
    setMessages((data as Message[]) ?? []);
  }

  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------

  useEffect(() => {
    if (!user) {
      setHistoryLoading(false);
      return;
    }

    loadConversations();
  }, [user]);

  // --------------------------------------------------
  // New chat
  // --------------------------------------------------

  function handleNewChat() {
    setConversationId(null);
    setMessages([]);
    setQuestion("");
    setError("");
  }

  // --------------------------------------------------
  // Ask PadhAI
  // --------------------------------------------------

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

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("ask-padhai", {
          body: {
            question: trimmedQuestion,
            conversation_id: conversationId,
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

      const newConversationId =
        data.conversation_id ?? conversationId;

      setConversationId(newConversationId);

      // Immediately show user question
      const temporaryUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: newConversationId,
        role: "user",
        content: trimmedQuestion,
        created_at: new Date().toISOString(),
      };

      const temporaryAIMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        conversation_id: newConversationId,
        role: "assistant",
        content: data.answer,
        created_at: new Date().toISOString(),
      };

      setMessages((current) => [
        ...current,
        temporaryUserMessage,
        temporaryAIMessage,
      ]);

      setQuestion("");

      // Refresh sidebar history
      await loadConversations();
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

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
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

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* ================================
              CHAT HISTORY
              ================================= */}
          <aside className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">
                Chat History
              </h2>

              <button
                type="button"
                onClick={handleNewChat}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                + New Chat
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {historyLoading ? (
                <p className="px-2 py-3 text-sm text-slate-400">
                  Loading chats...
                </p>
              ) : conversations.length === 0 ? (
                <p className="px-2 py-3 text-sm text-slate-400">
                  No previous chats.
                </p>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      loadMessages(conversation.id)
                    }
                    className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                      conversation.id === conversationId
                        ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <p className="truncate">
                      {conversation.title || "New Chat"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        conversation.updated_at,
                      ).toLocaleDateString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* ================================
              CHAT AREA
              ================================= */}
          <section className="flex min-h-[700px] flex-col rounded-2xl bg-white shadow-sm dark:bg-slate-900">

            {/* Student context */}
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Asking as
              </p>

              <h2 className="mt-1 font-bold">
                {profile?.full_name ||
                  user?.email ||
                  "Student"}
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

            {/* Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {messages.length === 0 ? (
                <div className="flex min-h-[450px] items-center justify-center">
                  <div className="max-w-md text-center">
                    <div className="text-5xl">🤖</div>

                    <h2 className="mt-4 text-2xl font-bold">
                      Ask PadhAI
                    </h2>

                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                      Ask any study question and PadhAI
                      will explain it step by step.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <p className="mb-1 text-xs font-semibold opacity-70">
                        {message.role === "user"
                          ? "You"
                          : "🤖 PadhAI"}
                      </p>

                      <div className="whitespace-pre-wrap leading-7">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    🤖 PadhAI is thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mx-5 mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-950/30 dark:text-red-300">
                ❌ {error}
              </div>
            )}

            {/* Ask form */}
            <form
              onSubmit={handleAsk}
              className="border-t border-slate-200 p-5 dark:border-slate-800"
            >
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Ask PadhAI anything..."
                rows={4}
                disabled={loading}
                className="w-full resize-none rounded-2xl border border-slate-300 bg-white p-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    loading || !question.trim()
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Thinking..."
                    : "Ask PadhAI 🤖"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
