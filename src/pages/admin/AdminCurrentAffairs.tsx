import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
  id?: string;
  affair_date: string;
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  mcqs: MCQ[];
  published?: boolean;
}

/* =====================================================
   EMPTY FORM
===================================================== */

const createEmptyForm = (): CurrentAffair => ({
  affair_date: new Date().toISOString().slice(0, 10),
  serial_no: 1,
  title: "",
  why_in_news: "",
  key_facts: "",
  exam_point: "",
  static_gk: "",
  mcqs: [],
  published: true,
});

/* =====================================================
   MAIN
===================================================== */

export function AdminCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [records, setRecords] = useState<
    CurrentAffair[]
  >([]);

  const [form, setForm] =
    useState<CurrentAffair>(
      createEmptyForm(),
    );

  const [loading, setLoading] =
    useState(false);

  const [loadingRecords, setLoadingRecords] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [showCSV, setShowCSV] =
    useState(false);

  const [csvFileName, setCSVFileName] =
    useState("");

  const [csvRows, setCSVRows] =
    useState<CurrentAffair[]>([]);

  useEffect(() => {
    void loadCurrentAffairs();
  }, []);

  /* ===================================================
     HELPERS
  =================================================== */

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function setSuccess(text: string) {
    setError("");
    setMessage(text);
  }

  function setFailure(text: string) {
    setMessage("");
    setError(text);
  }

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  /* ===================================================
     LOAD
  =================================================== */

  async function loadCurrentAffairs() {
    setLoadingRecords(true);

    try {
      const {
        data,
        error: fetchError,
      } = await supabase
        .from("current_affairs")
        .select(
          "id,affair_date,serial_no,title,why_in_news,key_facts,exam_point,static_gk,mcqs,published",
        )
        .order("affair_date", {
          ascending: false,
        })
        .order("serial_no", {
          ascending: true,
        });

      if (fetchError) {
        throw fetchError;
      }

      const normalized =
        (data ?? []).map((row) => ({
          id: row.id,
          affair_date:
            row.affair_date ?? "",
          serial_no:
            Number(row.serial_no ?? 1),
          title:
            row.title ?? "",
          why_in_news:
            row.why_in_news ?? "",
          key_facts:
            row.key_facts ?? "",
          exam_point:
            row.exam_point ?? "",
          static_gk:
            row.static_gk ?? "",
          mcqs:
            Array.isArray(row.mcqs)
              ? normalizeMCQs(row.mcqs)
              : [],
          published:
            typeof row.published ===
            "boolean"
              ? row.published
              : true,
        }));

      setRecords(normalized);
    } catch (err) {
      console.error(
        "Load current affairs error:",
        err,
      );

      setFailure(
        getErrorMessage(
          err,
          "Unable to load current affairs.",
        ),
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  /* ===================================================
     FORM
  =================================================== */

  function openAddForm() {
    clearMessages();

    setEditingId(null);
    setForm(createEmptyForm());
    setShowForm(true);
  }

  function openEditForm(
    row: CurrentAffair,
  ) {
    clearMessages();

    setEditingId(row.id ?? null);

    setForm({
      ...row,
      mcqs: Array.isArray(row.mcqs)
        ? normalizeMCQs(row.mcqs)
        : [],
      published:
        typeof row.published ===
        "boolean"
          ? row.published
          : true,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (loading) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
  }

  function updateForm(
    field: keyof CurrentAffair,
    value:
      | string
      | number
      | boolean,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* ===================================================
     MCQ FORM
  =================================================== */

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

  function updateMCQ(
    mcqIndex: number,
    field: keyof MCQ,
    value: string | string[],
  ) {
    setForm((previous) => {
      const mcqs = [
        ...previous.mcqs,
      ];

      if (!mcqs[mcqIndex]) {
        return previous;
      }

      mcqs[mcqIndex] = {
        ...mcqs[mcqIndex],
        [field]: value,
      };

      return {
        ...previous,
        mcqs,
      };
    });
  }

  function updateMCQOption(
    mcqIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setForm((previous) => {
      const mcqs = [
        ...previous.mcqs,
      ];

      if (!mcqs[mcqIndex]) {
        return previous;
      }

      const options = [
        ...mcqs[mcqIndex].options,
      ];

      options[optionIndex] = value;

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

  function removeMCQ(
    mcqIndex: number,
  ) {
    setForm((previous) => ({
      ...previous,
      mcqs: previous.mcqs.filter(
        (_, index) =>
          index !== mcqIndex,
      ),
    }));
  }

  /* ===================================================
     MCQ VALIDATION
  =================================================== */

  function validateMCQs(
    mcqs: MCQ[],
    rowPrefix = "",
  ): string | null {
    for (
      let i = 0;
      i < mcqs.length;
      i++
    ) {
      const mcq = mcqs[i];

      if (
        !mcq ||
        !mcq.question?.trim()
      ) {
        return `${rowPrefix}MCQ ${
          i + 1
        }: question is required.`;
      }

      if (
        !Array.isArray(
          mcq.options,
        ) ||
        mcq.options.length !== 4
      ) {
        return `${rowPrefix}MCQ ${
          i + 1
        }: exactly 4 options are required.`;
      }

      if (
        mcq.options.some(
          (option) =>
            typeof option !==
              "string" ||
            !option.trim(),
        )
      ) {
        return `${rowPrefix}MCQ ${
          i + 1
        }: all 4 options are required.`;
      }

      if (
        !mcq.answer?.trim()
      ) {
        return `${rowPrefix}MCQ ${
          i + 1
        }: correct answer is required.`;
      }

      const answerExists =
        mcq.options.some(
          (option) =>
            option.trim() ===
            mcq.answer.trim(),
        );

      if (!answerExists) {
        return `${rowPrefix}MCQ ${
          i + 1
        }: answer must exactly match one of the options.`;
      }
    }

    return null;
  }

  function validateForm():
    string | null {
    if (!form.affair_date) {
      return "Affair date is required.";
    }

    if (
      !Number.isFinite(
        Number(form.serial_no),
      ) ||
      Number(form.serial_no) < 1
    ) {
      return "Serial number must be a valid positive number.";
    }

    if (!form.title.trim()) {
      return "Title is required.";
    }

    if (!form.why_in_news.trim()) {
      return "Why in News is required.";
    }

    if (!form.key_facts.trim()) {
      return "Key Facts are required.";
    }

    if (!form.exam_point.trim()) {
      return "Exam Point is required.";
    }

    if (!form.static_gk.trim()) {
      return "Static GK is required.";
    }

    return validateMCQs(
      form.mcqs,
    );
  }

  /* ===================================================
     SAVE
  =================================================== */

  async function handleSave() {
    clearMessages();

    const validationError =
      validateForm();

    if (validationError) {
      setFailure(validationError);
      return;
    }

    setLoading(true);

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
        mcqs:
          normalizeMCQs(form.mcqs),
        published:
          form.published ?? true,
      };

      if (editingId) {
        const {
          error: updateError,
        } = await supabase
          .from("current_affairs")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }

        setSuccess(
          "Current affair updated successfully.",
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("current_affairs")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          "Current affair added successfully.",
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(createEmptyForm());

      await loadCurrentAffairs();
    } catch (err) {
      console.error(
        "Save current affair error:",
        err,
      );

      setFailure(
        getErrorMessage(
          err,
          "Unable to save current affair.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     DELETE
  =================================================== */

  async function handleDelete(
    id: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this current affair?",
      );

    if (!confirmed) {
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("current_affairs")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setSuccess(
        "Current affair deleted successfully.",
      );

      await loadCurrentAffairs();
    } catch (err) {
      console.error(
        "Delete error:",
        err,
      );

      setFailure(
        getErrorMessage(
          err,
          "Unable to delete current affair.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     CSV PARSER
  =================================================== */

  function parseCSVRows(
    text: string,
  ): string[][] {
    const rows: string[][] = [];

    let row: string[] = [];
    let value = "";
    let insideQuotes = false;

    for (
      let i = 0;
      i < text.length;
      i++
    ) {
      const char = text[i];
      const nextChar =
        text[i + 1];

      if (char === '"') {
        if (
          insideQuotes &&
          nextChar === '"'
        ) {
          value += '"';
          i++;
        } else {
          insideQuotes =
            !insideQuotes;
        }

        continue;
      }

      if (
        char === "," &&
        !insideQuotes
      ) {
        row.push(value.trim());
        value = "";
        continue;
      }

      if (
        (char === "\n" ||
          char === "\r") &&
        !insideQuotes
      ) {
        if (
          char === "\r" &&
          nextChar === "\n"
        ) {
          i++;
        }

        row.push(value.trim());

        if (
          row.some(
            (cell) =>
              cell.trim() !== "",
          )
        ) {
          rows.push(row);
        }

        row = [];
        value = "";

        continue;
      }

      value += char;
    }

    row.push(value.trim());

    if (
      row.some(
        (cell) =>
          cell.trim() !== "",
      )
    ) {
      rows.push(row);
    }

    return rows;
  }

  function normalizeHeader(
    header: string,
  ): string {
    return header
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .replace(
        /[\s-]+/g,
        "_",
      );
  }

  function getCSVValue(
    row: Record<string, string>,
    aliases: string[],
  ): string {
    for (const alias of aliases) {
      const value =
        row[alias];

      if (
        typeof value ===
          "string" &&
        value.trim()
      ) {
        return value.trim();
      }
    }

    return "";
  }

  function parseBoolean(
    value: string,
  ): boolean {
    return [
      "true",
      "1",
      "yes",
      "y",
      "published",
    ].includes(
      value
        .trim()
        .toLowerCase(),
    );
  }

  /* ===================================================
     CSV MCQ NORMALIZER
  =================================================== */

  function parseMCQsFromCSV(
    text: string,
    rowNumber: number,
  ): MCQ[] {
    if (!text.trim()) {
      return [];
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(
        text.trim(),
      );
    } catch {
      throw new Error(
        `Row ${rowNumber}: mcqs contains invalid JSON.`,
      );
    }

    if (!Array.isArray(parsed)) {
      throw new Error(
        `Row ${rowNumber}: mcqs must be a JSON array.`,
      );
    }

    const mcqs: MCQ[] = [];

    parsed.forEach(
      (item, index) => {
        if (
          !item ||
          typeof item !==
            "object" ||
          Array.isArray(item)
        ) {
          throw new Error(
            `Row ${rowNumber}: MCQ ${
              index + 1
            } is invalid.`,
          );
        }

        const data =
          item as Record<
            string,
            unknown
          >;

        const question =
          typeof data.question ===
          "string"
            ? data.question.trim()
            : "";

        const options =
          Array.isArray(
            data.options,
          )
            ? data.options
                .filter(
                  (
                    option,
                  ): option is string =>
                    typeof option ===
                    "string",
                )
                .map(
                  (option) =>
                    option.trim(),
                )
            : [];

        const answer =
          typeof data.answer ===
          "string"
            ? data.answer.trim()
            : "";

        const explanation =
          typeof data.explanation ===
          "string"
            ? data.explanation.trim()
            : "";

        mcqs.push({
          question,
          options,
          answer,
          explanation,
        });
      },
    );

    const validationError =
      validateMCQs(
        mcqs,
        `Row ${rowNumber}: `,
      );

    if (validationError) {
      throw new Error(
        validationError,
      );
    }

    return mcqs;
  }

  /* ===================================================
     CSV → CURRENT AFFAIRS
  =================================================== */

  function parseCSV(
    text: string,
  ): CurrentAffair[] {
    const rows =
      parseCSVRows(
        text.replace(
          /^\uFEFF/,
          "",
        ),
      );

    if (rows.length < 2) {
      throw new Error(
        "CSV must contain a header and at least one data row.",
      );
    }

    const headers =
      rows[0].map(
        normalizeHeader,
      );

    const aliases = {
      affair_date: [
        "affair_date",
        "date",
        "affairdate",
      ],

      serial_no: [
        "serial_no",
        "serial",
        "serial_number",
        "serialno",
        "sr_no",
        "sr",
        "s_no",
      ],

      title: [
        "title",
        "heading",
      ],

      why_in_news: [
        "why_in_news",
        "why_innews",
        "why_news",
        "why",
      ],

      key_facts: [
        "key_facts",
        "keyfacts",
        "facts",
      ],

      exam_point: [
        "exam_point",
        "exam_points",
        "exampoint",
      ],

      static_gk: [
        "static_gk",
        "staticgk",
        "gk",
      ],

      mcqs: [
        "mcqs",
        "mcq",
      ],

      published: [
        "published",
        "is_published",
      ],
    };

    const requiredFields =
      [
        "affair_date",
        "serial_no",
        "title",
        "why_in_news",
        "key_facts",
        "exam_point",
        "static_gk",
        "mcqs",
      ] as const;

    const columnIndexes =
      new Map<
        string,
        number
      >();

    Object.entries(
      aliases,
    ).forEach(
      ([field, fieldAliases]) => {
        const index =
          headers.findIndex(
            (header) =>
              fieldAliases.includes(
                header,
              ),
          );

        if (index >= 0) {
          columnIndexes.set(
            field,
            index,
          );
        }
      },
    );

    for (const field of requiredFields) {
      if (
        !columnIndexes.has(
          field,
        )
      ) {
        throw new Error(
          `Missing CSV column: ${field}.`,
        );
      }
    }

    const result: CurrentAffair[] =
      [];

    rows
      .slice(1)
      .forEach(
        (values, index) => {
          const rowNumber =
            index + 2;

          if (
            values.every(
              (value) =>
                !value.trim(),
            )
          ) {
            return;
          }

          const getColumn =
            (
              field: string,
            ) => {
              const columnIndex =
                columnIndexes.get(
                  field,
                );

              if (
                columnIndex ===
                undefined
              ) {
                return "";
              }

              return (
                values[
                  columnIndex
                ]?.trim() ?? ""
              );
            };

          const affairDate =
            getColumn(
              "affair_date",
            );

          const serialText =
            getColumn(
              "serial_no",
            );

          const title =
            getColumn("title");

          const whyInNews =
            getColumn(
              "why_in_news",
            );

          const keyFacts =
            getColumn(
              "key_facts",
            );

          const examPoint =
            getColumn(
              "exam_point",
            );

          const staticGK =
            getColumn(
              "static_gk",
            );

          const mcqsText =
            getColumn("mcqs");

          const publishedText =
            getColumn(
              "published",
            );

          if (!affairDate) {
            throw new Error(
              `Row ${rowNumber}: affair_date is required.`,
            );
          }

          if (!serialText) {
            throw new Error(
              `Row ${rowNumber}: serial_no is required.`,
            );
          }

          const serialNo =
            Number(serialText);

          if (
            !Number.isFinite(
              serialNo,
            )
          ) {
            throw new Error(
              `Row ${rowNumber}: serial_no must be a valid number.`,
            );
          }

          if (!title) {
            throw new Error(
              `Row ${rowNumber}: title is required.`,
            );
          }

          if (!whyInNews) {
            throw new Error(
              `Row ${rowNumber}: why_in_news is required.`,
            );
          }

          if (!keyFacts) {
            throw new Error(
              `Row ${rowNumber}: key_facts is required.`,
            );
          }

          if (!examPoint) {
            throw new Error(
              `Row ${rowNumber}: exam_point is required.`,
            );
          }

          if (!staticGK) {
            throw new Error(
              `Row ${rowNumber}: static_gk is required.`,
            );
          }

          const mcqs =
            parseMCQsFromCSV(
              mcqsText,
              rowNumber,
            );

          result.push({
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
              staticGK,
            mcqs,
            published:
              publishedText
                ? parseBoolean(
                    publishedText,
                  )
                : true,
          });
        },
      );

    if (!result.length) {
      throw new Error(
        "No valid data rows found in CSV.",
      );
    }

    return result;
  }

  /* ===================================================
     CSV FILE SELECT
  =================================================== */

  async function handleCSVFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    clearMessages();

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setFailure(
        "Please select a valid CSV file.",
      );
      return;
    }

    setCSVFileName(
      file.name,
    );

    try {
      const text =
        await file.text();

      const rows =
        parseCSV(text);

      setCSVRows(rows);

      setSuccess(
        `${rows.length} current affair${
          rows.length === 1
            ? ""
            : "s"
        } loaded successfully.`,
      );
    } catch (err) {
      console.error(
        "CSV parse error:",
        err,
      );

      setCSVRows([]);
      setCSVFileName("");

      setFailure(
        getErrorMessage(
          err,
          "Unable to read CSV file.",
        ),
      );
    }
  }

  /* ===================================================
     CSV UPLOAD
  =================================================== */

  async function handleCSVUpload() {
    clearMessages();

    if (!csvRows.length) {
      setFailure(
        "Please select a valid CSV file first.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload =
        csvRows.map((row) => ({
          affair_date:
            row.affair_date,
          serial_no:
            Number(row.serial_no),
          title:
            row.title.trim(),
          why_in_news:
            row.why_in_news.trim(),
          key_facts:
            row.key_facts.trim(),
          exam_point:
            row.exam_point.trim(),
          static_gk:
            row.static_gk.trim(),
          mcqs:
            normalizeMCQs(
              row.mcqs,
            ),
          published:
            row.published ?? true,
        }));

      const {
        error: insertError,
      } = await supabase
        .from("current_affairs")
        .insert(payload);

      if (insertError) {
        throw insertError;
      }

      setSuccess(
        `${payload.length} current affair${
          payload.length === 1
            ? ""
            : "s"
        } uploaded successfully.`,
      );

      setCSVRows([]);
      setCSVFileName("");
      setShowCSV(false);

      await loadCurrentAffairs();
    } catch (err) {
      console.error(
        "CSV upload error:",
        err,
      );

      setFailure(
        getErrorMessage(
          err,
          "Unable to upload CSV.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     STATS
  =================================================== */

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const todayRecords =
    records.filter(
      (record) =>
        record.affair_date ===
        today,
    );

  const publishedCount =
    records.filter(
      (record) =>
        record.published !==
        false,
    ).length;

  /* ===================================================
     UI
  =================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          <div>
            <div className="text-2xl font-black tracking-tight text-blue-600">
              VIDYZEN
            </div>

            <p className="text-sm text-slate-500">
              Admin · Current Affairs
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* =================================================
            WELCOME
        ================================================= */}

        <div className="mb-8 overflow-hidden rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
          <p className="text-sm text-slate-400">
            Welcome Admin
          </p>

          <h1 className="mt-1 text-2xl font-black sm:text-3xl">
            {profile?.full_name ||
              user?.email ||
              "Administrator"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Manage daily exam-focused current affairs for VIDYZEN students.
          </p>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            label="Total Affairs"
            value={records.length}
            icon="📰"
          />

          <StatCard
            label="Today"
            value={todayRecords.length}
            icon="📅"
            accent
          />

          <StatCard
            label="Published"
            value={publishedCount}
            icon="🌐"
          />

          <StatCard
            label="Target / Day"
            value={10}
            icon="🎯"
          />
        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mb-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              openAddForm
            }
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            + Add Current Affair
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setCSVRows([]);
              setCSVFileName("");
              setShowCSV(true);
            }}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
          >
            📄 Upload CSV
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/dashboard",
              )
            }
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </button>
        </div>

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            ❌ {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            ✅ {message}
          </div>
        )}

        {/* =================================================
            RECORD LIST
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">

            <div>
              <h2 className="text-xl font-black">
                Current Affairs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                All uploaded current affairs
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadCurrentAffairs()
              }
              disabled={
                loadingRecords
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
            >
              {loadingRecords
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {loadingRecords ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading current affairs...
            </div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl">
                📰
              </div>

              <h3 className="mt-4 font-bold">
                No current affairs yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add today's current affairs or upload a CSV.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left text-sm">

                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-bold">
                      Date
                    </th>

                    <th className="px-4 py-3 font-bold">
                      #
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Title
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Exam Point
                    </th>

                    <th className="px-4 py-3 font-bold">
                      MCQs
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Status
                    </th>

                    <th className="px-4 py-3 font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.map(
                    (record) => (
                      <tr
                        key={
                          record.id
                        }
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {record.affair_date}
                        </td>

                        <td className="px-4 py-4 font-black">
                          {record.serial_no}
                        </td>

                        <td className="max-w-[350px] px-4 py-4">
                          <p className="font-bold">
                            {record.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {record.why_in_news}
                          </p>
                        </td>

                        <td className="max-w-[280px] px-4 py-4 text-slate-600">
                          <span className="line-clamp-2">
                            {record.exam_point ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {record.mcqs.length}
                        </td>

                        <td className="px-4 py-4">
                          {record.published !==
                          false ? (
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                              Published
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                              Draft
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  record,
                                )
                              }
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                loading
                              }
                              onClick={() => {
                                if (
                                  record.id
                                ) {
                                  void handleDelete(
                                    record.id,
                                  );
                                }
                              }}
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

          <div className="mx-auto my-6 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-10">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-black">
                  {editingId
                    ? "Edit Current Affair"
                    : "Add Current Affair"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create exam-focused current affairs.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  closeForm
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl transition hover:bg-slate-200 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">

              {/* BASIC */}
              <div className="grid gap-5 sm:grid-cols-2">

                <InputField
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

                <InputField
                  label="Serial Number"
                  type="number"
                  value={
                    String(
                      form.serial_no,
                    )
                  }
                  onChange={(value) =>
                    updateForm(
                      "serial_no",
                      Number(value),
                    )
                  }
                />
              </div>

              <InputField
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
                placeholder="Enter current affair title"
              />

              <TextareaField
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
                rows={4}
                placeholder="Why is this topic in the news?"
              />

              <TextareaField
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
                rows={5}
                placeholder="Important facts"
              />

              <TextareaField
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
                rows={4}
                placeholder="Important exam-oriented points"
              />

              <TextareaField
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
                rows={4}
                placeholder="Related static GK"
              />

              {/* PUBLISHED */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input
                  type="checkbox"
                  checked={
                    form.published ??
                    true
                  }
                  onChange={(e) =>
                    updateForm(
                      "published",
                      e.target.checked,
                    )
                  }
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-bold">
                    Publish this current affair
                  </p>

                  <p className="text-xs text-slate-500">
                    Published affairs can appear on the student side.
                  </p>
                </div>
              </label>

              {/* MCQs */}
              <div className="rounded-2xl bg-slate-50 p-5">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>
                    <h3 className="font-black">
                      MCQs
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Exactly 4 options are required for every MCQ.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      addMCQ
                    }
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                  >
                    + Add MCQ
                  </button>
                </div>

                <div className="mt-5 space-y-5">

                  {form.mcqs.length ===
                  0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                      No MCQs added.
                    </div>
                  ) : (
                    form.mcqs.map(
                      (
                        mcq,
                        mcqIndex,
                      ) => (
                        <div
                          key={
                            mcqIndex
                          }
                          className="rounded-2xl border border-slate-200 bg-white p-5"
                        >

                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-black">
                              MCQ{" "}
                              {mcqIndex +
                                1}
                            </h4>

                            <button
                              type="button"
                              onClick={() =>
                                removeMCQ(
                                  mcqIndex,
                                )
                              }
                              className="text-sm font-bold text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>

                          <input
                            type="text"
                            value={
                              mcq.question
                            }
                            onChange={(e) =>
                              updateMCQ(
                                mcqIndex,
                                "question",
                                e.target
                                  .value,
                              )
                            }
                            placeholder="Question"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {mcq.options.map(
                              (
                                option,
                                optionIndex,
                              ) => (
                                <input
                                  key={
                                    optionIndex
                                  }
                                  type="text"
                                  value={
                                    option
                                  }
                                  onChange={(
                                    e,
                                  ) =>
                                    updateMCQOption(
                                      mcqIndex,
                                      optionIndex,
                                      e.target
                                        .value,
                                    )
                                  }
                                  placeholder={`Option ${
                                    String.fromCharCode(
                                      65 +
                                        optionIndex,
                                    )
                                  }`}
                                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />
                              ),
                            )}
                          </div>

                          <input
                            type="text"
                            value={
                              mcq.answer
                            }
                            onChange={(e) =>
                              updateMCQ(
                                mcqIndex,
                                "answer",
                                e.target
                                  .value,
                              )
                            }
                            placeholder="Correct answer — must exactly match an option"
                            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />

                          <textarea
                            rows={3}
                            value={
                              mcq.explanation ||
                              ""
                            }
                            onChange={(e) =>
                              updateMCQ(
                                mcqIndex,
                                "explanation",
                                e.target
                                  .value,
                              )
                            }
                            placeholder="Explanation (optional)"
                            className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      ),
                    )
                  )}
                </div>
              </div>
            </div>

            {/* FORM FOOTER */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  closeForm
                }
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={() =>
                  void handleSave()
                }
                className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Affair"
                    : "Save Affair"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          CSV MODAL
      ================================================= */}

      {showCSV && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

          <div className="mx-auto my-6 max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:my-10">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-black">
                  📄 Current Affairs CSV Upload
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload multiple current affairs at once.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={() => {
                  setShowCSV(
                    false,
                  );
                  setCSVRows([]);
                  setCSVFileName(
                    "",
                  );
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">

              {/* FILE */}
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <div className="text-4xl">
                  📁
                </div>

                <h3 className="mt-3 font-black">
                  Select CSV file
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  CSV must contain the required columns.
                </p>

                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={
                    handleCSVFile
                  }
                  className="mx-auto mt-5 block w-full max-w-md text-sm"
                />

                {csvFileName && (
                  <p className="mt-3 text-sm font-bold text-blue-600">
                    Selected:{" "}
                    {
                      csvFileName
                    }
                  </p>
                )}
              </div>

              {/* PREVIEW */}
              {csvRows.length >
                0 && (
                <div className="mt-6">

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

                    <div>
                      <h3 className="font-black">
                        CSV Preview
                      </h3>

                      <p className="text-sm text-slate-500">
                        {
                          csvRows.length
                        }{" "}
                        rows ready for upload.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        loading
                      }
                      onClick={() =>
                        void handleCSVUpload()
                      }
                      className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                    >
                      {loading
                        ? "Uploading..."
                        : "Upload All"}
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200">

                    <table className="min-w-[1100px] w-full text-left text-sm">

                      <thead className="sticky top-0 bg-slate-100">
                        <tr>
                          <th className="px-4 py-3">
                            Date
                          </th>

                          <th className="px-4 py-3">
                            #
                          </th>

                          <th className="px-4 py-3">
                            Title
                          </th>

                          <th className="px-4 py-3">
                            Why in News
                          </th>

                          <th className="px-4 py-3">
                            Exam Point
                          </th>

                          <th className="px-4 py-3">
                            MCQs
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {csvRows
                          .slice(
                            0,
                            100,
                          )
                          .map(
                            (
                              row,
                              index,
                            ) => (
                              <tr
                                key={`${row.affair_date}-${row.serial_no}-${index}`}
                                className="border-t border-slate-100"
                              >
                                <td className="px-4 py-3">
                                  {
                                    row.affair_date
                                  }
                                </td>

                                <td className="px-4 py-3 font-black">
                                  {
                                    row.serial_no
                                  }
                                </td>

                                <td className="max-w-[300px] px-4 py-3 font-semibold">
                                  {
                                    row.title
                                  }
                                </td>

                                <td className="max-w-[300px] px-4 py-3 text-slate-600">
                                  <span className="line-clamp-2">
                                    {
                                      row.why_in_news
                                    }
                                  </span>
                                </td>

                                <td className="max-w-[250px] px-4 py-3 text-slate-600">
                                  <span className="line-clamp-2">
                                    {
                                      row.exam_point
                                    }
                                  </span>
                                </td>

                                <td className="px-4 py-3 font-bold">
                                  {
                                    row.mcqs.length
                                  }
                                </td>
                              </tr>
                            ),
                          )}
                      </tbody>
                    </table>
                  </div>

                  {csvRows.length >
                    100 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Showing first 100 rows in preview. All{" "}
                      {
                        csvRows.length
                      }{" "}
                      rows will be uploaded.
                    </p>
                  )}
                </div>
              )}

              {/* CSV FORMAT HELP */}
              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">

                <h3 className="font-bold">
                  Required CSV columns
                </h3>

                <p className="mt-2 break-words font-mono text-xs leading-6 text-slate-300">
                  affair_date, serial_no, title, why_in_news, key_facts, exam_point, static_gk, mcqs
                </p>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Optional column:
                  {" "}
                  <code>
                    published
                  </code>
                  . Use true/false. If omitted, it defaults to true.
                </p>

                <h4 className="mt-5 text-sm font-bold">
                  MCQ JSON example
                </h4>

                <pre className="mt-2 overflow-x-auto rounded-xl bg-black/30 p-4 text-[11px] leading-5 text-slate-300">
{`[
  {
    "question": "Which organization regulates monetary policy in India?",
    "options": [
      "SEBI",
      "RBI",
      "NABARD",
      "IRDAI"
    ],
    "answer": "RBI",
    "explanation": "RBI is India's central bank and manages monetary policy."
  }
]`}
                </pre>

                <p className="mt-4 text-xs leading-5 text-amber-300">
                  Important: CSV में MCQs वाला पूरा JSON value quotes में होना चाहिए, ताकि JSON के अंदर मौजूद commas CSV columns को break न करें.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: number;
  icon: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <span className="text-xl">
          {icon}
        </span>
      </div>

      <p
        className={`mt-3 text-3xl font-black ${
          accent
            ? "text-blue-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/* =====================================================
   TEXTAREA FIELD
===================================================== */

function TextareaField({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  rows: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(
            e.target.value,
          )
        }
        className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/* =====================================================
   NORMALIZE MCQs
===================================================== */

function normalizeMCQs(
  values: unknown[],
): MCQ[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => {
      if (
        typeof value ===
        "string"
      ) {
        try {
          const parsed =
            JSON.parse(value);

          return normalizeSingleMCQ(
            parsed,
          );
        } catch {
          return null;
        }
      }

      return normalizeSingleMCQ(
        value,
      );
    })
    .filter(
      (
        mcq,
      ): mcq is MCQ =>
        mcq !== null,
    );
}

function normalizeSingleMCQ(
  value: unknown,
): MCQ | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const data =
    value as Record<
      string,
      unknown
    >;

  const question =
    typeof data.question ===
    "string"
      ? data.question.trim()
      : "";

  const options =
    Array.isArray(
      data.options,
    )
      ? data.options
          .filter(
            (
              option,
            ): option is string =>
              typeof option ===
              "string",
          )
          .map(
            (option) =>
              option.trim(),
          )
      : [];

  const answer =
    typeof data.answer ===
    "string"
      ? data.answer.trim()
      : "";

  const explanation =
    typeof data.explanation ===
    "string"
      ? data.explanation.trim()
      : "";

  if (
    !question ||
    options.length !== 4 ||
    options.some(
      (option) => !option,
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
}

/* =====================================================
   ERROR MESSAGE
===================================================== */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const data =
      error as Record<
        string,
        unknown
      >;

    if (
      typeof data.message ===
      "string"
    ) {
      return data.message;
    }

    if (
      typeof data.details ===
      "string"
    ) {
      return data.details;
    }
  }

  return fallback;
}

/* =====================================================
   EXPORT
===================================================== */

export default AdminCurrentAffairs;
