import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

/* =====================================================
   TYPES
===================================================== */

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

interface CurrentAffairRow {
  external_id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string | null;
  is_active: boolean;
}

/* =====================================================
   COMPONENT
===================================================== */

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const syllabusFileInputRef =
    useRef<HTMLInputElement>(null);

  const currentAffairsFileInputRef =
    useRef<HTMLInputElement>(null);

  /* =====================================================
     MODALS
  ===================================================== */

  const [showSyllabusManager, setShowSyllabusManager] =
    useState(false);

  const [
    showCurrentAffairsManager,
    setShowCurrentAffairsManager,
  ] = useState(false);

  /* =====================================================
     SYLLABUS STATES
  ===================================================== */

  const [csvRows, setCsvRows] = useState<SyllabusRow[]>(
    [],
  );

  const [fileName, setFileName] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =====================================================
     CURRENT AFFAIRS STATES
  ===================================================== */

  const [
    currentAffairsRows,
    setCurrentAffairsRows,
  ] = useState<CurrentAffairRow[]>([]);

  const [
    currentAffairsFileName,
    setCurrentAffairsFileName,
  ] = useState("");

  const [
    currentAffairsLoading,
    setCurrentAffairsLoading,
  ] = useState(false);

  const [
    currentAffairsMessage,
    setCurrentAffairsMessage,
  ] = useState("");

  const [
    currentAffairsError,
    setCurrentAffairsError,
  ] = useState("");

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  /* =====================================================
     COMMON CSV FUNCTIONS
  ===================================================== */

  function parseCSVLine(line: string): string[] {
    const values: string[] = [];

    let current = "";

    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (
          insideQuotes &&
          line[i + 1] === '"'
        ) {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (
        char === "," &&
        !insideQuotes
      ) {
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
    const normalized =
      value.trim().toLowerCase();

    return ![
      "false",
      "0",
      "no",
      "inactive",
    ].includes(normalized);
  }

  function normalizeValue(
    value: string | undefined,
  ): string | null {
    const trimmed = value?.trim() || "";

    return trimmed ? trimmed : null;
  }

  /* =====================================================
     SYLLABUS MANAGER
  ===================================================== */

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

    if (syllabusFileInputRef.current) {
      syllabusFileInputRef.current.value = "";
    }
  }

  function parseSyllabusCSV(
    text: string,
  ): SyllabusRow[] {
    const lines = text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(
        (line) =>
          line.trim() !== "",
      );

    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain a header and at least one row.",
      );
    }

    const headers = parseCSVLine(
      lines[0],
    ).map((header) =>
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
        throw new Error(
          `Missing CSV column: ${required}`,
        );
      }
    }

    const rows: SyllabusRow[] = [];

    lines
      .slice(1)
      .forEach((line, index) => {
        const values =
          parseCSVLine(line);

        const row: Record<
          string,
          string
        > = {};

        headers.forEach(
          (header, columnIndex) => {
            row[header] =
              values[columnIndex] ?? "";
          },
        );

        const rowNumber = index + 2;

        const externalId =
          row.external_id?.trim();

        const category =
          row.category
            ?.trim()
            .toLowerCase();

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

        if (
          !row.chapter_name?.trim()
        ) {
          throw new Error(
            `Row ${rowNumber}: chapter_name is required.`,
          );
        }

        if (category === "school") {
          if (
            !row.class_name?.trim()
          ) {
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

        if (
          category ===
          "government_exam"
        ) {
          if (!row.exam?.trim()) {
            throw new Error(
              `Row ${rowNumber}: exam is required for government_exam.`,
            );
          }
        }

        const parsedOrder = Number(
          row.order_no || "1",
        );

        if (
          !Number.isFinite(
            parsedOrder,
          )
        ) {
          throw new Error(
            `Row ${rowNumber}: order_no must be a number.`,
          );
        }

        rows.push({
          external_id: externalId,

          category,

          class_name:
            category === "school"
              ? normalizeValue(
                  row.class_name,
                )
              : null,

          board:
            category === "school"
              ? normalizeValue(
                  row.board,
                )
              : null,

          exam:
            category ===
            "government_exam"
              ? normalizeValue(
                  row.exam,
                )
              : null,

          subject:
            row.subject.trim(),

          chapter_name:
            row.chapter_name.trim(),

          topic_name:
            normalizeValue(
              row.topic_name,
            ),

          key_points:
            normalizeValue(
              row.key_points,
            ),

          order_no:
            parsedOrder,

          is_active:
            parseBoolean(
              row.is_active,
            ),
        });
      });

    const ids = new Set<string>();

    for (const row of rows) {
      if (
        ids.has(
          row.external_id,
        )
      ) {
        throw new Error(
          `Duplicate external_id found: ${row.external_id}`,
        );
      }

      ids.add(
        row.external_id,
      );
    }

    return rows;
  }

  async function handleSyllabusCSVFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setError("");
    setMessage("");

    setCsvRows([]);

    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please select a CSV file.",
      );

      return;
    }

    setFileName(
      file.name,
    );

    try {
      const text =
        await file.text();

      const rows =
        parseSyllabusCSV(
          text,
        );

      setCsvRows(rows);

      setMessage(
        `${rows.length} syllabus row${
          rows.length === 1
            ? ""
            : "s"
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

  async function handleSyllabusUpload() {
    setError("");
    setMessage("");

    if (!csvRows.length) {
      setError(
        "Please select a valid CSV file first.",
      );

      return;
    }

    setLoading(true);

    try {
      const {
        error: upsertError,
      } = await supabase
        .from("syllabi")
        .upsert(
          csvRows,
          {
            onConflict:
              "external_id",
          },
        );

      if (upsertError) {
        throw upsertError;
      }

      setMessage(
        `${csvRows.length} syllabus row${
          csvRows.length === 1
            ? ""
            : "s"
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

  /* =====================================================
     CURRENT AFFAIRS MANAGER
  ===================================================== */

  function openCurrentAffairsManager() {
    setShowCurrentAffairsManager(
      true,
    );

    setCurrentAffairsMessage("");
    setCurrentAffairsError("");
  }

  function closeCurrentAffairsManager() {
    if (
      currentAffairsLoading
    ) {
      return;
    }

    setShowCurrentAffairsManager(
      false,
    );

    setCurrentAffairsRows(
      [],
    );

    setCurrentAffairsFileName(
      "",
    );

    setCurrentAffairsMessage(
      "",
    );

    setCurrentAffairsError(
      "",
    );

    if (
      currentAffairsFileInputRef.current
    ) {
      currentAffairsFileInputRef.current.value =
        "";
    }
  }

  function parseCurrentAffairsCSV(
    text: string,
  ): CurrentAffairRow[] {
    const lines = text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(
        (line) =>
          line.trim() !== "",
      );

    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain a header and at least one row.",
      );
    }

    const headers =
      parseCSVLine(
        lines[0],
      ).map((header) =>
        header
          .trim()
          .toLowerCase(),
      );

    const requiredHeaders = [
      "external_id",
      "title",
      "summary",
      "category",
      "date",
      "source",
      "is_active",
    ];

    for (const required of requiredHeaders) {
      if (
        !headers.includes(
          required,
        )
      ) {
        throw new Error(
          `Missing CSV column: ${required}`,
        );
      }
    }

    const rows: CurrentAffairRow[] =
      [];

    lines
      .slice(1)
      .forEach((line, index) => {
        const values =
          parseCSVLine(
            line,
          );

        const row: Record<
          string,
          string
        > = {};

        headers.forEach(
          (
            header,
            columnIndex,
          ) => {
            row[header] =
              values[
                columnIndex
              ] ?? "";
          },
        );

        const rowNumber =
          index + 2;

        const externalId =
          row.external_id?.trim();

        const title =
          row.title?.trim();

        const summary =
          row.summary?.trim();

        const category =
          row.category?.trim();

        const date =
          row.date?.trim();

        if (!externalId) {
          throw new Error(
            `Row ${rowNumber}: external_id is required.`,
          );
        }

        if (!title) {
          throw new Error(
            `Row ${rowNumber}: title is required.`,
          );
        }

        if (!summary) {
          throw new Error(
            `Row ${rowNumber}: summary is required.`,
          );
        }

        if (!category) {
          throw new Error(
            `Row ${rowNumber}: category is required.`,
          );
        }

        if (!date) {
          throw new Error(
            `Row ${rowNumber}: date is required.`,
          );
        }

        rows.push({
          external_id:
            externalId,

          title,

          summary,

          category,

          date,

          source:
            normalizeValue(
              row.source,
            ),

          is_active:
            parseBoolean(
              row.is_active,
            ),
        });
      });

    const ids =
      new Set<string>();

    for (const row of rows) {
      if (
        ids.has(
          row.external_id,
        )
      ) {
        throw new Error(
          `Duplicate external_id found: ${row.external_id}`,
        );
      }

      ids.add(
        row.external_id,
      );
    }

    return rows;
  }

  async function handleCurrentAffairsCSVFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setCurrentAffairsError(
      "",
    );

    setCurrentAffairsMessage(
      "",
    );

    setCurrentAffairsRows(
      [],
    );

    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setCurrentAffairsError(
        "Please select a CSV file.",
      );

      return;
    }

    setCurrentAffairsFileName(
      file.name,
    );

    try {
      const text =
        await file.text();

      const rows =
        parseCurrentAffairsCSV(
          text,
        );

      setCurrentAffairsRows(
        rows,
      );

      setCurrentAffairsMessage(
        `${rows.length} current affair${
          rows.length === 1
            ? ""
            : "s"
        } loaded successfully.`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.";

      setCurrentAffairsError(
        message,
      );

      setCurrentAffairsFileName(
        "",
      );
    }
  }

  async function handleCurrentAffairsUpload() {
    setCurrentAffairsError(
      "",
    );

    setCurrentAffairsMessage(
      "",
    );

    if (
      !currentAffairsRows.length
    ) {
      setCurrentAffairsError(
        "Please select a valid CSV file first.",
      );

      return;
    }

    setCurrentAffairsLoading(
      true,
    );

    try {
      const {
        error: upsertError,
      } = await supabase
        .from(
          "current_affairs",
        )
        .upsert(
          currentAffairsRows,
          {
            onConflict:
              "external_id",
          },
        );

      if (upsertError) {
        throw upsertError;
      }

      setCurrentAffairsMessage(
        `${currentAffairsRows.length} current affair${
          currentAffairsRows.length ===
          1
            ? ""
            : "s"
        } successfully inserted/updated.`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to upload current affairs.";

      setCurrentAffairsError(
        message,
      );
    } finally {
      setCurrentAffairsLoading(
        false,
      );
    }
  }

  /* =====================================================
     UI
  ===================================================== */

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
              Administration Dashboard
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
            You have administrator access to PadhAI.
          </p>

        </div>

        {/* STATS */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Students
            </p>

            <p className="mt-2 text-3xl font-bold">
              —
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Syllabus
            </p>

            <p className="mt-2 text-3xl font-bold">
              {csvRows.length || "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Affairs
            </p>

            <p className="mt-2 text-3xl font-bold">
              {currentAffairsRows.length ||
                "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              AI
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ON
            </p>
          </div>

        </div>

        {/* MANAGEMENT */}

        <h3 className="mb-4 text-xl font-bold">
          Management
        </h3>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* SYLLABUS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">

            <div className="text-3xl">
              📚
            </div>

            <h3 className="mt-4 font-bold">
              Syllabus
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload and update class-wise and government exam syllabus using CSV.
            </p>

            <button
              type="button"
              onClick={
                openSyllabusManager
              }
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage Syllabus
            </button>

          </div>

          {/* CURRENT AFFAIRS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">

            <div className="text-3xl">
              📰
            </div>

            <h3 className="mt-4 font-bold">
              Current Affairs
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload weekly current affairs and important exam-focused news using CSV.
            </p>

            <button
              type="button"
              onClick={
                openCurrentAffairsManager
              }
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage Current Affairs
            </button>

          </div>

          {/* STUDENTS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="text-3xl">
              👨‍🎓
            </div>

            <h3 className="mt-4 font-bold">
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

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="text-3xl">
              🤖
            </div>

            <h3 className="mt-4 font-bold">
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

        </div>

      </main>

      {/* =====================================================
          SYLLABUS MODAL
      ===================================================== */}

      {showSyllabusManager && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

          <div className="flex min-h-full items-center justify-center">

            <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold">
                    📚 Syllabus Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload CSV to insert or update syllabus.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeSyllabusManager
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
                >
                  ×
                </button>

              </div>

              <div className="p-6">

                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                  <div className="text-4xl">
                    📄
                  </div>

                  <h3 className="mt-3 font-bold">
                    Upload Syllabus CSV
                  </h3>

                  <input
                    ref={
                      syllabusFileInputRef
                    }
                    type="file"
                    accept=".csv,text/csv"
                    onChange={
                      handleSyllabusCSVFile
                    }
                    className="mt-5 block w-full text-sm"
                  />

                  {fileName && (
                    <p className="mt-3 text-sm font-medium text-blue-600">
                      Selected: {fileName}
                    </p>
                  )}

                </div>

                {error && (
                  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    ❌ {error}
                  </div>
                )}

                {message && (
                  <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    ✅ {message}
                  </div>
                )}

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
                        onClick={
                          handleSyllabusUpload
                        }
                        disabled={
                          loading
                        }
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {loading
                          ? "Uploading..."
                          : "Upload / Update"}
                      </button>

                    </div>

                  </div>

                )}

                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">

                  <p className="text-sm font-semibold">
                    Required CSV columns
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-300">
                    external_id, category, class_name, board, exam, subject, chapter_name, topic_name, key_points, order_no, is_active
                  </p>

                </div>

              </div>

              <div className="flex justify-end border-t px-6 py-4">

                <button
                  type="button"
                  onClick={
                    closeSyllabusManager
                  }
                  disabled={
                    loading
                  }
                  className="rounded-xl border px-5 py-2.5 text-sm font-semibold"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          CURRENT AFFAIRS MODAL
      ===================================================== */}

      {showCurrentAffairsManager && (

        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

          <div className="flex min-h-full items-center justify-center">

            <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold">
                    📰 Current Affairs Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload weekly current affairs using CSV.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeCurrentAffairsManager
                  }
                  disabled={
                    currentAffairsLoading
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl"
                >
                  ×
                </button>

              </div>

              {/* BODY */}

              <div className="p-6">

                {/* UPLOAD */}

                <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center">

                  <div className="text-5xl">
                    📰
                  </div>

                  <h3 className="mt-3 font-bold">
                    Upload Current Affairs CSV
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Upload important weekly exam-focused current affairs.
                  </p>

                  <input
                    ref={
                      currentAffairsFileInputRef
                    }
                    type="file"
                    accept=".csv,text/csv"
                    onChange={
                      handleCurrentAffairsCSVFile
                    }
                    className="mt-5 block w-full text-sm"
                  />

                  {currentAffairsFileName && (

                    <p className="mt-3 text-sm font-medium text-blue-600">
                      Selected:{" "}
                      {
                        currentAffairsFileName
                      }
                    </p>

                  )}

                </div>

                {/* ERROR */}

                {currentAffairsError && (

                  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                    ❌ {currentAffairsError}
                  </div>

                )}

                {/* SUCCESS */}

                {currentAffairsMessage && (

                  <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                    ✅ {currentAffairsMessage}
                  </div>

                )}

                {/* PREVIEW */}

                {currentAffairsRows.length > 0 && (

                  <div className="mt-6">

                    <div className="mb-4 flex items-center justify-between">

                      <div>

                        <h3 className="font-bold">
                          CSV Preview
                        </h3>

                        <p className="text-sm text-slate-500">
                          {
                            currentAffairsRows.length
                          }{" "}
                          rows ready for upload.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          handleCurrentAffairsUpload
                        }
                        disabled={
                          currentAffairsLoading
                        }
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {currentAffairsLoading
                          ? "Uploading..."
                          : "Upload / Update"}
                      </button>

                    </div>

                    {/* TABLE */}

                    <div className="max-h-[420px] overflow-auto rounded-2xl border">

                      <table className="min-w-[1000px] w-full text-left text-sm">

                        <thead className="sticky top-0 bg-slate-100">

                          <tr>

                            <th className="px-4 py-3">
                              ID
                            </th>

                            <th className="px-4 py-3">
                              Title
                            </th>

                            <th className="px-4 py-3">
                              Category
                            </th>

                            <th className="px-4 py-3">
                              Date
                            </th>

                            <th className="px-4 py-3">
                              Summary
                            </th>

                            <th className="px-4 py-3">
                              Source
                            </th>

                            <th className="px-4 py-3">
                              Active
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {currentAffairsRows
                            .slice(
                              0,
                              100,
                            )
                            .map(
                              (
                                row,
                              ) => (

                                <tr
                                  key={
                                    row.external_id
                                  }
                                  className="border-t"
                                >

                                  <td className="px-4 py-3 font-mono text-xs">
                                    {
                                      row.external_id
                                    }
                                  </td>

                                  <td className="px-4 py-3 font-semibold">
                                    {
                                      row.title
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.category
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.date
                                    }
                                  </td>

                                  <td className="max-w-md px-4 py-3">
                                    {
                                      row.summary
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {row.source ||
                                      "—"}
                                  </td>

                                  <td className="px-4 py-3">
                                    {row.is_active
                                      ? "Yes"
                                      : "No"}
                                  </td>

                                </tr>

                              ),
                            )}

                        </tbody>

                      </table>

                    </div>

                    {currentAffairsRows.length >
                      100 && (

                      <p className="mt-2 text-xs text-slate-500">
                        Showing first 100 rows. All{" "}
                        {
                          currentAffairsRows.length
                        }{" "}
                        rows will be uploaded.
                      </p>

                    )}

                  </div>

                )}

                {/* FORMAT */}

                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">

                  <p className="text-sm font-semibold">
                    Required Current Affairs CSV columns
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-300">
                    external_id, title, summary, category, date, source, is_active
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Existing external_id = update | New external_id = insert
                  </p>

                </div>

                {/* EXAMPLE */}

                <div className="mt-4 rounded-2xl bg-blue-50 p-5">

                  <p className="font-semibold text-blue-900">
                    Example CSV
                  </p>

                  <pre className="mt-3 overflow-x-auto text-xs text-blue-800">
{`external_id,title,summary,category,date,source,is_active
CA001,New Education Policy Update,"Important education policy update for students",National,2026-08-30,PIB,true
CA002,ISRO Space Mission,"Important space mission update",Science & Tech,2026-08-30,ISRO,true`}
                  </pre>

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex justify-end border-t px-6 py-4">

                <button
                  type="button"
                  onClick={
                    closeCurrentAffairsManager
                  }
                  disabled={
                    currentAffairsLoading
                  }
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50"
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
