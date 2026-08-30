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

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface CurrentAffairRow {
  affair_date: string;
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  mcqs: MCQ[];
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

  const [
    showSyllabusManager,
    setShowSyllabusManager,
  ] = useState(false);

  const [
    showCurrentAffairsManager,
    setShowCurrentAffairsManager,
  ] = useState(false);

  /* =====================================================
     SYLLABUS STATES
  ===================================================== */

  const [csvRows, setCsvRows] =
    useState<SyllabusRow[]>([]);

  const [fileName, setFileName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

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

  function parseCSVLine(
    line: string,
  ): string[] {
    const values: string[] = [];

    let current = "";

    let insideQuotes = false;

    for (
      let i = 0;
      i < line.length;
      i++
    ) {
      const char = line[i];

      if (char === '"') {
        if (
          insideQuotes &&
          line[i + 1] === '"'
        ) {
          current += '"';
          i++;
        } else {
          insideQuotes =
            !insideQuotes;
        }
      } else if (
        char === "," &&
        !insideQuotes
      ) {
        values.push(
          current.trim(),
        );

        current = "";
      } else {
        current += char;
      }
    }

    values.push(
      current.trim(),
    );

    return values;
  }

  function parseBoolean(
    value: string,
  ): boolean {
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
    const trimmed =
      value?.trim() || "";

    return trimmed
      ? trimmed
      : null;
  }

  /* =====================================================
     SYLLABUS MANAGER
  ===================================================== */

  function openSyllabusManager() {
    setShowSyllabusManager(
      true,
    );

    setMessage("");
    setError("");
  }

  function closeSyllabusManager() {
    if (loading) return;

    setShowSyllabusManager(
      false,
    );

    setCsvRows([]);

    setFileName("");

    setMessage("");
    setError("");

    if (
      syllabusFileInputRef.current
    ) {
      syllabusFileInputRef.current.value =
        "";
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

    for (
      const required of requiredHeaders
    ) {
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

    const rows: SyllabusRow[] =
      [];

    lines
      .slice(1)
      .forEach(
        (line, index) => {
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
            category !==
              "government_exam"
          ) {
            throw new Error(
              `Row ${rowNumber}: category must be school or government_exam.`,
            );
          }

          if (
            !row.subject?.trim()
          ) {
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

          if (
            category === "school"
          ) {
            if (
              !row.class_name?.trim()
            ) {
              throw new Error(
                `Row ${rowNumber}: class_name is required for school syllabus.`,
              );
            }

            if (
              !row.board?.trim()
            ) {
              throw new Error(
                `Row ${rowNumber}: board is required for school syllabus.`,
              );
            }
          }

          if (
            category ===
            "government_exam"
          ) {
            if (
              !row.exam?.trim()
            ) {
              throw new Error(
                `Row ${rowNumber}: exam is required for government_exam.`,
              );
            }
          }

          const parsedOrder =
            Number(
              row.order_no ||
                "1",
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
            external_id:
              externalId,

            category:
              category as
                | "school"
                | "government_exam",

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
        },
      );

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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.";

      setError(
        errorMessage,
      );

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
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to upload syllabus.";

      setError(
        errorMessage,
      );
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

    setCurrentAffairsMessage(
      "",
    );

    setCurrentAffairsError(
      "",
    );
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

  /* =====================================================
     PARSE CURRENT AFFAIRS CSV
  ===================================================== */

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
      "affair_date",
      "serial_no",
      "title",
      "why_in_news",
      "key_facts",
      "exam_point",
      "static_gk",
      "mcqs",
    ];

    for (
      const required of requiredHeaders
    ) {
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
      .forEach(
        (line, index) => {
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

          const affairDate =
            row.affair_date?.trim();

          const title =
            row.title?.trim();

          const serialNo =
            Number(
              row.serial_no?.trim(),
            );

          if (!affairDate) {
            throw new Error(
              `Row ${rowNumber}: affair_date is required.`,
            );
          }

          const parsedDate =
            new Date(
              `${affairDate}T00:00:00`,
            );

          if (
            Number.isNaN(
              parsedDate.getTime(),
            )
          ) {
            throw new Error(
              `Row ${rowNumber}: affair_date must be YYYY-MM-DD.`,
            );
          }

          if (
            !Number.isFinite(
              serialNo,
            ) ||
            serialNo < 1
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

          let mcqs: MCQ[] = [];

          if (
            row.mcqs?.trim()
          ) {
            try {
              const parsed =
                JSON.parse(
                  row.mcqs,
                );

              if (
                !Array.isArray(
                  parsed,
                )
              ) {
                throw new Error();
              }

              mcqs =
                parsed.map(
                  (
                    mcq: unknown,
                    mcqIndex: number,
                  ) => {
                    const item =
                      mcq as Partial<MCQ>;

                    if (
                      !item.question ||
                      !Array.isArray(
                        item.options,
                      ) ||
                      !item.answer
                    ) {
                      throw new Error(
                        `MCQ ${mcqIndex + 1} is invalid`,
                      );
                    }

                    return {
                      question:
                        String(
                          item.question,
                        ),

                      options:
                        item.options.map(
                          (option) =>
                            String(
                              option,
                            ),
                        ),

                      answer:
                        String(
                          item.answer,
                        ),

                      explanation:
                        item.explanation
                          ? String(
                              item.explanation,
                            )
                          : undefined,
                    };
                  },
                );
            } catch (error) {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Invalid JSON";

              throw new Error(
                `Row ${rowNumber}: mcqs must contain valid JSON. ${errorMessage}`,
              );
            }
          }

          rows.push({
            affair_date:
              affairDate,

            serial_no:
              serialNo,

            title,

            why_in_news:
              row.why_in_news?.trim() ||
              "",

            key_facts:
              row.key_facts?.trim() ||
              "",

            exam_point:
              row.exam_point?.trim() ||
              "",

            static_gk:
              row.static_gk?.trim() ||
              "",

            mcqs,
          });
        },
      );

    return rows;
  }

  /* =====================================================
     SELECT CURRENT AFFAIRS FILE
  ===================================================== */

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
        `✅ ${rows.length} current affair${
          rows.length === 1
            ? ""
            : "s"
        } loaded successfully. Click Upload Current Affairs to submit.`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.";

      setCurrentAffairsError(
        errorMessage,
      );

      setCurrentAffairsFileName(
        "",
      );

      setCurrentAffairsRows(
        [],
      );
    }
  }

  /* =====================================================
     UPLOAD CURRENT AFFAIRS
  ===================================================== */

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
        error: insertError,
      } = await supabase
        .from(
          "current_affairs",
        )
        .insert(
          currentAffairsRows,
        );

      if (insertError) {
        throw insertError;
      }

      setCurrentAffairsMessage(
        `🎉 ${currentAffairsRows.length} current affair${
          currentAffairsRows.length ===
          1
            ? ""
            : "s"
        } successfully uploaded to Supabase.`,
      );

      setCurrentAffairsRows(
        [],
      );

      setCurrentAffairsFileName(
        "",
      );

      if (
        currentAffairsFileInputRef.current
      ) {
        currentAffairsFileInputRef.current.value =
          "";
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to upload current affairs.";

      setCurrentAffairsError(
        errorMessage,
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
              {csvRows.length ||
                "—"}
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
              Upload daily or weekly exam-focused current affairs using CSV.
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
                    {message}
                  </div>

                )}

                {csvRows.length > 0 && (

                  <div className="mt-6">

                    <div className="mb-3 flex items-center justify-between">

                      <div>

                        <h3 className="font-bold">
                          CSV Ready
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
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {loading
                          ? "Uploading..."
                          : "Upload / Update"}
                      </button>

                    </div>

                  </div>

                )}

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

            <div className="my-6 w-full max-w-6xl rounded-3xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold">
                    📰 Current Affairs Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload exam-focused current affairs directly to Supabase.
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

                {/* UPLOAD AREA */}

                <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center">

                  <div className="text-5xl">
                    📰
                  </div>

                  <h3 className="mt-3 text-lg font-bold">
                    Select Current Affairs CSV
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    After selecting a valid CSV, preview and Upload button will appear.
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

                    <p className="mt-4 font-medium text-blue-600">
                      📄 Selected:{" "}
                      {
                        currentAffairsFileName
                      }
                    </p>

                  )}

                </div>

                {/* ERROR */}

                {currentAffairsError && (

                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                    ❌ {currentAffairsError}
                  </div>

                )}

                {/* SUCCESS */}

                {currentAffairsMessage && (

                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                    {currentAffairsMessage}
                  </div>

                )}

                {/* =====================================================
                    PREVIEW + UPLOAD BUTTON
                ===================================================== */}

                {currentAffairsRows.length > 0 && (

                  <div className="mt-6">

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <h3 className="text-lg font-bold">
                          CSV Preview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {
                            currentAffairsRows.length
                          }{" "}
                          rows are ready for upload.
                        </p>

                      </div>

                      {/* IMPORTANT UPLOAD BUTTON */}

                      <button
                        type="button"
                        onClick={
                          handleCurrentAffairsUpload
                        }
                        disabled={
                          currentAffairsLoading
                        }
                        className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {currentAffairsLoading
                          ? "Uploading..."
                          : "🚀 Upload Current Affairs"}
                      </button>

                    </div>

                    {/* TABLE */}

                    <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200">

                      <table className="min-w-[1300px] w-full text-left text-sm">

                        <thead className="sticky top-0 bg-slate-100">

                          <tr>

                            <th className="px-4 py-3">
                              #
                            </th>

                            <th className="px-4 py-3">
                              Date
                            </th>

                            <th className="px-4 py-3">
                              Title
                            </th>

                            <th className="px-4 py-3">
                              Why in News
                            </th>

                            <th className="px-4 py-3">
                              Key Facts
                            </th>

                            <th className="px-4 py-3">
                              Exam Point
                            </th>

                            <th className="px-4 py-3">
                              Static GK
                            </th>

                            <th className="px-4 py-3">
                              MCQs
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
                                index,
                              ) => (

                                <tr
                                  key={`${row.affair_date}-${row.serial_no}-${index}`}
                                  className="border-t border-slate-200"
                                >

                                  <td className="px-4 py-3 font-bold">
                                    {
                                      row.serial_no
                                    }
                                  </td>

                                  <td className="whitespace-nowrap px-4 py-3">
                                    {
                                      row.affair_date
                                    }
                                  </td>

                                  <td className="min-w-[220px] px-4 py-3 font-semibold">
                                    {
                                      row.title
                                    }
                                  </td>

                                  <td className="min-w-[280px] px-4 py-3">
                                    {
                                      row.why_in_news
                                    }
                                  </td>

                                  <td className="min-w-[280px] px-4 py-3">
                                    {
                                      row.key_facts
                                    }
                                  </td>

                                  <td className="min-w-[220px] px-4 py-3">
                                    {
                                      row.exam_point
                                    }
                                  </td>

                                  <td className="min-w-[220px] px-4 py-3">
                                    {
                                      row.static_gk ||
                                        "—"
                                    }
                                  </td>

                                  <td className="px-4 py-3">

                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                      {
                                        row.mcqs
                                          .length
                                      }{" "}
                                      MCQ
                                      {row
                                        .mcqs
                                        .length !==
                                      1
                                        ? "s"
                                        : ""}
                                    </span>

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
                    Required CSV Columns
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-300">
                    affair_date, serial_no, title, why_in_news, key_facts, exam_point, static_gk, mcqs
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    affair_date format: YYYY-MM-DD
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    For no MCQs, use: []
                  </p>

                </div>

                {/* EXAMPLE */}

                <div className="mt-4 rounded-2xl bg-blue-50 p-5">

                  <p className="font-semibold text-blue-900">
                    Example CSV
                  </p>

                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-blue-800">
{`affair_date,serial_no,title,why_in_news,key_facts,exam_point,static_gk,mcqs
2026-08-30,1,ISRO Space Mission,"ISRO announced a new space mission","Important mission facts","Remember mission name and objective","ISRO HQ: Bengaluru","[]"
2026-08-30,2,New Government Scheme,"Government launched a new scheme","Beneficiaries and key features","Remember scheme and ministry","Important Government Schemes","[]"`}
                  </pre>

                </div>

                {/* MCQ FORMAT */}

                <div className="mt-4 rounded-2xl bg-amber-50 p-5">

                  <p className="font-semibold text-amber-900">
                    MCQ JSON Example
                  </p>

                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-amber-800">
{`[
  {
    "question": "ISRO headquarters is located in?",
    "options": [
      "Delhi",
      "Bengaluru",
      "Mumbai",
      "Chennai"
    ],
    "answer": "Bengaluru",
    "explanation": "ISRO headquarters is located in Bengaluru."
  }
]`}
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

export default AdminDashboard;
