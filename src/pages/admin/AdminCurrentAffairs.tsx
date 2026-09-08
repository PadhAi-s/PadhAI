import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

/* =====================================================
   TYPES
===================================================== */

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

  created_at?: string;
  updated_at?: string;
}

/* =====================================================
   FORM TYPE
===================================================== */

interface AffairForm {
  affair_date: string;
  serial_no: string;

  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;

  title_hi: string;
  why_in_news_hi: string;
  key_facts_hi: string;
  exam_point_hi: string;
  static_gk_hi: string;

  category: string;
  published: boolean;

  mcqs: MCQ[];
}

/* =====================================================
   CATEGORIES
===================================================== */

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

/* =====================================================
   EMPTY FORM
===================================================== */

const EMPTY_FORM: AffairForm = {
  affair_date: "",
  serial_no: "1",

  title: "",
  why_in_news: "",
  key_facts: "",
  exam_point: "",
  static_gk: "",

  title_hi: "",
  why_in_news_hi: "",
  key_facts_hi: "",
  exam_point_hi: "",
  static_gk_hi: "",

  category: "National",
  published: true,

  mcqs: [],
};

/* =====================================================
   TABLE ACCESS
   -----------------------------------------------------
   `as any` intentionally avoids stale generated
   Supabase Database types causing GenericStringError.
===================================================== */

const currentAffairsTable = () =>
  supabase.from("current_affairs") as any;

/* =====================================================
   COMPONENT
===================================================== */

