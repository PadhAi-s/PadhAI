import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface CurrentAffair {
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  mcqs: MCQ[];
}

function createEmptyAffair(serial: number): CurrentAffair {
  return {
    serial_no: serial,
    title: "",
    why_in_news: "",
    key_facts: "",
    exam_point: "",
    static_gk: "",
    mcqs: [
      {
        question: "",
        options: ["", "", "", ""],
        answer: "",
        explanation: "",
      },
    ],
  };
}

export function AdminCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [affairDate, setAffairDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [affairs, setAffairs] = useState<CurrentAffair[]>(
    Array.from({ length: 10 }, (_, index) =>
      createEmptyAffair(index + 1),
    ),
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  function updateAffair(
    index: number,
    field: keyof CurrentAffair,
    value: string,
  ) {
    setAffairs((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function updateMCQ(
    affairIndex: number,
    mcqIndex: number,
    field: keyof MCQ,
    value: string,
  ) {
    setAffairs((previous) =>
      previous.map((affair, index) => {
        if (index !== affairIndex) {
          return affair;
        }

        const updatedMCQs = affair.mcqs.map(
          (mcq, currentMCQIndex) => {
            if (currentMCQIndex !== mcqIndex) {
              return mcq;
            }

            return {
              ...mcq,
              [field]: value,
            };
          },
        );

        return {
          ...affair,
          mcqs: updatedMCQs,
        };
      }),
    );
  }

  function updateMCQOption(
    affairIndex: number,
    mcqIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setAffairs((previous) =>
      previous.map((affair, index) => {
        if (index !== affairIndex) {
          return affair;
        }

        const updatedMCQs = affair.mcqs.map(
          (mcq, currentMCQIndex) => {
            if (currentMCQIndex !== mcqIndex) {
              return mcq;
            }

            const updatedOptions = [...mcq.options];

            updatedOptions[optionIndex] = value;

            return {
              ...mcq,
              options: updatedOptions,
            };
          },
        );

        return {
          ...affair,
          mcqs: updatedMCQs,
        };
      }),
    );
  }

  function addMCQ(affairIndex: number) {
    setAffairs((previous) =>
      previous.map((affair, index) => {
        if (index !== affairIndex) {
          return affair;
        }

        return {
          ...affair,
          mcqs: [
            ...affair.mcqs,
            {
              question: "",
              options: ["", "", "", ""],
              answer: "",
              explanation: "",
            },
          ],
        };
      }),
    );
  }

  function removeMCQ(
    affairIndex: number,
    mcqIndex: number,
  ) {
    setAffairs((previous) =>
      previous.map((affair, index) => {
        if (index !== affairIndex) {
          return affair;
        }

        if (affair.mcqs.length <= 1) {
          return affair;
        }

        return {
          ...affair,
          mcqs: affair.mcqs.filter(
            (_, index) => index !== mcqIndex,
          ),
        };
      }),
    );
  }

  function validate(): string | null {
    if (!affairDate) {
      return "Please select current affairs date.";
    }

    for (let i = 0; i < affairs.length; i++) {
      const affair = affairs[i];

      if (!affair.title.trim()) {
        return `Top ${i + 1}: title is required.`;
      }

      if (!affair.why_in_news.trim()) {
        return `Top ${i + 1}: Why in News is required.`;
      }

      if (!affair.key_facts.trim()) {
        return `Top ${i + 1}: Key Facts is required.`;
      }

      if (!affair.exam_point.trim()) {
        return `Top ${i + 1}: Exam Point is required.`;
      }

      for (
        let mcqIndex = 0;
        mcqIndex < affair.mcqs.length;
        mcqIndex++
      ) {
        const mcq = affair.mcqs[mcqIndex];

        if (!mcq.question.trim()) {
          return `Top ${i + 1}, MCQ ${
            mcqIndex + 1
          }: question is required.`;
        }

        if (
          mcq.options.some(
            (option) => !option.trim(),
          )
        ) {
          return `Top ${i + 1}, MCQ ${
            mcqIndex + 1
          }: all 4 options are required.`;
        }

        if (!mcq.answer.trim()) {
          return `Top ${i + 1}, MCQ ${
            mcqIndex + 1
          }: answer is required.`;
        }
      }
    }

    return null;
  }

  async function handleUpload() {
    setError("");
    setMessage("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (!user) {
      setError("Admin session not found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const rows = affairs.map((affair) => ({
        affair_date: affairDate,
        serial_no: affair.serial_no,
        title: affair.title.trim(),
        why_in_news: affair.why_in_news.trim(),
        key_facts: affair.key_facts.trim(),
        exam_point: affair.exam_point.trim(),
        static_gk: affair.static_gk.trim() || null,
        mcqs: affair.mcqs.map((mcq) => ({
          question: mcq.question.trim(),
          options: mcq.options.map((option) =>
            option.trim(),
          ),
          answer: mcq.answer.trim(),
          explanation: mcq.explanation.trim(),
        })),
      }));

      const { error: insertError } = await supabase
        .from("current_affairs")
        .insert(rows);

      if (insertError) {
        throw insertError;
      }

      setMessage(
        `Successfully uploaded Top 10 Current Affairs for ${affairDate}.`,
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Current affairs upload error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affairs upload failed.",
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setAffairs(
      Array.from({ length: 10 }, (_, index) =>
        createEmptyAffair(index + 1),
      ),
    );

    setMessage("");
    setError("");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              PadhAI Admin
            </h1>

            <p className="text-sm text-slate-500">
              Current Affairs Manager
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/dashboard")
              }
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* ADMIN INFO */}
        <div className="mb-6 rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Welcome Admin
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {profile?.full_name ||
              user?.email ||
              "Administrator"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Upload daily Top 10 current affairs for students.
          </p>
        </div>

        {/* TITLE */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold">
            📰 Daily Top 10 Current Affairs
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add today's important current affairs with
            exam-focused MCQs.
          </p>
        </div>

        {/* MESSAGES */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">
              ❌ Upload Failed
            </p>

            <p className="mt-2 text-sm">
              {error}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">
            <p className="font-bold">
              ✅ Success
            </p>

            <p className="mt-2 text-sm">
              {message}
            </p>
          </div>
        )}

        {/* DATE */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-bold text-slate-700">
            Current Affairs Date
          </label>

          <input
            type="date"
            value={affairDate}
            onChange={(event) =>
              setAffairDate(event.target.value)
            }
            className="mt-2 w-full max-w-xs rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            All 10 current affairs will be saved with this
            date.
          </p>
        </div>

        {/* TOP 10 */}
        <div className="space-y-8">
          {affairs.map((affair, affairIndex) => (
            <section
              key={affair.serial_no}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              {/* CARD HEADER */}
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    TOP {affair.serial_no}
                  </span>

                  <h3 className="mt-2 text-xl font-bold">
                    Current Affair #{affair.serial_no}
                  </h3>
                </div>
              </div>

              {/* TITLE */}
              <div>
                <label className="text-sm font-bold">
                  Title *
                </label>

                <input
                  type="text"
                  value={affair.title}
                  onChange={(event) =>
                    updateAffair(
                      affairIndex,
                      "title",
                      event.target.value,
                    )
                  }
                  placeholder="Example: RBI announces new monetary policy..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* WHY IN NEWS */}
              <div className="mt-5">
                <label className="text-sm font-bold">
                  Why in News *
                </label>

                <textarea
                  rows={4}
                  value={affair.why_in_news}
                  onChange={(event) =>
                    updateAffair(
                      affairIndex,
                      "why_in_news",
                      event.target.value,
                    )
                  }
                  placeholder="Explain why this topic is in news..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* KEY FACTS */}
              <div className="mt-5">
                <label className="text-sm font-bold">
                  Key Facts *
                </label>

                <textarea
                  rows={5}
                  value={affair.key_facts}
                  onChange={(event) =>
                    updateAffair(
                      affairIndex,
                      "key_facts",
                      event.target.value,
                    )
                  }
                  placeholder="Important facts, dates, numbers, places, persons..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* EXAM POINT */}
              <div className="mt-5">
                <label className="text-sm font-bold">
                  Exam Point *
                </label>

                <textarea
                  rows={4}
                  value={affair.exam_point}
                  onChange={(event) =>
                    updateAffair(
                      affairIndex,
                      "exam_point",
                      event.target.value,
                    )
                  }
                  placeholder="What should UPSC/SSC/Banking/State exam students remember?"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* STATIC GK */}
              <div className="mt-5">
                <label className="text-sm font-bold">
                  Static GK
                </label>

                <textarea
                  rows={3}
                  value={affair.static_gk}
                  onChange={(event) =>
                    updateAffair(
                      affairIndex,
                      "static_gk",
                      event.target.value,
                    )
                  }
                  placeholder="Related static GK..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* MCQS */}
              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold">
                      📝 MCQs
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      Add one or more exam-style MCQs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      addMCQ(affairIndex)
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    + Add MCQ
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  {affair.mcqs.map(
                    (mcq, mcqIndex) => (
                      <div
                        key={mcqIndex}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <h5 className="font-bold">
                            MCQ {mcqIndex + 1}
                          </h5>

                          {affair.mcqs.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeMCQ(
                                  affairIndex,
                                  mcqIndex,
                                )
                              }
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* QUESTION */}
                        <label className="text-sm font-semibold">
                          Question *
                        </label>

                        <textarea
                          rows={3}
                          value={mcq.question}
                          onChange={(event) =>
                            updateMCQ(
                              affairIndex,
                              mcqIndex,
                              "question",
                              event.target.value,
                            )
                          }
                          placeholder="Enter MCQ question..."
                          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                        />

                        {/* OPTIONS */}
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {mcq.options.map(
                            (option, optionIndex) => (
                              <div key={optionIndex}>
                                <label className="text-sm font-semibold">
                                  Option{" "}
                                  {String.fromCharCode(
                                    65 + optionIndex,
                                  )}{" "}
                                  *
                                </label>

                                <input
                                  type="text"
                                  value={option}
                                  onChange={(event) =>
                                    updateMCQOption(
                                      affairIndex,
                                      mcqIndex,
                                      optionIndex,
                                      event.target.value,
                                    )
                                  }
                                  placeholder={`Option ${String.fromCharCode(
                                    65 + optionIndex,
                                  )}`}
                                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                                />
                              </div>
                            ),
                          )}
                        </div>

                        {/* ANSWER */}
                        <div className="mt-5">
                          <label className="text-sm font-semibold">
                            Correct Answer *
                          </label>

                          <select
                            value={mcq.answer}
                            onChange={(event) =>
                              updateMCQ(
                                affairIndex,
                                mcqIndex,
                                "answer",
                                event.target.value,
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                          >
                            <option value="">
                              Select correct option
                            </option>

                            <option value="A">
                              A
                            </option>

                            <option value="B">
                              B
                            </option>

                            <option value="C">
                              C
                            </option>

                            <option value="D">
                              D
                            </option>
                          </select>
                        </div>

                        {/* EXPLANATION */}
                        <div className="mt-5">
                          <label className="text-sm font-semibold">
                            Explanation
                          </label>

                          <textarea
                            rows={3}
                            value={mcq.explanation}
                            onChange={(event) =>
                              updateMCQ(
                                affairIndex,
                                mcqIndex,
                                "explanation",
                                event.target.value,
                              )
                            }
                            placeholder="Explain the correct answer..."
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={loading}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Reset Form
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="rounded-xl bg-green-600 px-8 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Uploading..."
              : "🚀 Publish Top 10 Current Affairs"}
          </button>
        </div>

        {/* DATABASE INFO */}
        <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-sm font-bold">
            Database
          </p>

          <p className="mt-2 font-mono text-xs text-slate-300">
            public.current_affairs
          </p>

          <p className="mt-3 text-xs text-slate-400">
            10 rows will be inserted with the selected
            affair_date. MCQs are stored in the mcqs JSONB
            column.
          </p>
        </div>
      </main>
    </div>
  );
}
