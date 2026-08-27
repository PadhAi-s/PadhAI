import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function AskPadhAI() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // Load latest conversation
  // =====================================================

  useEffect(() => {
    if (!user) return;

    loadLatestConversation();
  }, [user]);

  async function loadLatestConversation() {
    if (!user) return;

    setHistoryLoading(true);
    setError("");

    try {
      const { data: conversation, error: conversationError } =
        await supabase
          .from("ai_conversations")
          .select("id")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
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

      const { data: chatMessages, error: messagesError } =
        await supabase
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", conversation.id)
          .order("created_at", { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      setMessages((chatMessages ?? []) as ChatMessage[]);
    } catch (err) {
      console.error("Chat history loading error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load chat history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // =====================================================
  // Create conversation
  // =====================================================

  async function createConversation(firstQuestion: string) {
    if (!user) {
      throw new Error("Please login first.");
    }

    const title =
      firstQuestion.length > 60
        ? `${firstQuestion.substring(0, 60)}...`
        : firstQuestion;

    const { data, error: conversationError } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: user.id,
        title,
      })
      .select("id")
      .single();

    if (conversationError) {
      throw conversationError;
    }

    if (!data) {
      throw new Error("Unable to create conversation.");
    }

    setConversationId(data.id);

    return data.id;
  }

  // =====================================================
  // Save message
  // =====================================================

  async function saveMessage(
    currentConversationId: string,
    role: "user" | "assistant",
    content: string,
  ) {
    const { data, error: messageError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: currentConversationId,
        role,
        content,
      })
      .select("id, role, content, created_at")
      .single();

    if (messageError) {
      throw messageError;
    }

    if (!data) {
      throw new Error("Unable to save message.");
    }

    return data as ChatMessage;
  }

  // =====================================================
  // Update conversation timestamp
  // =====================================================

  async function touchConversation(currentConversationId: string) {
    const { error } = await supabase
      .from("ai_conversations")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentConversationId);

    if (error) {
      console.error("Conversation update error:", error);
    }
  }

  // =====================================================
  // Ask PadhAI
  // =====================================================

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
      // -----------------------------------------------
      // 1. Get/create conversation
      // -----------------------------------------------

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        currentConversationId =
          await createConversation(trimmedQuestion);
      }

      // -----------------------------------------------
      // 2. Save student question
      // -----------------------------------------------

      const userMessage = await saveMessage(
        currentConversationId,
        "user",
        trimmedQuestion,
      );

      setMessages((previous) => [
        ...previous,
        userMessage,
      ]);

      // Clear input
      setQuestion("");

      // -----------------------------------------------
      // 3. Send question to Gemini Edge Function
      // -----------------------------------------------

      const { data, error: functionError } =
        await supabase.functions.invoke("ask-padhai", {
          body: {
            question: trimmedQuestion,

            student: {
              class_name: profile?.class_name ?? null,
              board: profile?.board ?? null,
              exam: profile?.exam ?? null,
            },

            conversation_id: currentConversationId,
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

      // -----------------------------------------------
      // 4. Save AI answer
      // -----------------------------------------------

      const assistantMessage = await saveMessage(
        currentConversationId,
        "assistant",
        data.answer,
      );

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      // -----------------------------------------------
      // 5. Update conversation timestamp
      // -----------------------------------------------

      await touchConversation(currentConversationId);
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

  // =====================================================
  // New Chat
  // =====================================================

  function handleNewChat() {
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">

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
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              + New Chat
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
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

        {/* History Loading */}
        {historyLoading && (
          <div className="mb-6 rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-400">
            Loading your previous chat...
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="mb-6 space-y-4">

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
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-blue-600 px-5 py-4 text-white shadow-sm"
                      : "max-w-[85%] rounded-2xl rounded-bl-md bg-white px-5 py-4 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-300"
                  }
                >

                  <div className="mb-2 text-xs font-semibold opacity-70">
                    {message.role === "user"
                      ? "You"
                      : "🤖 PadhAI"}
                  </div>

                  <div className="whitespace-pre-wrap leading-7">
                    {message.content}
                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

        {/* Ask Form */}
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
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="Example: Explain Newton's third law with an example."
            rows={5}
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
            {loading
              ? "PadhAI is thinking..."
              : "Ask PadhAI 🤖"}
          </button>

        </form>

      </main>
    </div>
  );
}