export function AdminCurrentAffairs() {
  const navigate = useNavigate();

  const [affairs, setAffairs] = useState<
    CurrentAffair[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<AffairForm>(EMPTY_FORM);

  const [csvLoading, setCsvLoading] =
    useState(false);

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    document.title =
      "Admin Current Affairs | VIDYZEN";

    void loadCurrentAffairs();
  }, []);

  /* =====================================================
     LOAD
  ===================================================== */

  async function loadCurrentAffairs() {
    setLoading(true);
    setError("");

    console.log(
      "[AdminCurrentAffairs] Loading current_affairs...",
    );

    try {
      /*
       * IMPORTANT:
       * select("*") intentionally used.
       *
       * Dynamic `.select(array.join(","))`
       * can produce GenericStringError in Supabase
       * TypeScript inference.
       */
      const { data, error: fetchError } =
        await currentAffairsTable()
          .select("*")
          .order("affair_date", {
            ascending: false,
          })
          .order("serial_no", {
            ascending: true,
          });

      console.log(
        "[AdminCurrentAffairs] Supabase response:",
        {
          data,
          error: fetchError,
        },
      );

      if (fetchError) {
        throw fetchError;
      }

      const formatted: CurrentAffair[] = (
        data ?? []
      ).map(normalizeCurrentAffair);

      setAffairs(formatted);

      console.log(
        `[AdminCurrentAffairs] Loaded ${formatted.length} rows.`,
      );
    } catch (err) {
      console.error(
        "[AdminCurrentAffairs] Load Error:",
        err,
      );

      setAffairs([]);

      setError(
        err instanceof Error
          ? err.message
          : "Current affairs load nahi ho paye.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     NORMALIZE CURRENT AFFAIR
===================================================== */

  function normalizeCurrentAffair(
    row: any,
  ): CurrentAffair {
    return {
      id: String(row?.id ?? ""),

      affair_date:
        String(row?.affair_date ?? ""),

      serial_no:
        Number(row?.serial_no ?? 1),

      title:
        String(row?.title ?? ""),

      why_in_news:
        String(row?.why_in_news ?? ""),

      key_facts:
        String(row?.key_facts ?? ""),

      exam_point:
        String(row?.exam_point ?? ""),

      static_gk:
        String(row?.static_gk ?? ""),

      mcqs:
        normalizeMCQs(row?.mcqs),

      published:
        typeof row?.published === "boolean"
          ? row.published
          : true,

      category:
        String(
          row?.category ?? "Other",
        ),

      title_hi:
        String(row?.title_hi ?? ""),

      why_in_news_hi:
        String(
          row?.why_in_news_hi ?? "",
        ),

      key_facts_hi:
        String(
          row?.key_facts_hi ?? "",
        ),

      exam_point_hi:
        String(
          row?.exam_point_hi ?? "",
        ),

      static_gk_hi:
        String(
          row?.static_gk_hi ?? "",
        ),

      created_at:
        row?.created_at
          ? String(row.created_at)
          : undefined,

      updated_at:
        row?.updated_at
          ? String(row.updated_at)
          : undefined,
    };
  }

  /* =====================================================
     FILTER
===================================================== */

  const filteredAffairs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return affairs;
    }

    return affairs.filter((item) => {
      const text = [
        item.affair_date,
        item.serial_no,
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
        .map(String)
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [affairs, search]);

  /* =====================================================
     OPEN ADD
===================================================== */

  function openAddForm() {
    setEditingId(null);

    setForm({
      ...EMPTY_FORM,
      affair_date:
        new Date()
          .toISOString()
          .slice(0, 10),
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     OPEN EDIT
===================================================== */

  function openEditForm(
    affair: CurrentAffair,
  ) {
    setEditingId(affair.id);

    setForm({
      affair_date:
        affair.affair_date,

      serial_no:
        String(affair.serial_no),

      title:
        affair.title,

      why_in_news:
        affair.why_in_news,

      key_facts:
        affair.key_facts,

      exam_point:
        affair.exam_point,

      static_gk:
        affair.static_gk,

      title_hi:
        affair.title_hi,

      why_in_news_hi:
        affair.why_in_news_hi,

      key_facts_hi:
        affair.key_facts_hi,

      exam_point_hi:
        affair.exam_point_hi,

      static_gk_hi:
        affair.static_gk_hi,

      category:
        affair.category ||
        "Other",

      published:
        affair.published,

      mcqs:
        affair.mcqs.map(
          (mcq) => ({
            question:
              mcq.question,

            options: [
              ...(mcq.options ?? []),
            ],

            answer:
              mcq.answer,

            explanation:
              mcq.explanation ??
              "",
          }),
        ),
    });

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* =====================================================
     CLOSE FORM
===================================================== */

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  /* =====================================================
     FORM FIELD
===================================================== */

  function updateField(
    field: keyof AffairForm,
    value: string | boolean,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* =====================================================
     VALIDATE
===================================================== */

  function validateForm(): string {
    if (!form.affair_date.trim()) {
      return "Affair date required hai.";
    }

    if (!form.serial_no.trim()) {
      return "Serial number required hai.";
    }

    if (
      Number.isNaN(
        Number(form.serial_no),
      )
    ) {
      return "Serial number valid number hona chahiye.";
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
      let index = 0;
      index < form.mcqs.length;
      index++
    ) {
      const mcq =
        form.mcqs[index];

      if (!mcq.question.trim()) {
        return `MCQ ${index + 1}: question required hai.`;
      }

      if (
        mcq.options.length !== 4
      ) {
        return `MCQ ${index + 1}: exactly 4 options required hain.`;
      }

      if (
        mcq.options.some(
          (option) =>
            !option.trim(),
        )
      ) {
        return `MCQ ${index + 1}: saare options fill karo.`;
      }

      if (!mcq.answer.trim()) {
        return `MCQ ${index + 1}: correct answer required hai.`;
      }

      if (
        !mcq.options.includes(
          mcq.answer,
        )
      ) {
        return `MCQ ${index + 1}: answer exactly kisi ek option ke same hona chahiye.`;
      }
    }

    return "";
  }

  /* =====================================================
     SAVE
===================================================== */

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    setSaving(true);

    const payload = {
      affair_date:
        form.affair_date.trim(),

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

      mcqs:
        form.mcqs.map(
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
        form.published,

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

    console.log(
      "[AdminCurrentAffairs] Save payload:",
      payload,
    );

    try {
      if (editingId) {
        const {
          data,
          error: updateError,
        } =
          await currentAffairsTable()
            .update(payload)
            .eq(
              "id",
              editingId,
            )
            .select("*")
            .single();

        console.log(
          "[AdminCurrentAffairs] Update response:",
          {
            data,
            updateError,
          },
        );

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "Current affair successfully update ho gaya.",
        );
      } else {
        const {
          data,
          error: insertError,
        } =
          await currentAffairsTable()
            .insert(payload)
            .select("*")
            .single();

        console.log(
          "[AdminCurrentAffairs] Insert response:",
          {
            data,
            insertError,
          },
        );

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          "Current affair successfully add ho gaya.",
        );
      }

      await loadCurrentAffairs();

      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error(
        "[AdminCurrentAffairs] Save Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Current affair save nahi ho paya.",
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE
===================================================== */

  async function deleteAffair(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Kya aap is current affair ko permanently delete karna chahte ho?",
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setError("");
    setSuccess("");

    console.log(
      "[AdminCurrentAffairs] Deleting:",
      id,
    );

    try {
      const {
        error: deleteError,
      } =
        await currentAffairsTable()
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

      setSuccess(
        "Current affair delete ho gaya.",
      );
    } catch (err) {
      console.error(
        "[AdminCurrentAffairs] Delete Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Delete nahi ho paya.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =====================================================
     MCQ ADD
===================================================== */

  function addMCQ() {
    setForm((previous) => ({
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
          explanation: "",
        },
      ],
    }));
  }

  /* =====================================================
     MCQ REMOVE
===================================================== */

  function removeMCQ(
    index: number,
  ) {
    setForm((previous) => ({
      ...previous,
      mcqs:
        previous.mcqs.filter(
          (_, mcqIndex) =>
            mcqIndex !== index,
        ),
    }));
  }

  /* =====================================================
     MCQ UPDATE
===================================================== */

  function updateMCQ(
    index: number,
    field:
      | "question"
      | "answer"
      | "explanation",
    value: string,
  ) {
    setForm((previous) => {
      const mcqs = [
        ...previous.mcqs,
      ];

      mcqs[index] = {
        ...mcqs[index],
        [field]: value,
      };

      return {
        ...previous,
        mcqs,
      };
    });
  }

  /* =====================================================
     MCQ OPTION UPDATE
===================================================== */

  function updateMCQOption(
    mcqIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setForm((previous) => {
      const mcqs = [
        ...previous.mcqs,
      ];

      const options = [
        ...mcqs[mcqIndex]
          .options,
      ];

      options[optionIndex] =
        value;

      mcqs[mcqIndex] = {
        ...mcqs[mcqIndex],
        options,
      };

      return {
        ...previous,
        mcqs,
      };
    });
  }

  /* =====================================================
     CSV FILE
===================================================== */

  async function handleCSVFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setCsvLoading(true);
    setError("");
    setSuccess("");

    try {
      const text =
        await file.text();

      const rows =
        parseCSV(text);

      if (rows.length < 2) {
        throw new Error(
          "CSV me header aur kam se kam 1 data row required hai.",
        );
      }

      const headers =
        rows[0].map((header) =>
          normalizeCSVHeader(
            header,
          ),
        );

      const requiredHeaders = [
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
        requiredHeaders.filter(
          (header) =>
            !headers.includes(
              header,
            ),
        );

      if (missing.length > 0) {
        throw new Error(
          `CSV me ye columns missing hain: ${missing.join(", ")}`,
        );
      }

      const imported: Array<
        Omit<
          CurrentAffair,
          "id"
        >
      > = [];

      for (
        let rowIndex = 1;
        rowIndex < rows.length;
        rowIndex++
      ) {
        const values =
          rows[rowIndex];

        if (
          values.every(
            (value) =>
              !value.trim(),
          )
        ) {
          continue;
        }

        const record: Record<
          string,
          string
        > = {};

        headers.forEach(
          (
            header,
            index,
          ) => {
            record[header] =
              values[index] ??
              "";
          },
        );

        const mcqs =
          parseMCQJSON(
            record.mcqs,
          );

        if (
          record.mcqs.trim() &&
          mcqs === null
        ) {
          throw new Error(
            `Row ${rowIndex}: mcqs contains invalid JSON.`,
          );
        }

        const serial =
          Number(
            record.serial_no,
          );

        if (
          !Number.isFinite(
            serial,
          )
        ) {
          throw new Error(
            `Row ${rowIndex}: serial_no invalid hai.`,
          );
        }

        imported.push({
          affair_date:
            record.affair_date.trim(),

          serial_no:
            serial,

          title:
            record.title.trim(),

          why_in_news:
            record.why_in_news.trim(),

          key_facts:
            record.key_facts.trim(),

          exam_point:
            record.exam_point.trim(),

          static_gk:
            record.static_gk.trim(),

          mcqs:
            mcqs ?? [],

          published:
            parseBoolean(
              record.published,
              true,
            ),

          category:
            record.category.trim() ||
            "Other",

          title_hi:
            record.title_hi.trim(),

          why_in_news_hi:
            record.why_in_news_hi.trim(),

          key_facts_hi:
            record.key_facts_hi.trim(),

          exam_point_hi:
            record.exam_point_hi.trim(),

          static_gk_hi:
            record.static_gk_hi.trim(),
        });
      }

      if (
        imported.length === 0
      ) {
        throw new Error(
          "CSV me koi valid data row nahi mili.",
        );
      }

      console.log(
        "[AdminCurrentAffairs] CSV parsed:",
        imported,
      );

      const confirmed =
        window.confirm(
          `${imported.length} current affairs CSV se import karne hain. Continue?`,
        );

      if (!confirmed) {
        return;
      }

      const { error: insertError } =
        await currentAffairsTable()
          .insert(
            imported.map(
              (item) => ({
                affair_date:
                  item.affair_date,

                serial_no:
                  item.serial_no,

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
            ),
          );

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        `${imported.length} current affairs successfully import ho gaye.`,
      );

      await loadCurrentAffairs();
    } catch (err) {
      console.error(
        "[AdminCurrentAffairs] CSV Error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "CSV import nahi ho paya.",
      );
    } finally {
      setCsvLoading(false);

      event.target.value = "";
    }
  }

  /* =====================================================
     UI
===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 font-black text-white shadow">
              V
            </div>

            <div className="text-left">
              <h1 className="text-lg font-black">
                VIDYZEN
              </h1>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin • Current Affairs
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/dashboard",
                )
              }
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              ← Dashboard
            </button>

            <button
              type="button"
              onClick={
                openAddForm
              }
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              + Add Current Affair
            </button>

          </div>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">

            <div className="flex items-start gap-3">

              <span className="text-xl">
                ⚠️
              </span>

              <div className="min-w-0 flex-1">

                <p className="font-bold text-red-700 dark:text-red-300">
                  Error
                </p>

                <p className="mt-1 break-words text-sm leading-6 text-red-600 dark:text-red-400">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-red-500"
              >
                ✕
              </button>

            </div>

          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950/30">

            <div className="flex items-center justify-between gap-3">

              <p className="font-semibold text-green-700 dark:text-green-300">
                ✅ {success}
              </p>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="text-green-600"
              >
                ✕
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        {showForm && (
          <form
            onSubmit={
              handleSubmit
            }
            className="mb-8 rounded-3xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/50 dark:bg-slate-900 sm:p-7"
          >

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                  {editingId
                    ? "Edit"
                    : "Create"}
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {editingId
                    ? "Edit Current Affair"
                    : "Add Current Affair"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={saving}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold dark:border-slate-700"
              >
                Cancel
              </button>

            </div>

            {/* BASIC */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Field
                label="Affair Date"
                type="date"
                value={
                  form.affair_date
                }
                onChange={(value) =>
                  updateField(
                    "affair_date",
                    value,
                  )
                }
              />

              <Field
                label="Serial No."
                type="number"
                value={
                  form.serial_no
                }
                onChange={(value) =>
                  updateField(
                    "serial_no",
                    value,
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
                    updateField(
                      "category",
                      event.target
                        .value,
                    )
                  }
                  className={inputClass}
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

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">

                <input
                  type="checkbox"
                  checked={
                    form.published
                  }
                  onChange={(event) =>
                    updateField(
                      "published",
                      event.target
                        .checked,
                    )
                  }
                  className="h-5 w-5"
                />

                <span>
                  <span className="block text-sm font-bold">
                    Published
                  </span>

                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    Student ko visible
                  </span>
                </span>

              </label>

            </div>

            {/* ENGLISH */}

            <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">

              <h3 className="mb-5 text-lg font-black text-blue-700 dark:text-blue-300">
                🇬🇧 English Content
              </h3>

              <div className="space-y-4">

                <TextArea
                  label="Title"
                  value={
                    form.title
                  }
                  onChange={(value) =>
                    updateField(
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
                    updateField(
                      "why_in_news",
                      value,
                    )
                  }
                  rows={5}
                />

                <TextArea
                  label="Key Facts"
                  value={
                    form.key_facts
                  }
                  onChange={(value) =>
                    updateField(
                      "key_facts",
                      value,
                    )
                  }
                  rows={6}
                />

                <TextArea
                  label="Exam Point"
                  value={
                    form.exam_point
                  }
                  onChange={(value) =>
                    updateField(
                      "exam_point",
                      value,
                    )
                  }
                  rows={4}
                />

                <TextArea
                  label="Static GK"
                  value={
                    form.static_gk
                  }
                  onChange={(value) =>
                    updateField(
                      "static_gk",
                      value,
                    )
                  }
                  rows={5}
                />

              </div>

            </div>

            {/* HINDI */}

            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-5 dark:border-orange-900/50 dark:bg-orange-950/20">

              <h3 className="mb-5 text-lg font-black text-orange-700 dark:text-orange-300">
                🇮🇳 Hindi Content
              </h3>

              <div className="space-y-4">

                <TextArea
                  label="Hindi Title"
                  value={
                    form.title_hi
                  }
                  onChange={(value) =>
                    updateField(
                      "title_hi",
                      value,
                    )
                  }
                  rows={2}
                />

                <TextArea
                  label="Hindi Why in News"
                  value={
                    form.why_in_news_hi
                  }
                  onChange={(value) =>
                    updateField(
                      "why_in_news_hi",
                      value,
                    )
                  }
                  rows={5}
                />

                <TextArea
                  label="Hindi Key Facts"
                  value={
                    form.key_facts_hi
                  }
                  onChange={(value) =>
                    updateField(
                      "key_facts_hi",
                      value,
                    )
                  }
                  rows={6}
                />

                <TextArea
                  label="Hindi Exam Point"
                  value={
                    form.exam_point_hi
                  }
                  onChange={(value) =>
                    updateField(
                      "exam_point_hi",
                      value,
                    )
                  }
                  rows={4}
                />

                <TextArea
                  label="Hindi Static GK"
                  value={
                    form.static_gk_hi
                  }
                  onChange={(value) =>
                    updateField(
                      "static_gk_hi",
                      value,
                    )
                  }
                  rows={5}
                />

              </div>

            </div>

            {/* MCQS */}

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50/40 p-5 dark:border-green-900/50 dark:bg-green-950/20">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="text-lg font-black text-green-700 dark:text-green-300">
                    📝 MCQs
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Har MCQ me exactly 4 options hone chahiye.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    addMCQ
                  }
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
                >
                  + Add MCQ
                </button>

              </div>

              {form.mcqs.length ===
                0 && (
                <div className="rounded-xl border border-dashed border-green-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-green-800 dark:bg-slate-900 dark:text-slate-400">
                  No MCQs added.
                </div>
              )}

              <div className="space-y-5">

                {form.mcqs.map(
                  (
                    mcq,
                    index,
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                    >

                      <div className="mb-4 flex items-center justify-between">

                        <h4 className="font-black">
                          MCQ #
                          {index +
                            1}
                        </h4>

                        <button
                          type="button"
                          onClick={() =>
                            removeMCQ(
                              index,
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300"
                        >
                          Remove
                        </button>

                      </div>

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
                        rows={
                          3
                        }
                      />

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">

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
                              <label className="mb-2 block text-sm font-bold">
                                Option{" "}
                                {String.fromCharCode(
                                  65 +
                                    optionIndex,
                                )}
                              </label>

                              <input
                                type="text"
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
                                className={inputClass}
                              />
                            </div>
                          ),
                        )}

                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">

                        <div>
                          <label className="mb-2 block text-sm font-bold">
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
                            className={inputClass}
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
                                  disabled={
                                    !option.trim()
                                  }
                                >
                                  {String.fromCharCode(
                                    65 +
                                      optionIndex,
                                  )}
                                  {" - "}
                                  {option ||
                                    `Option ${
                                      optionIndex +
                                      1
                                    }`}
                                </option>
                              ),
                            )}
                          </select>
                        </div>

                        <TextArea
                          label="Explanation"
                          value={
                            mcq.explanation ??
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
                          rows={
                            3
                          }
                        />

                      </div>

                    </div>
                  ),
                )}

              </div>

            </div>

            {/* SAVE */}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={saving}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold dark:border-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Current Affair"
                    : "Save Current Affair"}
              </button>

            </div>

          </form>
        )}

        {/* =================================================
            LIST HEADER
        ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
                Content Manager
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Current Affairs
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {affairs.length} total records •{" "}
                {
                  affairs.filter(
                    (item) =>
                      item.published,
                  ).length
                }{" "}
                published
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <div className="relative">

                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  🔎
                </span>

                <input
                  type="text"
                  value={
                    search
                  }
                  onChange={(
                    event,
                  ) =>
                    setSearch(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Search..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 sm:w-64 dark:border-slate-700 dark:bg-slate-950"
                />

              </div>

              <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-bold transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800">

                {csvLoading
                  ? "Importing..."
                  : "📄 Import CSV"}

                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  disabled={
                    csvLoading
                  }
                  onChange={
                    handleCSVFile
                  }
                />

              </label>

              <button
                type="button"
                onClick={() =>
                  void loadCurrentAffairs()
                }
                disabled={
                  loading
                }
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                ↻ Refresh
              </button>

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="py-16 text-center">

              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Current affairs loading...
              </p>

            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            filteredAffairs.length ===
              0 && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center dark:bg-slate-800">

                <div className="text-5xl">
                  📰
                </div>

                <h3 className="mt-4 font-bold">
                  {search
                    ? "No matching current affairs"
                    : "No current affairs found"}
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Add a new current affair
                  or import CSV.
                </p>

              </div>
            )}

          {/* =================================================
              TABLE / CARDS
          ================================================= */}

          {!loading &&
            filteredAffairs.length >
              0 && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">

                {/* DESKTOP TABLE */}

                <div className="hidden overflow-x-auto md:block">

                  <table className="w-full text-left">

                    <thead className="bg-slate-50 dark:bg-slate-800">

                      <tr>

                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                          Date
                        </th>

                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                          Title
                        </th>

                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                          Category
                        </th>

                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                          MCQs
                        </th>

                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wide">
                          Status
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

                      {filteredAffairs.map(
                        (
                          item,
                        ) => (
                          <tr
                            key={
                              item.id
                            }
                            className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >

                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold">
                              {formatDate(
                                item.affair_date,
                              )}
                            </td>

                            <td className="max-w-md px-4 py-4">

                              <p className="line-clamp-2 font-bold">
                                {item.title}
                              </p>

                              <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                                #{item.serial_no}
                              </p>

                            </td>

                            <td className="px-4 py-4">

                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                {item.category ||
                                  "Other"}
                              </span>

                            </td>

                            <td className="px-4 py-4 text-sm font-semibold">
                              {item.mcqs.length}
                            </td>

                            <td className="px-4 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  item.published
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                }`}
                              >
                                {item.published
                                  ? "Published"
                                  : "Draft"}
                              </span>

                            </td>

                            <td className="px-4 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      item,
                                    )
                                  }
                                  className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteAffair(
                                      item.id,
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    item.id
                                  }
                                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-300"
                                >
                                  {deletingId ===
                                  item.id
                                    ? "..."
                                    : "Delete"}
                                </button>

                              </div>

                            </td>

                          </tr>
                        ),
                      )}

                    </tbody>

                  </table>

                </div>

                {/* MOBILE CARDS */}

                <div className="divide-y divide-slate-200 md:hidden dark:divide-slate-700">

                  {filteredAffairs.map(
                    (
                      item,
                    ) => (
                      <div
                        key={
                          item.id
                        }
                        className="p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {item.category ||
                              "Other"}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              item.published
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {item.published
                              ? "Published"
                              : "Draft"}
                          </span>

                        </div>

                        <h3 className="mt-3 font-black leading-6">
                          {item.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">

                          <span>
                            📅{" "}
                            {formatDate(
                              item.affair_date,
                            )}
                          </span>

                          <span>
                            #{item.serial_no}
                          </span>

                          <span>
                            📝{" "}
                            {
                              item
                                .mcqs
                                .length
                            }{" "}
                            MCQs
                          </span>

                        </div>

                        <div className="mt-4 flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                item,
                              )
                            }
                            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteAffair(
                                item.id,
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          >
                            {deletingId ===
                            item.id
                              ? "..."
                              : "Delete"}
                          </button>

                        </div>

                      </div>
                    ),
                  )}

                </div>

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

/* =====================================================
   FIELD COMPONENT
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
  onChange: (
    value: string,
  ) => void;
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
        className={inputClass}
      />
    </div>
  );
}

/* =====================================================
   TEXT AREA
===================================================== */

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
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
        className={`${inputClass} resize-y`}
      />
    </div>
  );
}

/* =====================================================
   INPUT CLASS
===================================================== */

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

/* =====================================================
   MCQ NORMALIZER
===================================================== */

function normalizeMCQs(
  value: unknown,
): MCQ[] {
  let parsed =
    value;

  /*
   * Supabase kabhi JSONB ko array deta hai,
   * kabhi string form me mil sakta hai.
   */
  if (
    typeof parsed ===
    "string"
  ) {
    try {
      parsed =
        JSON.parse(
          parsed,
        );
    } catch {
      return [];
    }
  }

  if (
    !Array.isArray(parsed)
  ) {
    return [];
  }

  return parsed
    .map((item) => {
      if (
        !item ||
        typeof item !==
          "object" ||
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
              .map(
                (
                  option,
                ) =>
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
        options.length !==
          4 ||
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
      (
        item,
      ): item is MCQ =>
        item !== null,
    );
}

/* =====================================================
   MCQ JSON PARSER
===================================================== */

function parseMCQJSON(
  value: string,
): MCQ[] | null {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(trimmed);
  } catch {
    return null;
  }

  const normalized =
    normalizeMCQs(
      parsed,
    );

  if (
    Array.isArray(
      parsed,
    ) &&
    normalized.length !==
      parsed.length
  ) {
    return null;
  }

  return normalized;
}

/* =====================================================
   CSV PARSER
===================================================== */

function parseCSV(
  text: string,
): string[][] {
  const rows: string[][] = [];

  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {
    const char =
      text[i];

    const next =
      text[i + 1];

    if (
      char === '"' &&
      insideQuotes &&
      next === '"'
    ) {
      cell += '"';
      i++;
      continue;
    }

    if (
      char === '"'
    ) {
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

      if (
        row.some(
          (value) =>
            value.trim(),
        )
      ) {
        rows.push(
          row,
        );
      }

      row = [];
      continue;
    }

    cell += char;
  }

  row.push(cell);

  if (
    row.some(
      (value) =>
        value.trim(),
    )
  ) {
    rows.push(row);
  }

  return rows;
}

/* =====================================================
   CSV HEADER NORMALIZER
===================================================== */

function normalizeCSVHeader(
  value: string,
): string {
  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace(
        /^\uFEFF/,
        "",
      )
      .replace(
        /[\s-]+/g,
        "_",
      );

  const aliases: Record<
    string,
    string
  > = {
    date: "affair_date",
    affairdate:
      "affair_date",

    serial:
      "serial_no",
    serialnumber:
      "serial_no",
    serial_number:
      "serial_no",

    why:
      "why_in_news",
    why_in_news_en:
      "why_in_news",

    keyfacts:
      "key_facts",
    key_facts_en:
      "key_facts",

    exampoint:
      "exam_point",
    exam_point_en:
      "exam_point",

    staticgk:
      "static_gk",
    static_gk_en:
      "static_gk",

    titlehindi:
      "title_hi",
    hindi_title:
      "title_hi",

    why_in_news_hindi:
      "why_in_news_hi",

    key_facts_hindi:
      "key_facts_hi",

    exam_point_hindi:
      "exam_point_hi",

    static_gk_hindi:
      "static_gk_hi",
  };

  return (
    aliases[normalized] ??
    normalized
  );
}

/* =====================================================
   BOOLEAN PARSER
===================================================== */

function parseBoolean(
  value: string,
  fallback: boolean,
): boolean {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    [
      "true",
      "1",
      "yes",
      "published",
    ].includes(
      normalized,
    )
  ) {
    return true;
  }

  if (
    [
      "false",
      "0",
      "no",
      "draft",
      "unpublished",
    ].includes(
      normalized,
    )
  ) {
    return false;
  }

  return fallback;
}

/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(
  date: string,
): string {
  if (!date) {
    return "-";
  }

  const parsed =
    new Date(
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
   DEFAULT EXPORT
===================================================== */

export default AdminCurrentAffairs;
