import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface CurrentAffair {
  id: string;
  affair_date: string;
  serial_no: number;

  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;

  mcqs: MCQ[];

  published: boolean;
  category: string;

  title_hi: string;
  why_in_news_hi: string;
  key_facts_hi: string;
  exam_point_hi: string;
  static_gk_hi: string;
}

const CATEGORIES = [
  "National",
  "International",
  "Economy",
  "Science & Technology",
  "Environment",
  "Defence",
  "Sports",
  "Awards",
  "Appointments",
  "Government Schemes",
  "Reports & Index",
  "Important Days",
  "Other",
];

const EMPTY_FORM: CurrentAffair = {
  id: "",
  affair_date: "",
  serial_no: 1,

  title: "",
  why_in_news: "",
  key_facts: "",
  exam_point: "",
  static_gk: "",

  mcqs: [],

  published: true,
  category: "National",

  title_hi: "",
  why_in_news_hi: "",
  key_facts_hi: "",
  exam_point_hi: "",
  static_gk_hi: "",
};

/* =====================================================
   PAGE
===================================================== */

export function AdminCurrentAffairs() {
  const navigate = useNavigate();

  const [affairs, setAffairs] =
    useState<CurrentAffair[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<CurrentAffair>(
      EMPTY_FORM,
    );

  const [showForm, setShowForm] =
    useState(false);

  const [csvText, setCsvText] =
    useState("");

  const [csvError, setCsvError] =
    useState("");

  const [csvPreview, setCsvPreview] =
    useState<CurrentAffair[]>([]);

  /* =====================================================
     LOAD
  ===================================================== */

  useEffect(() => {
    document.title =
      "Admin Current Affairs | VIDYZEN";

    void loadCurrentAffairs();
  }, []);

  async function loadCurrentAffairs() {
    setLoading(true);
    setError("");

    try {
      /*
       * IMPORTANT:
       * Supabase generated Database type mein
       * current_affairs kabhi GenericStringError
       * infer ho raha tha.
       *
       * Isliye query ko any boundary par rakha.
       * Baaki application strongly typed hai.
       */
      const db = supabase as any;

      const {
        data: rawData,
        error: fetchError,
      } = await db
        .from("current_affairs")
        .select("*")
        .order("affair_date", {
          ascending: false,
        })
        .order("serial_no", {
          ascending: true,
        });

      console.log(
        "Admin Current Affairs Response:",
        {
          rawData,
          fetchError,
        },
      );

      if (fetchError) {
        throw fetchError;
      }

      const rows =
        Array.isArray(rawData)
          ? rawData
          : [];

      const formatted =
        rows
          .map(normalizeCurrentAffair)
          .filter(
            (
              item,
            ): item is CurrentAffair =>
              item !== null,
          );

      setAffairs(formatted);
    } catch (err) {
      console.error(
        "Admin Current Affairs Load Error:",
        err,
      );

      setAffairs([]);

      setError(
        err instanceof Error
          ? err.message
          : "Current affairs load nahi ho paya.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredAffairs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return affairs.filter(
        (item) => {
          const category =
            item.category ||
            "Other";

          if (
            selectedCategory !==
              "All" &&
            category !==
              selectedCategory
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchableText = [
            item.title,
            item.why_in_news,
            item.key_facts,
            item.exam_point,
            item.static_gk,
            item.title_hi,
            item.why_in_news_hi,
            item.key_facts_hi,
            item.exam_point_hi,
            item.static_gk_hi,
            item.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            query,
          );
        },
      );
    }, [
      affairs,
      search,
      selectedCategory,
    ]);

  /* =====================================================
     FORM
  ===================================================== */

  function updateForm(
    field: keyof CurrentAffair,
    value: unknown,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      }),
    );
  }

  function startAdd() {
    const nextSerial =
      affairs.length > 0
        ? Math.max(
            ...affairs.map(
              (item) =>
                item.serial_no,
            ),
          ) + 1
        : 1;

    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      serial_no:
        nextSerial,
      affair_date:
        new Date()
          .toISOString()
          .slice(0, 10),
    });

    setShowForm(true);
    setError("");
  }

  function startEdit(
    item: CurrentAffair,
  ) {
    setEditingId(item.id);

    setForm({
      ...item,
      mcqs: item.mcqs.map(
        (mcq) => ({
          ...mcq,
          options: [
            ...mcq.options,
          ],
        }),
      ),
    });

    setShowForm(true);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
    });
  }

  /* =====================================================
     VALIDATE
  ===================================================== */

  function validateForm(): string | null {
    if (!form.affair_date.trim()) {
      return "Affair date required hai.";
    }

    if (
      !Number.isFinite(
        Number(form.serial_no),
      )
    ) {
      return "Serial number valid nahi hai.";
    }

    if (!form.title.trim()) {
      return "English title required hai.";
    }

    if (!form.why_in_news.trim()) {
      return "Why in News required hai.";
    }

    if (!form.key_facts.trim()) {
      return "Key Facts required hai.";
    }

    if (!form.exam_point.trim()) {
      return "Exam Point required hai.";
    }

    if (!form.static_gk.trim()) {
      return "Static GK required hai.";
    }

    if (!form.category.trim()) {
      return "Category required hai.";
    }

    if (!form.title_hi.trim()) {
      return "Hindi title required hai.";
    }

    if (!form.why_in_news_hi.trim()) {
      return "Hindi Why in News required hai.";
    }

    if (!form.key_facts_hi.trim()) {
      return "Hindi Key Facts required hai.";
    }

    if (!form.exam_point_hi.trim()) {
      return "Hindi Exam Point required hai.";
    }

    if (!form.static_gk_hi.trim()) {
      return "Hindi Static GK required hai.";
    }

    for (
      let i = 0;
      i < form.mcqs.length;
      i++
    ) {
      const mcq =
        form.mcqs[i];

      if (
        !mcq.question.trim()
      ) {
        return `MCQ ${i + 1}: question required hai.`;
      }

      if (
        mcq.options.length !==
        4
      ) {
        return `MCQ ${i + 1}: exactly 4 options required hain.`;
      }

      if (
        mcq.options.some(
          (option) =>
            !option.trim(),
        )
      ) {
        return `MCQ ${i + 1}: all options required hain.`;
      }

      if (!mcq.answer.trim()) {
        return `MCQ ${i + 1}: answer required hai.`;
      }

      if (
        !mcq.options.includes(
          mcq.answer,
        )
      ) {
        return `MCQ ${i + 1}: answer options mein se ek hona chahiye.`;
      }
    }

    return null;
  }

  /* =====================================================
     SAVE
  ===================================================== */

  async function saveCurrentAffair() {
    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        affair_date:
          form.affair_date,
        serial_no:
          Number(form.serial_no),

        title:
          form.title.trim(),

        why_in_news:
          form.why_in_news.trim(),

        key_facts:
          form.key_facts.trim(),

        exam_point:
          form.exam_point.trim(),

        static_gk:
          form.static_gk.trim(),

        mcqs: form.mcqs.map(
          (mcq) => ({
            question:
              mcq.question.trim(),
            options:
              mcq.options.map(
                (option) =>
                  option.trim(),
              ),
            answer:
              mcq.answer.trim(),
            explanation:
              mcq.explanation?.trim() ||
              "",
          }),
        ),

        published:
          Boolean(form.published),

        category:
          form.category.trim(),

        title_hi:
          form.title_hi.trim(),

        why_in_news_hi:
          form.why_in_news_hi.trim(),

        key_facts_hi:
          form.key_facts_hi.trim(),

        exam_point_hi:
          form.exam_point_hi.trim(),

        static_gk_hi:
          form.static_gk_hi.trim(),
      };

      const db = supabase as any;

      if (editingId) {
        const {
          error: updateError,
        } = await db
          .from("current_affairs")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const {
          error: insertError,
        } = await db
          .from("current_affairs")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }
      }

      await loadCurrentAffairs();

      cancelForm();
    } catch (err) {
      console.error(
        "Current Affair Save Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affair save nahi hua.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE
  ===================================================== */

  async function deleteCurrentAffair(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Kya aap is current affair ko permanently delete karna chahte hain?",
      );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const db = supabase as any;

      const {
        error: deleteError,
      } = await db
        .from("current_affairs")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setAffairs(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== id,
          ),
      );
    } catch (err) {
      console.error(
        "Current Affair Delete Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affair delete nahi hua.",
      );
    }
  }

  /* =====================================================
     MCQ EDITOR
  ===================================================== */

  function addMCQ() {
    setForm(
      (previous) => ({
        ...previous,
        mcqs: [
          ...previous.mcqs,
          {
            question: "",
            options: [
              "",
              "",
              "",
              "",
            ],
            answer: "",
            explanation:
              "",
          },
        ],
      }),
    );
  }

  function removeMCQ(
    index: number,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        mcqs:
          previous.mcqs.filter(
            (_, i) =>
              i !== index,
          ),
      }),
    );
  }

  function updateMCQ(
    index: number,
    field: keyof MCQ,
    value: unknown,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        mcqs:
          previous.mcqs.map(
            (mcq, i) =>
              i === index
                ? {
                    ...mcq,
                    [field]:
                      value,
                  }
                : mcq,
          ),
      }),
    );
  }

  function updateMCQOption(
    mcqIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setForm(
      (previous) => ({
        ...previous,
        mcqs:
          previous.mcqs.map(
            (mcq, i) => {
              if (
                i !==
                mcqIndex
              ) {
                return mcq;
              }

              const options = [
                ...mcq.options,
              ];

              options[
                optionIndex
              ] = value;

              return {
                ...mcq,
                options,
              };
            },
          ),
      }),
    );
  }

  /* =====================================================
     CSV FILE
  ===================================================== */

  function handleCSVFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvError("");
    setCsvPreview([]);

    const reader =
      new FileReader();

    reader.onload = () => {
      const text =
        typeof reader.result ===
        "string"
          ? reader.result
          : "";

      setCsvText(text);

      try {
        const parsed =
          parseCSVToCurrentAffairs(
            text,
          );

        setCsvPreview(
          parsed,
        );
      } catch (err) {
        setCsvError(
          err instanceof Error
            ? err.message
            : "CSV parse nahi ho paya.",
        );
      }
    };

    reader.onerror = () => {
      setCsvError(
        "CSV file read nahi ho payi.",
      );
    };

    reader.readAsText(file);
  }

  /* =====================================================
     CSV IMPORT
  ===================================================== */

  async function importCSV() {
    setCsvError("");

    if (!csvText.trim()) {
      setCsvError(
        "Pehle CSV upload karo.",
      );
      return;
    }

    let parsed: CurrentAffair[];

    try {
      parsed =
        parseCSVToCurrentAffairs(
          csvText,
        );
      setCsvPreview(
        parsed,
      );
    } catch (err) {
      setCsvError(
        err instanceof Error
          ? err.message
          : "CSV invalid hai.",
      );
      return;
    }

    if (parsed.length === 0) {
      setCsvError(
        "CSV mein koi valid row nahi hai.",
      );
      return;
    }

    const confirmed =
      window.confirm(
        `${parsed.length} current affair(s) database mein add honge. Continue?`,
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);

    try {
      const payload =
        parsed.map(
          (item) => ({
            affair_date:
              item.affair_date,

            serial_no:
              Number(
                item.serial_no,
              ),

            title:
              item.title,

            why_in_news:
              item.why_in_news,

            key_facts:
              item.key_facts,

            exam_point:
              item.exam_point,

            static_gk:
              item.static_gk,

            mcqs:
              item.mcqs,

            published:
              item.published,

            category:
              item.category,

            title_hi:
              item.title_hi,

            why_in_news_hi:
              item.why_in_news_hi,

            key_facts_hi:
              item.key_facts_hi,

            exam_point_hi:
              item.exam_point_hi,

            static_gk_hi:
              item.static_gk_hi,
          }),
        );

      const db = supabase as any;

      const {
        error: insertError,
      } = await db
        .from("current_affairs")
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      await loadCurrentAffairs();

      setCsvText("");
      setCsvPreview([]);
    } catch (err) {
      console.error(
        "CSV Import Error:",
        err,
      );

      setCsvError(
        err instanceof Error
          ? err.message
          : "CSV import failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DATE
  ===================================================== */

  function formatDate(
    date: string,
  ) {
    if (!date) {
      return "";
    }

    const parsed = new Date(
      `${date}T00:00:00`,
    );

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return date;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/dashboard",
              )
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white">
              V
            </div>

            <div className="text-left">
              <h1 className="font-black">
                VIDYZEN
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin • Current Affairs
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/dashboard",
              )
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="font-bold text-red-700 dark:text-red-300">
              ⚠️ Error
            </p>

            <p className="mt-2 break-words text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                void loadCurrentAffairs();
              }}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* TITLE */}
        <section className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg sm:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                ADMIN PANEL
              </span>

              <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                Current Affairs
              </h2>

              <p className="mt-2 text-sm text-blue-100">
                Add, edit, publish and manage
                student current affairs.
              </p>
            </div>

            <button
              type="button"
              onClick={startAdd}
              className="rounded-xl bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-sm hover:bg-blue-50"
            >
              + Add Current Affair
            </button>

          </div>

        </section>

        {/* ADD / EDIT FORM */}
        {showForm && (
          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  {editingId
                    ? "Edit"
                    : "Create"}
                </p>

                <h2 className="mt-1 text-xl font-black">
                  {editingId
                    ? "Edit Current Affair"
                    : "Add Current Affair"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cancelForm}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>

            {/* BASIC */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <Field
                label="Affair Date"
                type="date"
                value={
                  form.affair_date
                }
                onChange={(value) =>
                  updateForm(
                    "affair_date",
                    value,
                  )
                }
              />

              <Field
                label="Serial No"
                type="number"
                value={String(
                  form.serial_no,
                )}
                onChange={(value) =>
                  updateForm(
                    "serial_no",
                    Number(value),
                  )
                }
              />

              <div>
                <label className="mb-2 block text-sm font-bold">
                  Category
                </label>

                <select
                  value={
                    form.category
                  }
                  onChange={(event) =>
                    updateForm(
                      "category",
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                >
                  {CATEGORIES.map(
                    (category) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </div>

            </div>

            <label className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <input
                type="checkbox"
                checked={
                  form.published
                }
                onChange={(event) =>
                  updateForm(
                    "published",
                    event.target
                      .checked,
                  )
                }
                className="h-4 w-4"
              />

              <span className="text-sm font-bold">
                Publish this current affair
              </span>
            </label>

            {/* ENGLISH */}
            <div className="mt-8">
              <SectionTitle>
                🇬🇧 English Content
              </SectionTitle>

              <div className="mt-4 space-y-4">

                <TextArea
                  label="Title"
                  value={
                    form.title
                  }
                  onChange={(value) =>
                    updateForm(
                      "title",
                      value,
                    )
                  }
                  rows={2}
                />

                <TextArea
                  label="Why in News"
                  value={
                    form.why_in_news
                  }
                  onChange={(value) =>
                    updateForm(
                      "why_in_news",
                      value,
                    )
                  }
                />

                <TextArea
                  label="Key Facts"
                  value={
                    form.key_facts
                  }
                  onChange={(value) =>
                    updateForm(
                      "key_facts",
                      value,
                    )
                  }
                />

                <TextArea
                  label="Exam Point"
                  value={
                    form.exam_point
                  }
                  onChange={(value) =>
                    updateForm(
                      "exam_point",
                      value,
                    )
                  }
                />

                <TextArea
                  label="Static GK"
                  value={
                    form.static_gk
                  }
                  onChange={(value) =>
                    updateForm(
                      "static_gk",
                      value,
                    )
                  }
                />

              </div>
            </div>

            {/* HINDI */}
            <div className="mt-8">
              <SectionTitle>
                🇮🇳 Hindi Content
              </SectionTitle>

              <div className="mt-4 space-y-4">

                <TextArea
                  label="Title Hindi"
                  value={
                    form.title_hi
                  }
                  onChange={(value) =>
                    updateForm(
                      "title_hi",
                      value,
                    )
                  }
                  rows={2}
                />

                <TextArea
                  label="Why in News Hindi"
                  value={
                    form.why_in_news_hi
                  }
                  onChange={(value) =>
                    updateForm(
                      "why_in_news_hi",
                      value,
                    )
                  }
                />

                <TextArea
                  label="Key Facts Hindi"
                  value={
                    form.key_facts_hi
                  }
                  onChange={(value) =>
                    updateForm(
                      "key_facts_hi",
                      value,
                    )
                  }
                />

                <TextArea
                  label="Exam Point Hindi"
                  value={
                    form.exam_point_hi
                  }
                  onChange={(value) =>
                    updateForm(
                      "exam_point_hi",
                      value,
                    )
                  }
                />

                <TextArea
                  label="Static GK Hindi"
                  value={
                    form.static_gk_hi
                  }
                  onChange={(value) =>
                    updateForm(
                      "static_gk_hi",
                      value,
                    )
                  }
                />

              </div>
            </div>

            {/* MCQS */}
            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <SectionTitle>
                  📝 MCQs
                </SectionTitle>

                <button
                  type="button"
                  onClick={addMCQ}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
                >
                  + Add MCQ
                </button>
              </div>

              {form.mcqs.length ===
                0 && (
                <div className="mt-4 rounded-xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  No MCQs added.
                </div>
              )}

              <div className="mt-4 space-y-5">

                {form.mcqs.map(
                  (mcq, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
                    >

                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black">
                          MCQ {index + 1}
                        </h3>

                        <button
                          type="button"
                          onClick={() =>
                            removeMCQ(
                              index,
                            )
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4">
                        <TextArea
                          label="Question"
                          value={
                            mcq.question
                          }
                          onChange={(
                            value,
                          ) =>
                            updateMCQ(
                              index,
                              "question",
                              value,
                            )
                          }
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {mcq.options.map(
                          (
                            option,
                            optionIndex,
                          ) => (
                            <div
                              key={
                                optionIndex
                              }
                            >
                              <label className="mb-2 block text-xs font-bold text-slate-500">
                                Option{" "}
                                {optionIndex +
                                  1}
                              </label>

                              <input
                                value={
                                  option
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateMCQOption(
                                    index,
                                    optionIndex,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                              />
                            </div>
                          ),
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="mb-2 block text-xs font-bold text-slate-500">
                          Correct Answer
                        </label>

                        <select
                          value={
                            mcq.answer
                          }
                          onChange={(
                            event,
                          ) =>
                            updateMCQ(
                              index,
                              "answer",
                              event
                                .target
                                .value,
                            )
                          }
                          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <option value="">
                            Select correct answer
                          </option>

                          {mcq.options.map(
                            (
                              option,
                              optionIndex,
                            ) => (
                              <option
                                key={
                                  optionIndex
                                }
                                value={
                                  option
                                }
                              >
                                {option ||
                                  `Option ${optionIndex + 1}`}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="mt-4">
                        <TextArea
                          label="Explanation (optional)"
                          value={
                            mcq.explanation ||
                            ""
                          }
                          onChange={(
                            value,
                          ) =>
                            updateMCQ(
                              index,
                              "explanation",
                              value,
                            )
                          }
                        />
                      </div>

                    </div>
                  ),
                )}

              </div>
            </div>

            {/* SAVE */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void saveCurrentAffair()
                }
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Current Affair"
                    : "Save Current Affair"}
              </button>
            </div>

          </section>
        )}

        {/* CSV IMPORT */}
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black">
                📥 CSV Import
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Bulk current affairs import karo.
              </p>
            </div>

            <label className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              Choose CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={
                  handleCSVFile
                }
                className="hidden"
              />
            </label>
          </div>

          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-bold text-blue-600">
              Required CSV columns
            </summary>

            <p className="mt-3 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              affair_date, serial_no,
              title, why_in_news,
              key_facts, exam_point,
              static_gk, mcqs, category,
              title_hi, why_in_news_hi,
              key_facts_hi,
              exam_point_hi,
              static_gk_hi
            </p>
          </details>

          {csvError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {csvError}
            </div>
          )}

          {csvPreview.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-bold">
                Preview:{" "}
                {
                  csvPreview.length
                } rows
              </p>

              <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-3">
                        Date
                      </th>
                      <th className="px-3 py-3">
                        #
                      </th>
                      <th className="px-3 py-3">
                        Title
                      </th>
                      <th className="px-3 py-3">
                        Category
                      </th>
                      <th className="px-3 py-3">
                        MCQs
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {csvPreview.map(
                      (
                        item,
                        index,
                      ) => (
                        <tr
                          key={index}
                          className="border-t border-slate-200 dark:border-slate-700"
                        >
                          <td className="px-3 py-3">
                            {
                              item.affair_date
                            }
                          </td>

                          <td className="px-3 py-3">
                            {
                              item.serial_no
                            }
                          </td>

                          <td className="max-w-xs px-3 py-3">
                            <div className="truncate">
                              {
                                item.title
                              }
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            {
                              item.category
                            }
                          </td>

                          <td className="px-3 py-3">
                            {
                              item.mcqs
                                .length
                            }
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void importCSV()
                }
                className="mt-4 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving
                  ? "Importing..."
                  : `Import ${csvPreview.length} Rows`}
              </button>
            </div>
          )}

        </section>

        {/* SEARCH */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search current affairs..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
          />

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {[
              "All",
              ...CATEGORIES,
            ].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      category,
                    )
                  }
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${
                    selectedCategory ===
                    category
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {category}
                </button>
              ),
            )}
          </div>

        </section>

        {/* LIST */}
        <section className="mt-6">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">
              All Current Affairs
            </h2>

            <span className="text-sm text-slate-500">
              {
                filteredAffairs.length
              }{" "}
              topics
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading current affairs...
              </p>
            </div>
          ) : filteredAffairs.length ===
            0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="text-4xl">
                📰
              </div>

              <p className="mt-3 font-bold">
                No current affairs found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAffairs.map(
                (item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {item.category ||
                              "Other"}
                          </span>

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            #{item.serial_no}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.published
                                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                            }`}
                          >
                            {item.published
                              ? "PUBLISHED"
                              : "DRAFT"}
                          </span>

                          <span className="text-xs text-slate-400">
                            {formatDate(
                              item.affair_date,
                            )}
                          </span>

                        </div>

                        <h3 className="mt-4 text-lg font-black leading-7">
                          {item.title}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                          {stripHtml(
                            item.why_in_news,
                          )}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700 dark:bg-green-950/30 dark:text-green-300">
                            📝{" "}
                            {
                              item.mcqs
                                .length
                            }{" "}
                            MCQs
                          </span>

                          <span className="rounded-md bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                            🇮🇳 Hindi
                          </span>
                        </div>

                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            startEdit(
                              item,
                            )
                          }
                          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteCurrentAffair(
                              item.id,
                            )
                          }
                          className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                ),
              )}
            </div>
          )}

        </section>

      </main>
    </div>
  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
  );
}

/* =====================================================
   TEXTAREA
===================================================== */

function TextArea({
  label,
  value,
  onChange,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {label}
      </label>

      <textarea
        value={value}
        rows={rows}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </div>
  );
}

/* =====================================================
   SECTION TITLE
===================================================== */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="text-lg font-black">
      {children}
    </h3>
  );
}

/* =====================================================
   NORMALIZE
===================================================== */

function normalizeCurrentAffair(
  value: unknown,
): CurrentAffair | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const row =
    value as Record<string, unknown>;

  return {
    id: String(row.id ?? ""),

    affair_date: String(
      row.affair_date ?? "",
    ),

    serial_no: Number(
      row.serial_no ?? 1,
    ),

    title: String(
      row.title ?? "",
    ),

    why_in_news: String(
      row.why_in_news ?? "",
    ),

    key_facts: String(
      row.key_facts ?? "",
    ),

    exam_point: String(
      row.exam_point ?? "",
    ),

    static_gk: String(
      row.static_gk ?? "",
    ),

    mcqs: normalizeMCQs(
      row.mcqs,
    ),

    published:
      typeof row.published ===
      "boolean"
        ? row.published
        : true,

    category: String(
      row.category ?? "Other",
    ),

    title_hi: String(
      row.title_hi ?? "",
    ),

    why_in_news_hi: String(
      row.why_in_news_hi ?? "",
    ),

    key_facts_hi: String(
      row.key_facts_hi ?? "",
    ),

    exam_point_hi: String(
      row.exam_point_hi ?? "",
    ),

    static_gk_hi: String(
      row.static_gk_hi ?? "",
    ),
  };
}

/* =====================================================
   MCQ NORMALIZER
===================================================== */

function normalizeMCQs(
  value: unknown,
): MCQ[] {
  let source: unknown = value;

  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((item): MCQ | null => {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item)
      ) {
        return null;
      }

      const row =
        item as Record<
          string,
          unknown
        >;

      const question =
        typeof row.question ===
        "string"
          ? row.question.trim()
          : "";

      const options =
        Array.isArray(
          row.options,
        )
          ? row.options
              .filter(
                (
                  option,
                ): option is string =>
                  typeof option ===
                  "string",
              )
              .map((option) =>
                option.trim(),
              )
          : [];

      const answer =
        typeof row.answer ===
        "string"
          ? row.answer.trim()
          : "";

      const explanation =
        typeof row.explanation ===
        "string"
          ? row.explanation.trim()
          : "";

      if (
        !question ||
        options.length !== 4 ||
        options.some(
          (option) =>
            !option,
        ) ||
        !answer
      ) {
        return null;
      }

      return {
        question,
        options,
        answer,
        explanation,
      };
    })
    .filter(
      (item): item is MCQ =>
        item !== null,
    );
}

/* =====================================================
   CSV PARSER
===================================================== */

function parseCSVToCurrentAffairs(
  csv: string,
): CurrentAffair[] {
  const rows =
    parseCSVRows(csv);

  if (rows.length < 2) {
    throw new Error(
      "CSV mein header aur kam se kam 1 data row required hai.",
    );
  }

  const headers =
    rows[0].map((header) =>
      header
        .trim()
        .toLowerCase(),
    );

  const requiredColumns = [
    "affair_date",
    "serial_no",
    "title",
    "why_in_news",
    "key_facts",
    "exam_point",
    "static_gk",
    "mcqs",
    "category",
    "title_hi",
    "why_in_news_hi",
    "key_facts_hi",
    "exam_point_hi",
    "static_gk_hi",
  ];

  const missing =
    requiredColumns.filter(
      (column) =>
        !headers.includes(
          column,
        ),
    );

  if (missing.length > 0) {
    throw new Error(
      `CSV columns missing: ${missing.join(", ")}`,
    );
  }

  const indexOf = (
    column: string,
  ) =>
    headers.indexOf(column);

  const result: CurrentAffair[] =
    [];

  for (
    let rowIndex = 1;
    rowIndex < rows.length;
    rowIndex++
  ) {
    const row =
      rows[rowIndex];

    if (
      row.every(
        (value) =>
          !value.trim(),
      )
    ) {
      continue;
    }

    const get = (
      column: string,
    ) =>
      row[indexOf(column)] ??
      "";

    const affairDate =
      get("affair_date").trim();

    const serialNo =
      Number(
        get("serial_no"),
      );

    const title =
      get("title").trim();

    const whyInNews =
      get("why_in_news").trim();

    const keyFacts =
      get("key_facts").trim();

    const examPoint =
      get("exam_point").trim();

    const staticGk =
      get("static_gk").trim();

    const category =
      get("category").trim() ||
      "Other";

    const titleHi =
      get("title_hi").trim();

    const whyInNewsHi =
      get(
        "why_in_news_hi",
      ).trim();

    const keyFactsHi =
      get(
        "key_facts_hi",
      ).trim();

    const examPointHi =
      get(
        "exam_point_hi",
      ).trim();

    const staticGkHi =
      get(
        "static_gk_hi",
      ).trim();

    if (!affairDate) {
      throw new Error(
        `Row ${rowIndex + 1}: affair_date missing.`,
      );
    }

    if (
      !Number.isFinite(
        serialNo,
      )
    ) {
      throw new Error(
        `Row ${rowIndex + 1}: serial_no invalid hai.`,
      );
    }

    if (!title) {
      throw new Error(
        `Row ${rowIndex + 1}: title missing.`,
      );
    }

    if (!whyInNews) {
      throw new Error(
        `Row ${rowIndex + 1}: why_in_news missing.`,
      );
    }

    if (!keyFacts) {
      throw new Error(
        `Row ${rowIndex + 1}: key_facts missing.`,
      );
    }

    if (!examPoint) {
      throw new Error(
        `Row ${rowIndex + 1}: exam_point missing.`,
      );
    }

    if (!staticGk) {
      throw new Error(
        `Row ${rowIndex + 1}: static_gk missing.`,
      );
    }

    if (!titleHi) {
      throw new Error(
        `Row ${rowIndex + 1}: title_hi missing.`,
      );
    }

    if (!whyInNewsHi) {
      throw new Error(
        `Row ${rowIndex + 1}: why_in_news_hi missing.`,
      );
    }

    if (!keyFactsHi) {
      throw new Error(
        `Row ${rowIndex + 1}: key_facts_hi missing.`,
      );
    }

    if (!examPointHi) {
      throw new Error(
        `Row ${rowIndex + 1}: exam_point_hi missing.`,
      );
    }

    if (!staticGkHi) {
      throw new Error(
        `Row ${rowIndex + 1}: static_gk_hi missing.`,
      );
    }

    const mcqsRaw =
      get("mcqs").trim();

    const mcqs =
      parseMCQJSON(
        mcqsRaw,
        rowIndex + 1,
      );

    const publishedRaw =
      get("published")
        .trim()
        .toLowerCase();

    const published =
      publishedRaw === ""
        ? true
        : ![
            "false",
            "0",
            "no",
            "draft",
          ].includes(
            publishedRaw,
          );

    result.push({
      id: "",

      affair_date:
        affairDate,

      serial_no:
        serialNo,

      title,

      why_in_news:
        whyInNews,

      key_facts:
        keyFacts,

      exam_point:
        examPoint,

      static_gk:
        staticGk,

      mcqs,

      published,

      category,

      title_hi:
        titleHi,

      why_in_news_hi:
        whyInNewsHi,

      key_facts_hi:
        keyFactsHi,

      exam_point_hi:
        examPointHi,

      static_gk_hi:
        staticGkHi,
    });
  }

  return result;
}

/* =====================================================
   CSV ROW PARSER
===================================================== */

function parseCSVRows(
  csv: string,
): string[][] {
  const rows: string[][] =
    [];

  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (
    let i = 0;
    i < csv.length;
    i++
  ) {
    const char =
      csv[i];

    const next =
      csv[i + 1];

    if (
      char === '"' &&
      insideQuotes &&
      next === '"'
    ) {
      cell += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes =
        !insideQuotes;
      continue;
    }

    if (
      char === "," &&
      !insideQuotes
    ) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (
      (char === "\n" ||
        char === "\r") &&
      !insideQuotes
    ) {
      if (
        char === "\r" &&
        next === "\n"
      ) {
        i++;
      }

      row.push(cell);
      cell = "";

      rows.push(row);
      row = [];

      continue;
    }

    cell += char;
  }

  row.push(cell);

  if (
    row.length > 1 ||
    row[0].trim() !== ""
  ) {
    rows.push(row);
  }

  return rows;
}

/* =====================================================
   MCQ CSV JSON
===================================================== */

function parseMCQJSON(
  value: string,
  rowNumber: number,
): MCQ[] {
  if (!value) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(value);
  } catch {
    throw new Error(
      `Row ${rowNumber}: mcqs contains invalid JSON.`,
    );
  }

  const normalized =
    normalizeMCQs(parsed);

  if (
    Array.isArray(parsed) &&
    parsed.length !==
      normalized.length
  ) {
    throw new Error(
      `Row ${rowNumber}: mcqs mein invalid MCQ mila.`,
    );
  }

  return normalized;
}

function stripHtml(
  value: string,
): string {
  if (!value) {
    return "";
  }

  return value
    .replace(
      /<br\s*\/?>/gi,
      " ",
    )
    .replace(
      /<\/p>/gi,
      " ",
    )
    .replace(
      /<[^>]+>/g,
      "",
    )
    .replace(
      /&nbsp;/gi,
      " ",
    )
    .replace(
      /&amp;/gi,
      "&",
    )
    .replace(
      /&quot;/gi,
      '"',
    )
    .replace(
      /&#39;/gi,
      "'",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

export default AdminCurrentAffairs;
