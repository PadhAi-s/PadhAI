import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface SyllabusRow {
  external_id: string;
  category: "school" | "government_exam";
  class_name: string | null;
  board: string | null;
  exam: string | null;
  subject: string;
  chapter_name: string;
  topic_name: string | null;
  key_points: string | null;
  order_no: number;
  is_active: boolean;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSyllabusManager, setShowSyllabusManager] = useState(false);
  const [csvRows, setCsvRows] = useState<SyllabusRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  function openSyllabusManager() {
    setShowSyllabusManager(true);
    setMessage("");
    setError("");
  }

  function closeSyllabusManager() {
    if (loading) return;

    setShowSyllabusManager(false);
    setCsvRows([]);
    setFileName("");
    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());

    return values;
  }

  function parseBoolean(value: string): boolean {
    const normalized = value.trim().toLowerCase();

    return !["false", "0", "no", "inactive"].includes(normalized);
  }

  function normalizeValue(value: string): string | null {
    const trimmed = value.trim();

    return trimmed ? trimmed : null;
  }

  function parseCSV(text: string): SyllabusRow[] {
    const lines = text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain a header and at least one row.",
      );
    }

    const headers = parseCSVLine(lines[0]).map((header) =>
      header.trim().toLowerCase(),
    );

    const requiredHeaders = [
      "external_id",
      "category",
      "class_name",
      "board",
      "exam",
      "subject",
      "chapter_name",
      "topic_name",
      "key_points",
      "order_no",
      "is_active",
    ];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        throw new Error(`Missing CSV column: ${required}`);
      }
    }

    const rows: SyllabusRow[] = [];

    lines.slice(1).forEach((line, index) => {
      const values = parseCSVLine(line);

      const row: Record<string, string> = {};

      headers.forEach((header, columnIndex) => {
        row[header] = values[columnIndex] ?? "";
      });

      const rowNumber = index + 2;

      const externalId = row.external_id?.trim();
      const category = row.category?.trim().toLowerCase();

      if (!externalId) {
        throw new Error(
          `Row ${rowNumber}: external_id is required.`,
        );
      }

      if (
        category !== "school" &&
        category !== "government_exam"
      ) {
        throw new Error(
          `Row ${rowNumber}: category must be school or government_exam.`,
        );
      }

      if (!row.subject?.trim()) {
        throw new Error(
          `Row ${rowNumber}: subject is required.`,
        );
      }

      if (!row.chapter_name?.trim()) {
        throw new Error(
          `Row ${rowNumber}: chapter_name is required.`,
        );
      }

      if (category === "school") {
        if (!row.class_name?.trim()) {
          throw new Error(
            `Row ${rowNumber}: class_name is required for school syllabus.`,
          );
        }

        if (!row.board?.trim()) {
          throw new Error(
            `Row ${rowNumber}: board is required for school syllabus.`,
          );
        }
      }

      if (category === "government_exam") {
        if (!row.exam?.trim()) {
          throw new Error(
            `Row ${rowNumber}: exam is required for government_exam.`,
          );
        }
      }

      const parsedOrder = Number(row.order_no || "1");

      if (!Number.isFinite(parsedOrder)) {
        throw new Error(
          `Row ${rowNumber}: order_no must be a number.`,
        );
      }

      rows.push({
        external_id: externalId,
        category,
        class_name:
          category === "school"
            ? normalizeValue(row.class_name)
            : null,
        board:
          category === "school"
            ? normalizeValue(row.board)
            : null,
        exam:
          category === "government_exam"
            ? normalizeValue(row.exam)
            : null,
        subject: row.subject.trim(),
        chapter_name: row.chapter_name.trim(),
        topic_name: normalizeValue(row.topic_name),
        key_points: normalizeValue(row.key_points),
        order_no: parsedOrder,
        is_active: parseBoolean(row.is_active),
      });
    });

    const ids = new Set<string>();

    for (const row of rows) {
      if (ids.has(row.external_id)) {
        throw new Error(
          `Duplicate external_id found: ${row.external_id}`,
        );
      }

      ids.add(row.external_id);
    }

    return rows;
  }

  async function handleCSVFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setError("");
    setMessage("");
    setCsvRows([]);

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please select a CSV file.");
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      setCsvRows(rows);

      setMessage(
        `${rows.length} syllabus row${
          rows.length === 1 ? "" : "s"
        } loaded successfully.`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.";

      setError(message);
      setFileName("");
    }
  }

  async function handleUpload() {
    setError("");
    setMessage("");

    if (!csvRows.length) {
      setError("Please select a valid CSV file first.");
      return;
    }

    setLoading(true);

    try {
      const { error: upsertError } = await supabase
        .from("syllabi")
        .upsert(csvRows, {
          onConflict: "external_id",
        });

      if (upsertError) {
        throw upsertError;
      }

      setMessage(
        `${csvRows.length} syllabus row${
          csvRows.length === 1 ? "" : "s"
        } successfully inserted/updated.`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to upload syllabus.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              PadhAI Admin
            </h1>

            <p className="text-sm text-slate-500">
              Administration Dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Admin Welcome */}
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
            You have administrator access to PadhAI.
          </p>
        </div>

        {/* Admin Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Students
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              —
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Student management
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Syllabus
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {csvRows.length || "—"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              CSV rows loaded
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Videos
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              —
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Video management
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              AI
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ON
            </p>

            <p className="mt-1 text-xs text-slate-400">
              AI features
            </p>
          </div>
        </div>

        {/* Management */}
        <h3 className="mb-4 text-xl font-bold text-slate-900">
          Management
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Syllabus */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">📚</div>

            <h3 className="mt-4 font-bold text-slate-900">
              Syllabus
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload and update class-wise and government exam
              syllabus using CSV.
            </p>

            <button
              type="button"
              onClick={openSyllabusManager}
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Manage Syllabus
            </button>
          </div>

          {/* Students */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">👨‍🎓</div>

            <h3 className="mt-4 font-bold text-slate-900">
              Students
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage student accounts and profiles.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage
            </button>
          </div>

          {/* AI */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">🤖</div>

            <h3 className="mt-4 font-bold text-slate-900">
              AI Settings
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Configure PadhAI AI features.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Configure
            </button>
          </div>

          {/* Videos */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">🎥</div>

            <h3 className="mt-4 font-bold text-slate-900">
              Videos
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage educational video content.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage
            </button>
          </div>
        </div>
      </main>

      {/* =====================================================
          SYLLABUS MANAGER MODAL
          ===================================================== */}

      {showSyllabusManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    📚 Syllabus Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload CSV to insert new syllabus or update
                    existing syllabus.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeSyllabusManager}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Upload Box */}
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="text-4xl">📄</div>

                  <h3 className="mt-3 font-bold text-slate-900">
                    Upload Syllabus CSV
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Use the standard PadhAI syllabus CSV format.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCSVFile}
                    className="mt-5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  {fileName && (
                    <p className="mt-3 text-sm font-medium text-blue-600">
                      Selected: {fileName}
                    </p>
                  )}
                </div>

                {/* Messages */}
                {error && (
                  <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ❌ {error}
                  </div>
                )}

                {message && (
                  <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✅ {message}
                  </div>
                )}

                {/* Preview */}
                {csvRows.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          CSV Preview
                        </h3>

                        <p className="text-sm text-slate-500">
                          {csvRows.length} rows ready for upload.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={loading}
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading
                          ? "Uploading..."
                          : "Upload / Update"}
                      </button>
                    </div>

                    <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200">
                      <table className="min-w-[1100px] w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-100">
                          <tr>
                            <th className="px-4 py-3 font-semibold">
                              ID
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Category
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Class
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Board
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Exam
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Subject
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Chapter
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Topic
                            </th>
                            <th className="px-4 py-3 font-semibold">
                              Order
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {csvRows.slice(0, 100).map((row) => (
                            <tr
                              key={row.external_id}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3 font-mono text-xs">
                                {row.external_id}
                              </td>

                              <td className="px-4 py-3">
                                {row.category}
                              </td>

                              <td className="px-4 py-3">
                                {row.class_name || "—"}
                              </td>

                              <td className="px-4 py-3">
                                {row.board || "—"}
                              </td>

                              <td className="px-4 py-3">
                                {row.exam || "—"}
                              </td>

                              <td className="px-4 py-3">
                                {row.subject}
                              </td>

                              <td className="px-4 py-3">
                                {row.chapter_name}
                              </td>

                              <td className="px-4 py-3">
                                {row.topic_name || "—"}
                              </td>

                              <td className="px-4 py-3">
                                {row.order_no}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {csvRows.length > 100 && (
                      <p className="mt-2 text-xs text-slate-500">
                        Showing first 100 rows. All{" "}
                        {csvRows.length} rows will be uploaded.
                      </p>
                    )}
                  </div>
                )}

                {/* CSV Format */}
                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm font-semibold">
                    Required CSV columns
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-300">
                    external_id, category, class_name, board, exam,
                    subject, chapter_name, topic_name, key_points,
                    order_no, is_active
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Existing external_id = update &nbsp; | &nbsp;
                    New external_id = insert
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end border-t px-6 py-4">
                <button
                  type="button"
                  onClick={closeSyllabusManager}
                  disabled={loading}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
