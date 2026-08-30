import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

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

const emptyForm: CurrentAffair = {
  affair_date: new Date().toISOString().slice(0, 10),
  serial_no: 1,
  title: "",
  why_in_news: "",
  key_facts: "",
  exam_point: "",
  static_gk: "",
  mcqs: [],
  published: true,
};

export function AdminCurrentAffairs() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const [records, setRecords] = useState<CurrentAffair[]>([]);
  const [form, setForm] = useState<CurrentAffair>(emptyForm);

  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  const [csvFileName, setCSVFileName] = useState("");
  const [csvRows, setCSVRows] = useState<CurrentAffair[]>([]);

  useEffect(() => {
    loadCurrentAffairs();
  }, []);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  async function loadCurrentAffairs() {
    setLoadingRecords(true);

    try {
      const { data, error: fetchError } = await supabase
        .from("current_affairs")
        .select(
          "id,affair_date,serial_no,title,why_in_news,key_facts,exam_point,static_gk,mcqs,published",
        )
        .order("affair_date", { ascending: false })
        .order("serial_no", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(
        (data ?? []).map((row) => ({
          id: row.id,
          affair_date: row.affair_date ?? "",
          serial_no: Number(row.serial_no ?? 1),
          title: row.title ?? "",
          why_in_news: row.why_in_news ?? "",
          key_facts: row.key_facts ?? "",
          exam_point: row.exam_point ?? "",
          static_gk: row.static_gk ?? "",
          mcqs: Array.isArray(row.mcqs) ? row.mcqs : [],
          published:
            typeof row.published === "boolean"
              ? row.published
              : true,
        })),
      );
    } catch (err) {
      console.error("Load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load current affairs.",
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  function openAddForm() {
    clearMessages();

    setEditingId(null);

    setForm({
      ...emptyForm,
      affair_date: new Date().toISOString().slice(0, 10),
      serial_no: 1,
      published: true,
    });

    setShowForm(true);
  }

  function openEditForm(row: CurrentAffair) {
    clearMessages();

    setEditingId(row.id ?? null);

    setForm({
      ...row,
      mcqs: Array.isArray(row.mcqs) ? row.mcqs : [],
      published:
        typeof row.published === "boolean"
          ? row.published
          : true,
    });

    setShowForm(true);
  }

  function closeForm() {
    if (loading) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateForm(
    field: keyof CurrentAffair,
    value: string | number | boolean,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function addMCQ() {
    setForm((previous) => ({
      ...previous,
      mcqs: [
        ...previous.mcqs,
        {
          question: "",
          options: ["", "", "", ""],
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
      const mcqs = [...previous.mcqs];

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
      const mcqs = [...previous.mcqs];

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

  function removeMCQ(index: number) {
    setForm((previous) => ({
      ...previous,
      mcqs: previous.mcqs.filter(
        (_, mcqIndex) => mcqIndex !== index,
      ),
    }));
  }

  function validateMCQs(
    mcqs: MCQ[],
    rowPrefix = "",
  ): string | null {
    for (let i = 0; i < mcqs.length; i++) {
      const mcq = mcqs[i];

      if (
        !mcq ||
        typeof mcq.question !== "string" ||
        !mcq.question.trim()
      ) {
        return `${rowPrefix}MCQ ${i + 1}: question is required.`;
      }

      if (
        !Array.isArray(mcq.options) ||
        mcq.options.length !== 4 ||
        mcq.options.some(
          (option) =>
            typeof option !== "string" ||
            !option.trim(),
        )
      ) {
        return `${rowPrefix}MCQ ${i + 1}: exactly 4 options are required.`;
      }

      if (
        typeof mcq.answer !== "string" ||
        !mcq.answer.trim()
      ) {
        return `${rowPrefix}MCQ ${i + 1}: answer is required.`;
      }
    }

    return null;
  }

  function validateForm() {
    if (!form.affair_date) {
      return "Affair date is required.";
    }

    if (!Number.isFinite(Number(form.serial_no))) {
      return "Serial number must be a valid number.";
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

    return validateMCQs(form.mcqs);
  }

  async function handleSave() {
    clearMessages();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        affair_date: form.affair_date,
        serial_no: Number(form.serial_no),
        title: form.title.trim(),
        why_in_news: form.why_in_news.trim(),
        key_facts: form.key_facts.trim(),
        exam_point: form.exam_point.trim(),
        static_gk: form.static_gk.trim(),
        mcqs: form.mcqs,
        published: form.published ?? true,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("current_affairs")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }

        setMessage(
          "Current affair updated successfully.",
        );
      } else {
        const { error: insertError } = await supabase
          .from("current_affairs")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setMessage(
          "Current affair added successfully.",
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadCurrentAffairs();
    } catch (err) {
      console.error("Save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : JSON.stringify(err),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this current affair?",
    );

    if (!confirmed) return;

    clearMessages();
    setLoading(true);

    try {
      const { error: deleteError } = await supabase
        .from("current_affairs")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setMessage(
        "Current affair deleted successfully.",
      );

      await loadCurrentAffairs();
    } catch (err) {
      console.error("Delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : JSON.stringify(err),
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * CSV parser supporting:
   * - quoted values
   * - commas inside values
   * - escaped quotes
   * - multiline JSON
   */
  function parseCSVRows(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          value += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }

        continue;
      }

      if (char === "," && !insideQuotes) {
        row.push(value.trim());
        value = "";
        continue;
      }

      if (
        (char === "\n" || char === "\r") &&
        !insideQuotes
      ) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }

        row.push(value.trim());

        if (row.some((cell) => cell.trim() !== "")) {
          rows.push(row);
        }

        row = [];
        value = "";
        continue;
      }

      value += char;
    }

    row.push(value.trim());

    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }

    return rows;
  }

  function normalizeHeader(header: string): string {
    return header
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
  }

  function getValue(
    row: Record<string, string>,
    names: string[],
  ): string {
    for (const name of names) {
      const value = row[name];

      if (
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        return value.trim();
      }
    }

    return "";
  }

  function parseBoolean(value: string): boolean {
    const normalized = value
      .trim()
      .toLowerCase();

    return [
      "true",
      "1",
      "yes",
      "y",
      "published",
    ].includes(normalized);
  }

  function parseCSV(text: string): CurrentAffair[] {
    const cleanedText = text.replace(/^\uFEFF/, "");

    const rows = parseCSVRows(cleanedText);

    if (rows.length < 2) {
      throw new Error(
        "CSV must contain a header and at least one data row.",
      );
    }

    const headers = rows[0].map(normalizeHeader);

    const headerAliases: Record<string, string[]> = {
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

      title: ["title", "heading"],

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

      mcqs: ["mcqs", "mcq"],

      published: [
        "published",
        "is_published",
      ],
    };

    const columnIndexes: Record<string, number> = {};

    Object.entries(headerAliases).forEach(
      ([field, aliases]) => {
        const index = headers.findIndex((header) =>
          aliases.includes(header),
        );

        if (index >= 0) {
          columnIndexes[field] = index;
        }
      },
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
    ];

    for (const field of requiredColumns) {
      if (columnIndexes[field] === undefined) {
        throw new Error(
          `Missing CSV column: ${field}. Found headers: ${headers.join(
            ", ",
          )}`,
        );
      }
    }

    const result: CurrentAffair[] = [];

    rows.slice(1).forEach((values, index) => {
      const rowNumber = index + 2;

      if (
        values.every(
          (value) => !value || !value.trim(),
        )
      ) {
        return;
      }

      const row: Record<string, string> = {};

      headers.forEach((header, columnIndex) => {
        row[header] =
          values[columnIndex]?.trim() ?? "";
      });

      const date = getValue(row, [
        "affair_date",
        "date",
      ]);

      const serialValue = getValue(row, [
        "serial_no",
        "serial",
        "serial_number",
        "serialno",
        "sr_no",
        "sr",
        "s_no",
      ]);

      const title = getValue(row, [
        "title",
        "heading",
      ]);

      const whyInNews = getValue(row, [
        "why_in_news",
        "why_innews",
        "why_news",
        "why",
      ]);

      const keyFacts = getValue(row, [
        "key_facts",
        "keyfacts",
        "facts",
      ]);

      const examPoint = getValue(row, [
        "exam_point",
        "exam_points",
        "exampoint",
      ]);

      const staticGK = getValue(row, [
        "static_gk",
        "staticgk",
        "gk",
      ]);

      const mcqsText = getValue(row, [
        "mcqs",
        "mcq",
      ]);

      const publishedText = getValue(row, [
        "published",
        "is_published",
      ]);

      if (!date) {
        throw new Error(
          `Row ${rowNumber}: affair_date is required.`,
        );
      }

      if (!serialValue) {
        throw new Error(
          `Row ${rowNumber}: serial_no is required.`,
        );
      }

      const serial = Number(serialValue);

      if (!Number.isFinite(serial)) {
        throw new Error(
          `Row ${rowNumber}: serial_no must be a number.`,
        );
      }

      if (!title) {
        throw new Error(
          `Row ${rowNumber}: title is required.`,
        );
      }

      let mcqs: MCQ[] = [];

      if (mcqsText) {
        try {
          const parsed = JSON.parse(mcqsText);

          if (!Array.isArray(parsed)) {
            throw new Error();
          }

          mcqs = parsed;
        } catch {
          throw new Error(
            `Row ${rowNumber}: mcqs must contain valid JSON.`,
          );
        }
      }

      const mcqError = validateMCQs(
        mcqs,
        `Row ${rowNumber}: `,
      );

      if (mcqError) {
        throw new Error(mcqError);
      }

      result.push({
        affair_date: date,
        serial_no: serial,
        title,
        why_in_news: whyInNews,
        key_facts: keyFacts,
        exam_point: examPoint,
        static_gk: staticGK,
        mcqs,
        published: publishedText
          ? parseBoolean(publishedText)
          : true,
      });
    });

    if (!result.length) {
      throw new Error(
        "No valid data rows found in CSV.",
      );
    }

    return result;
  }

  async function handleCSVFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    clearMessages();

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError(
        "Please select a valid CSV file.",
      );
      return;
    }

    setCSVFileName(file.name);

    try {
      const text = await file.text();

      const rows = parseCSV(text);

      setCSVRows(rows);

      setMessage(
        `${rows.length} current affair${
          rows.length === 1 ? "" : "s"
        } loaded successfully.`,
      );
    } catch (err) {
      console.error("CSV parse error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.",
      );

      setCSVRows([]);
      setCSVFileName("");
    }
  }

  async function handleCSVUpload() {
    clearMessages();

    if (!csvRows.length) {
      setError(
        "Please select a valid CSV file first.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload = csvRows.map((row) => ({
        affair_date: row.affair_date,
        serial_no: Number(row.serial_no),
        title: row.title.trim(),
        why_in_news: row.why_in_news.trim(),
        key_facts: row.key_facts.trim(),
        exam_point: row.exam_point.trim(),
        static_gk: row.static_gk.trim(),
        mcqs: Array.isArray(row.mcqs)
          ? row.mcqs
          : [],
        published: row.published ?? true,
      }));

      console.log(
        "Uploading current affairs:",
        payload,
      );

      const { data, error: insertError } =
        await supabase
          .from("current_affairs")
          .insert(payload)
          .select();

      if (insertError) {
        console.error(
          "Supabase upload error:",
          insertError,
        );

        throw new Error(
          insertError.message ||
            insertError.details ||
            insertError.hint ||
            "Supabase upload failed.",
        );
      }

      console.log(
        "Uploaded current affairs:",
        data,
      );

      setMessage(
        `${payload.length} current affair${
          payload.length === 1 ? "" : "s"
        } uploaded successfully.`,
      );

      setCSVRows([]);
      setCSVFileName("");
      setShowCSV(false);

      await loadCurrentAffairs();
    } catch (err) {
      console.error(
        "CSV upload failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : JSON.stringify(err),
      );
    } finally {
      setLoading(false);
    }
  }

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  const todayRecords = records.filter(
    (record) =>
      record.affair_date === today,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">
              PadhAI Admin
            </h1>

            <p className="text-sm text-slate-500">
              Current Affairs Management
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* WELCOME */}
        <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white">
          <p className="text-sm text-slate-300">
            Welcome Admin
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {profile?.full_name ||
              user?.email ||
              "Administrator"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage daily current affairs for students.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Affairs
            </p>

            <p className="mt-2 text-3xl font-bold">
              {records.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Today
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {todayRecords.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Target: Top 10
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              AI
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ON
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
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
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            📄 Upload CSV
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            ← Dashboard
          </button>
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

        {/* RECORDS */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="text-xl font-bold">
                Current Affairs
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Daily current affairs records
              </p>
            </div>

            <button
              type="button"
              onClick={loadCurrentAffairs}
              disabled={loadingRecords}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
            >
              {loadingRecords
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {loadingRecords ? (
            <div className="p-10 text-center text-slate-500">
              Loading current affairs...
            </div>
          ) : records.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl">
                📰
              </div>

              <p className="mt-3 font-semibold">
                No current affairs found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Add today's Top 10 current affairs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left text-sm">
                <thead className="bg-slate-100">
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
                      Exam Point
                    </th>

                    <th className="px-4 py-3">
                      MCQs
                    </th>

                    <th className="px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-4">
                        {record.affair_date}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {record.serial_no}
                      </td>

                      <td className="max-w-[350px] px-4 py-4">
                        <p className="font-semibold">
                          {record.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {record.why_in_news}
                        </p>
                      </td>

                      <td className="max-w-[300px] px-4 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {record.exam_point || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {record.mcqs.length}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(record)
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              record.id &&
                              handleDelete(record.id)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-8 max-w-5xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Edit Current Affair"
                    : "Add Current Affair"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create daily exam-focused current affairs.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">
                    Affair Date
                  </label>

                  <input
                    type="date"
                    value={form.affair_date}
                    onChange={(e) =>
                      updateForm(
                        "affair_date",
                        e.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Serial Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.serial_no}
                    onChange={(e) =>
                      updateForm(
                        "serial_no",
                        Number(e.target.value),
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Title
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    updateForm(
                      "title",
                      e.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Why in News
                </label>

                <textarea
                  rows={4}
                  value={form.why_in_news}
                  onChange={(e) =>
                    updateForm(
                      "why_in_news",
                      e.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Key Facts
                </label>

                <textarea
                  rows={5}
                  value={form.key_facts}
                  onChange={(e) =>
                    updateForm(
                      "key_facts",
                      e.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Exam Point
                </label>

                <textarea
                  rows={4}
                  value={form.exam_point}
                  onChange={(e) =>
                    updateForm(
                      "exam_point",
                      e.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Static GK
                </label>

                <textarea
                  rows={4}
                  value={form.static_gk}
                  onChange={(e) =>
                    updateForm(
                      "static_gk",
                      e.target.value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                />
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">
                      MCQs
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add MCQs for this current affair.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addMCQ}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    + Add MCQ
                  </button>
                </div>

                <div className="mt-5 space-y-5">
                  {form.mcqs.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No MCQs added.
                    </p>
                  ) : (
                    form.mcqs.map(
                      (mcq, mcqIndex) => (
                        <div
                          key={mcqIndex}
                          className="rounded-2xl border bg-white p-5"
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-bold">
                              MCQ {mcqIndex + 1}
                            </h4>

                            <button
                              type="button"
                              onClick={() =>
                                removeMCQ(mcqIndex)
                              }
                              className="text-sm font-semibold text-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <input
                            type="text"
                            value={mcq.question}
                            onChange={(e) =>
                              updateMCQ(
                                mcqIndex,
                                "question",
                                e.target.value,
                              )
                            }
                            placeholder="Question"
                            className="w-full rounded-xl border px-4 py-3"
                          />

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {mcq.options.map(
                              (
                                option,
                                optionIndex,
                              ) => (
                                <input
                                  key={optionIndex}
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    updateMCQOption(
                                      mcqIndex,
                                      optionIndex,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Option ${
                                    optionIndex + 1
                                  }`}
                                  className="rounded-xl border px-4 py-3"
                                />
                              ),
                            )}
                          </div>

                          <input
                            type="text"
                            value={mcq.answer}
                            onChange={(e) =>
                              updateMCQ(
                                mcqIndex,
                                "answer",
                                e.target.value,
                              )
                            }
                            placeholder="Correct answer"
                            className="mt-4 w-full rounded-xl border px-4 py-3"
                          />

                          <textarea
                            rows={2}
                            value={
                              mcq.explanation || ""
                            }
                            onChange={(e) =>
                              updateMCQ(
                                mcqIndex,
                                "explanation",
                                e.target.value,
                              )
                            }
                            placeholder="Explanation (optional)"
                            className="mt-4 w-full rounded-xl border px-4 py-3"
                          />
                        </div>
                      ),
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={closeForm}
                disabled={loading}
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
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

      {/* CSV MODAL */}
      {showCSV && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-10 max-w-6xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  📄 Current Affairs CSV Upload
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload daily current affairs.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setShowCSV(false);
                  setCSVRows([]);
                  setCSVFileName("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <div className="text-4xl">
                  📰
                </div>

                <h3 className="mt-3 font-bold">
                  Upload Current Affairs CSV
                </h3>

                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCSVFile}
                  className="mt-5 block w-full text-sm"
                />

                {csvFileName && (
                  <p className="mt-3 text-sm font-semibold text-blue-600">
                    Selected: {csvFileName}
                  </p>
                )}
              </div>

              {csvRows.length > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">
                        CSV Preview
                      </h3>

                      <p className="text-sm text-slate-500">
                        {csvRows.length} rows ready.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCSVUpload}
                      disabled={loading}
                      className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {loading
                        ? "Uploading..."
                        : "Upload All"}
                    </button>
                  </div>

                  <div className="max-h-[400px] overflow-auto rounded-2xl border">
                    <table className="min-w-[1000px] w-full text-left text-sm">
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
                            MCQs
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {csvRows
                          .slice(0, 100)
                          .map((row, index) => (
                            <tr
                              key={`${row.affair_date}-${row.serial_no}-${index}`}
                              className="border-t"
                            >
                              <td className="px-4 py-3">
                                {row.affair_date}
                              </td>

                              <td className="px-4 py-3 font-bold">
                                {row.serial_no}
                              </td>

                              <td className="px-4 py-3 font-semibold">
                                {row.title}
                              </td>

                              <td className="max-w-[350px] px-4 py-3">
                                <span className="line-clamp-2">
                                  {row.why_in_news}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                {row.mcqs.length}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                <p className="text-sm font-semibold">
                  Required CSV columns
                </p>

                <p className="mt-2 font-mono text-xs text-slate-300">
                  affair_date, serial_no, title,
                  why_in_news, key_facts, exam_point,
                  static_gk, mcqs, published
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  The published column is optional.
                  Use true or false.
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  MCQ JSON example:
                </p>

                <pre className="mt-2 overflow-x-auto rounded-lg bg-black/30 p-3 text-[11px] text-slate-300">
{`[
  {
    "question": "Which organization regulates monetary policy?",
    "options": ["SEBI", "RBI", "NABARD", "IRDAI"],
    "answer": "RBI",
    "explanation": "RBI is India's central bank."
  }
]`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCurrentAffairs;
