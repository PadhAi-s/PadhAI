import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface CurrentAffair {
  id?: string;
  affair_date: string;
  question: string;
  answer: string;
  explanation: string;
  order_no: number;
  published: boolean;
}

const emptyAffair = (
  date: string,
  orderNo: number,
): CurrentAffair => ({
  affair_date: date,
  question: "",
  answer: "",
  explanation: "",
  order_no: orderNo,
  published: false,
});

export function AdminCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAffairs();
  }, [selectedDate]);

  async function loadAffairs() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: fetchError } = await supabase
        .from("daily_current_affairs")
        .select(
          "id,affair_date,question,answer,explanation,order_no,published",
        )
        .eq("affair_date", selectedDate)
        .order("order_no", {
          ascending: true,
        });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setAffairs(data as CurrentAffair[]);
      } else {
        setAffairs(
          Array.from(
            { length: 10 },
            (_, index) =>
              emptyAffair(selectedDate, index + 1),
          ),
        );
      }
    } catch (err) {
      console.error(
        "Current affairs loading error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affairs load nahi ho paye.",
      );

      setAffairs([]);
    } finally {
      setLoading(false);
    }
  }

  function updateAffair(
    index: number,
    field: keyof CurrentAffair,
    value: string | boolean,
  ) {
    setAffairs((current) =>
      current.map((affair, affairIndex) => {
        if (affairIndex !== index) {
          return affair;
        }

        return {
          ...affair,
          [field]: value,
        };
      }),
    );
  }

  function addAffair() {
    if (affairs.length >= 10) {
      setError("Maximum 10 current affairs allowed.");
      return;
    }

    setError("");

    setAffairs((current) => [
      ...current,
      emptyAffair(
        selectedDate,
        current.length + 1,
      ),
    ]);
  }

  function removeAffair(index: number) {
    setAffairs((current) =>
      current
        .filter((_, affairIndex) => affairIndex !== index)
        .map((affair, affairIndex) => ({
          ...affair,
          order_no: affairIndex + 1,
        })),
    );
  }

  async function saveAffairs() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Admin session not found.");
      return;
    }

    if (affairs.length === 0) {
      setError("At least one current affair is required.");
      return;
    }

    for (let i = 0; i < affairs.length; i++) {
      const affair = affairs[i];

      if (!affair.question.trim()) {
        setError(
          `Top ${i + 1}: Question is required.`,
        );
        return;
      }

      if (!affair.answer.trim()) {
        setError(
          `Top ${i + 1}: Answer is required.`,
        );
        return;
      }
    }

    setSaving(true);

    try {
      const rows = affairs.map((affair, index) => ({
        ...(affair.id
          ? { id: affair.id }
          : {}),
        affair_date: selectedDate,
        question: affair.question.trim(),
        answer: affair.answer.trim(),
        explanation:
          affair.explanation.trim() || null,
        order_no: index + 1,
        published: affair.published,
      }));

      const { data, error: upsertError } =
        await supabase
          .from("daily_current_affairs")
          .upsert(rows, {
            onConflict:
              "affair_date,order_no",
          })
          .select(
            "id,affair_date,question,answer,explanation,order_no,published",
          );

      if (upsertError) {
        throw upsertError;
      }

      setAffairs(
        (data || []) as CurrentAffair[],
      );

      setMessage(
        `${affairs.length} current affair${
          affairs.length === 1 ? "" : "s"
        } saved successfully.`,
      );
    } catch (err) {
      console.error(
        "Current affairs save error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affairs save nahi ho paye.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function publishAll() {
    setError("");
    setMessage("");

    if (!affairs.length) {
      setError("No current affairs available.");
      return;
    }

    for (const affair of affairs) {
      if (
        !affair.question.trim() ||
        !affair.answer.trim()
      ) {
        setError(
          "Publish karne se pehle sabhi questions aur answers fill karo.",
        );
        return;
      }
    }

    setSaving(true);

    try {
      const { data, error: publishError } =
        await supabase
          .from("daily_current_affairs")
          .update({
            published: true,
          })
          .eq("affair_date", selectedDate)
          .select(
            "id,affair_date,question,answer,explanation,order_no,published",
          );

      if (publishError) {
        throw publishError;
      }

      setAffairs(
        (data || []) as CurrentAffair[],
      );

      setMessage(
        `Current Affairs for ${selectedDate} published successfully.`,
      );
    } catch (err) {
      console.error(
        "Current affairs publish error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Publish nahi ho paya.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function unpublishAll() {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const { data, error: updateError } =
        await supabase
          .from("daily_current_affairs")
          .update({
            published: false,
          })
          .eq("affair_date", selectedDate)
          .select(
            "id,affair_date,question,answer,explanation,order_no,published",
          );

      if (updateError) {
        throw updateError;
      }

      setAffairs(
        (data || []) as CurrentAffair[],
      );

      setMessage(
        `Current Affairs for ${selectedDate} unpublished.`,
      );
    } catch (err) {
      console.error(
        "Current affairs unpublish error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unpublish nahi ho paya.",
      );
    } finally {
      setSaving(false);
    }
  }

  const publishedCount = affairs.filter(
    (affair) => affair.published,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI Admin
            </h1>

            <p className="text-sm text-slate-500">
              Daily Current Affairs
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* ADMIN INFO */}
        <div className="mb-6 rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Welcome Admin
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {profile?.full_name ||
              user?.email ||
              "Administrator"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage Daily Current Affairs — Top 10.
          </p>
        </div>

        {/* TITLE */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-4xl">
              📰
            </div>

            <h2 className="mt-3 text-2xl font-bold">
              Daily Current Affairs — Top 10
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add, save and publish today's
              important current affairs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Select Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              className="mt-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* STATS */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Questions
            </p>

            <p className="mt-1 text-3xl font-bold">
              {affairs.length}/10
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Published
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Date
            </p>

            <p className="mt-1 text-lg font-bold">
              {selectedDate}
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✅ {message}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Current Affairs loading...
            </p>
          </div>
        ) : (
          <>
            {/* ACTION BAR */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {affairs.length < 10 && (
                <button
                  type="button"
                  onClick={addAffair}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  + Add Current Affair
                </button>
              )}

              <button
                type="button"
                onClick={saveAffairs}
                disabled={saving}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : "Save / Update"}
              </button>

              <button
                type="button"
                onClick={publishAll}
                disabled={saving}
                className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Publish All
              </button>

              <button
                type="button"
                onClick={unpublishAll}
                disabled={saving}
                className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Unpublish
              </button>
            </div>

            {/* AFFAIRS */}
            <div className="space-y-5">
              {affairs.map(
                (affair, index) => (
                  <div
                    key={
                      affair.id ||
                      `new-${index}`
                    }
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    {/* CARD HEADER */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {index + 1}
                        </span>

                        <div>
                          <h3 className="font-bold">
                            Current Affair #{index + 1}
                          </h3>

                          <p className="text-xs text-slate-500">
                            Order {index + 1}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            affair.published
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {affair.published
                            ? "PUBLISHED"
                            : "DRAFT"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeAffair(index)
                          }
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* QUESTION */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Question / Headline
                      </label>

                      <textarea
                        value={affair.question}
                        onChange={(event) =>
                          updateAffair(
                            index,
                            "question",
                            event.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Example: RBI ne August 2026 mein repo rate ko lekar kya decision liya?"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* ANSWER */}
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-slate-700">
                        Answer
                      </label>

                      <textarea
                        value={affair.answer}
                        onChange={(event) =>
                          updateAffair(
                            index,
                            "answer",
                            event.target.value,
                          )
                        }
                        rows={2}
                        placeholder="Enter correct answer"
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* EXPLANATION */}
                    <div className="mt-4">
                      <label className="text-sm font-semibold text-slate-700">
                        Explanation
                        <span className="ml-1 font-normal text-slate-400">
                          (Optional)
                        </span>
                      </label>

                      <textarea
                        value={
                          affair.explanation
                        }
                        onChange={(event) =>
                          updateAffair(
                            index,
                            "explanation",
                            event.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Short explanation for students..."
                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* EMPTY */}
            {affairs.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="text-4xl">
                  📰
                </div>

                <h3 className="mt-3 font-bold">
                  No Current Affairs
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Add current affairs for
                  {selectedDate}.
                </p>

                <button
                  type="button"
                  onClick={addAffair}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Add First Affair
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminCurrentAffairs;
