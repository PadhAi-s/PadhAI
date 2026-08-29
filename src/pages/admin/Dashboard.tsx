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

type NewspaperLanguage = "hindi" | "english";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const syllabusFileInputRef =
    useRef<HTMLInputElement>(null);

  const newspaperFileInputRef =
    useRef<HTMLInputElement>(null);

  // =========================================================
  // SYLLABUS STATE
  // =========================================================

  const [showSyllabusManager, setShowSyllabusManager] =
    useState(false);

  const [csvRows, setCsvRows] =
    useState<SyllabusRow[]>([]);

  const [fileName, setFileName] =
    useState("");

  const [syllabusLoading, setSyllabusLoading] =
    useState(false);

  const [syllabusMessage, setSyllabusMessage] =
    useState("");

  const [syllabusError, setSyllabusError] =
    useState("");

  // =========================================================
  // NEWSPAPER STATE
  // =========================================================

  const [showNewspaperManager, setShowNewspaperManager] =
    useState(false);

  const [newspaperDate, setNewspaperDate] =
    useState(
      new Date().toISOString().slice(0, 10),
    );

  const [newspaperLanguage, setNewspaperLanguage] =
    useState<NewspaperLanguage>("hindi");

  const [newspaperNumber, setNewspaperNumber] =
    useState("1");

  const [newspaperTitle, setNewspaperTitle] =
    useState("");

  const [newspaperFile, setNewspaperFile] =
    useState<File | null>(null);

  const [newspaperFileName, setNewspaperFileName] =
    useState("");

  const [newspaperLoading, setNewspaperLoading] =
    useState(false);

  const [newspaperMessage, setNewspaperMessage] =
    useState("");

  const [newspaperError, setNewspaperError] =
    useState("");

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  // =========================================================
  // SYLLABUS MANAGER
  // =========================================================

  function openSyllabusManager() {
    setShowSyllabusManager(true);
    setSyllabusMessage("");
    setSyllabusError("");
  }

  function closeSyllabusManager() {
    if (syllabusLoading) return;

    setShowSyllabusManager(false);
    setCsvRows([]);
    setFileName("");
    setSyllabusMessage("");
    setSyllabusError("");

    if (syllabusFileInputRef.current) {
      syllabusFileInputRef.current.value = "";
    }
  }

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
    value: string,
  ): string | null {
    const trimmed = value.trim();

    return trimmed ? trimmed : null;
  }

  function parseCSV(
    text: string,
  ): SyllabusRow[] {
    const lines = text
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .filter(
        (line) => line.trim() !== "",
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
        const values = parseCSVLine(line);

        const row: Record<string, string> =
          {};

        headers.forEach(
          (
            header,
            columnIndex,
          ) => {
            row[header] =
              values[columnIndex] ?? "";
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
          category !== "government_exam"
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
      });

    const ids = new Set<string>();

    for (const row of rows) {
      if (
        ids.has(row.external_id)
      ) {
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
    setSyllabusError("");
    setSyllabusMessage("");
    setCsvRows([]);

    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setSyllabusError(
        "Please select a CSV file.",
      );
      return;
    }

    setFileName(file.name);

    try {
      const text =
        await file.text();

      const rows =
        parseCSV(text);

      setCsvRows(rows);

      setSyllabusMessage(
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

      setSyllabusError(
        errorMessage,
      );

      setFileName("");
    }
  }

  async function handleSyllabusUpload() {
    setSyllabusError("");
    setSyllabusMessage("");

    if (!csvRows.length) {
      setSyllabusError(
        "Please select a valid CSV file first.",
      );
      return;
    }

    setSyllabusLoading(true);

    try {
      const {
        error: upsertError,
      } = await supabase
        .from("syllabi")
        .upsert(csvRows, {
          onConflict:
            "external_id",
        });

      if (upsertError) {
        throw upsertError;
      }

      setSyllabusMessage(
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

      setSyllabusError(
        errorMessage,
      );
    } finally {
      setSyllabusLoading(false);
    }
  }

  // =========================================================
  // NEWSPAPER MANAGER
  // =========================================================

  function openNewspaperManager() {
    setShowNewspaperManager(true);

    setNewspaperMessage("");
    setNewspaperError("");

    setNewspaperDate(
      new Date()
        .toISOString()
        .slice(0, 10),
    );

    setNewspaperLanguage(
      "hindi",
    );

    setNewspaperNumber("1");
    setNewspaperTitle("");
    setNewspaperFile(null);
    setNewspaperFileName("");
  }

  function closeNewspaperManager() {
    if (newspaperLoading) return;

    setShowNewspaperManager(false);

    setNewspaperMessage("");
    setNewspaperError("");
    setNewspaperFile(null);
    setNewspaperFileName("");

    if (
      newspaperFileInputRef.current
    ) {
      newspaperFileInputRef.current.value =
        "";
    }
  }

  function handleNewspaperFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setNewspaperError("");
    setNewspaperMessage("");

    const file =
      event.target.files?.[0];

    if (!file) {
      setNewspaperFile(null);
      setNewspaperFileName("");
      return;
    }

    const isPdf =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPdf) {
      setNewspaperFile(null);
      setNewspaperFileName("");

      if (
        newspaperFileInputRef.current
      ) {
        newspaperFileInputRef.current.value =
          "";
      }

      setNewspaperError(
        "Please select a PDF file.",
      );

      return;
    }

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      setNewspaperFile(null);
      setNewspaperFileName("");

      if (
        newspaperFileInputRef.current
      ) {
        newspaperFileInputRef.current.value =
          "";
      }

      setNewspaperError(
        "PDF size must be less than 25 MB.",
      );

      return;
    }

    setNewspaperFile(file);
    setNewspaperFileName(
      file.name,
    );
  }

  async function handleNewspaperUpload() {
    setNewspaperError("");
    setNewspaperMessage("");

    if (!newspaperDate) {
      setNewspaperError(
        "Please select newspaper date.",
      );
      return;
    }

    const paperNumber =
      Number(newspaperNumber);

    if (
      !Number.isInteger(
        paperNumber,
      ) ||
      paperNumber < 1
    ) {
      setNewspaperError(
        "Paper number must be a positive number.",
      );
      return;
    }

    if (!newspaperFile) {
      setNewspaperError(
        "Please select a newspaper PDF.",
      );
      return;
    }

    if (!user) {
      setNewspaperError(
        "Admin session not found. Please login again.",
      );
      return;
    }

    setNewspaperLoading(true);

    try {
      // -----------------------------------------------------
      // CREATE SAFE STORAGE FILE NAME
      // -----------------------------------------------------

      const extension =
        newspaperFile.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "pdf";

      const safeLanguage =
        newspaperLanguage;

      const storagePath =
        `${newspaperDate}/${safeLanguage}/paper-${paperNumber}-${Date.now()}.${extension}`;

      // -----------------------------------------------------
      // UPLOAD PDF TO STORAGE
      // -----------------------------------------------------

      const {
        error: storageError,
      } = await supabase.storage
        .from("newspapers")
        .upload(
          storagePath,
          newspaperFile,
          {
            contentType:
              "application/pdf",

            upsert: false,
          },
        );

      if (storageError) {
        throw new Error(
          `PDF upload failed: ${storageError.message}`,
        );
      }

      // -----------------------------------------------------
      // INSERT DATABASE RECORD
      // -----------------------------------------------------

      const {
        error: databaseError,
      } = await supabase
        .from("newspaper_papers")
        .insert({
          newspaper_date:
            newspaperDate,

          language:
            newspaperLanguage,

          paper_number:
            paperNumber,

          title:
            newspaperTitle.trim() ||
            `Paper ${paperNumber}`,

          storage_path:
            storagePath,

          published: true,
        });

      // -----------------------------------------------------
      // IF DATABASE INSERT FAILS,
      // DELETE STORAGE FILE TO AVOID ORPHAN PDF
      // -----------------------------------------------------

      if (databaseError) {
        await supabase.storage
          .from("newspapers")
          .remove([
            storagePath,
          ]);

        throw new Error(
          `Newspaper database entry failed: ${databaseError.message}`,
        );
      }

      setNewspaperMessage(
        "✅ Newspaper uploaded and published successfully.",
      );

      setNewspaperFile(null);
      setNewspaperFileName("");

      setNewspaperTitle("");

      if (
        newspaperFileInputRef.current
      ) {
        newspaperFileInputRef.current.value =
          "";
      }

      // Next paper defaults to next number
      setNewspaperNumber(
        String(paperNumber + 1),
      );
    } catch (err) {
      console.error(
        "Newspaper upload error:",
        err,
      );

      setNewspaperError(
        err instanceof Error
          ? err.message
          : "Newspaper upload failed.",
      );
    } finally {
      setNewspaperLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
          ===================================================== */}

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

      {/* =====================================================
          MAIN
          ===================================================== */}

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
            You have administrator access
            to PadhAI.
          </p>
        </div>

        {/* ===================================================
            STATS
            =================================================== */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Students
            </p>

            <p className="mt-2 text-3xl font-bold">
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

            <p className="mt-2 text-3xl font-bold">
              {csvRows.length ||
                "—"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              CSV rows loaded
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Newspaper
            </p>

            <p className="mt-2 text-3xl font-bold">
              📰
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Upload newspapers
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

        {/* ===================================================
            MANAGEMENT
            =================================================== */}

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
              Upload and update class-wise
              and government exam syllabus
              using CSV.
            </p>

            <button
              type="button"
              onClick={
                openSyllabusManager
              }
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Manage Syllabus
            </button>
          </div>

          {/* NEWSPAPERS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">
              📰
            </div>

            <h3 className="mt-4 font-bold">
              Newspapers
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload Hindi and English
              newspaper PDFs with date and
              paper number.
            </p>

            <button
              type="button"
              onClick={
                openNewspaperManager
              }
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Upload Newspaper
            </button>
          </div>

          {/* STUDENTS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">
              👨‍🎓
            </div>

            <h3 className="mt-4 font-bold">
              Students
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage student accounts and
              profiles.
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
          NEWSPAPER MANAGER MODAL
          ===================================================== */}

      {showNewspaperManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold">
                    📰 Newspaper Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload newspaper PDF.
                    Database entry will be
                    created automatically.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeNewspaperManager
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              {/* BODY */}

              <div className="space-y-5 p-6">
                {/* DATE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Newspaper Date
                  </label>

                  <input
                    type="date"
                    value={
                      newspaperDate
                    }
                    onChange={(event) =>
                      setNewspaperDate(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                {/* LANGUAGE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Language
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setNewspaperLanguage(
                          "hindi",
                        )
                      }
                      className={`rounded-xl border px-4 py-3 font-semibold transition ${
                        newspaperLanguage ===
                        "hindi"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      🇮🇳 Hindi
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNewspaperLanguage(
                          "english",
                        )
                      }
                      className={`rounded-xl border px-4 py-3 font-semibold transition ${
                        newspaperLanguage ===
                        "english"
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      🇬🇧 English
                    </button>
                  </div>
                </div>

                {/* PAPER NUMBER */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Paper Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      newspaperNumber
                    }
                    onChange={(event) =>
                      setNewspaperNumber(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="1"
                  />
                </div>

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Title
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={
                      newspaperTitle
                    }
                    onChange={(event) =>
                      setNewspaperTitle(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="e.g. Daily News"
                  />
                </div>

                {/* PDF */}

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Newspaper PDF
                  </label>

                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
                    <div className="text-center">
                      <div className="text-4xl">
                        📄
                      </div>

                      <p className="mt-2 text-sm font-semibold">
                        Select newspaper PDF
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        PDF only • Maximum 25 MB
                      </p>

                      <input
                        ref={
                          newspaperFileInputRef
                        }
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={
                          handleNewspaperFile
                        }
                        className="mt-4 block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                      />

                      {newspaperFileName && (
                        <p className="mt-3 text-sm font-semibold text-blue-600">
                          Selected:{" "}
                          {
                            newspaperFileName
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ERROR */}

                {newspaperError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ❌{" "}
                    {
                      newspaperError
                    }
                  </div>
                )}

                {/* SUCCESS */}

                {newspaperMessage && (
                  <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {
                      newspaperMessage
                    }
                  </div>
                )}

                {/* INFO */}

                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="font-semibold">
                    Upload process
                  </p>

                  <div className="mt-3 space-y-1 text-sm text-slate-300">
                    <p>
                      1. PDF Storage me upload hoga
                    </p>

                    <p>
                      2. `newspaper_papers` me entry automatically banegi
                    </p>

                    <p>
                      3. Paper automatically published hoga
                    </p>

                    <p>
                      4. Student Daily Newspaper page par dikhega
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex justify-end gap-3 border-t px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeNewspaperManager
                  }
                  disabled={
                    newspaperLoading
                  }
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={
                    handleNewspaperUpload
                  }
                  disabled={
                    newspaperLoading
                  }
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {newspaperLoading
                    ? "Uploading..."
                    : "Upload & Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SYLLABUS MANAGER MODAL
          ===================================================== */}

      {showSyllabusManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl">
              {/* HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold">
                    📚 Syllabus Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload CSV to insert new
                    syllabus or update
                    existing syllabus.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeSyllabusManager
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
                >
                  ×
                </button>
              </div>

              {/* BODY */}

              <div className="p-6">
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="text-4xl">
                    📄
                  </div>

                  <h3 className="mt-3 font-bold">
                    Upload Syllabus CSV
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Use the standard PadhAI
                    syllabus CSV format.
                  </p>

                  <input
                    ref={
                      syllabusFileInputRef
                    }
                    type="file"
                    accept=".csv,text/csv"
                    onChange={
                      handleCSVFile
                    }
                    className="mt-5 block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
                  />

                  {fileName && (
                    <p className="mt-3 text-sm font-medium text-blue-600">
                      Selected:{" "}
                      {fileName}
                    </p>
                  )}
                </div>

                {syllabusError && (
                  <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ❌{" "}
                    {
                      syllabusError
                    }
                  </div>
                )}

                {syllabusMessage && (
                  <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✅{" "}
                    {
                      syllabusMessage
                    }
                  </div>
                )}

                {csvRows.length >
                  0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">
                          CSV Preview
                        </h3>

                        <p className="text-sm text-slate-500">
                          {
                            csvRows.length
                          }{" "}
                          rows ready for
                          upload.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleSyllabusUpload
                        }
                        disabled={
                          syllabusLoading
                        }
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {syllabusLoading
                          ? "Uploading..."
                          : "Upload / Update"}
                      </button>
                    </div>

                    <div className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200">
                      <table className="min-w-[1100px] w-full text-left text-sm">
                        <thead className="sticky top-0 bg-slate-100">
                          <tr>
                            <th className="px-4 py-3">
                              ID
                            </th>

                            <th className="px-4 py-3">
                              Category
                            </th>

                            <th className="px-4 py-3">
                              Class
                            </th>

                            <th className="px-4 py-3">
                              Board
                            </th>

                            <th className="px-4 py-3">
                              Exam
                            </th>

                            <th className="px-4 py-3">
                              Subject
                            </th>

                            <th className="px-4 py-3">
                              Chapter
                            </th>

                            <th className="px-4 py-3">
                              Topic
                            </th>

                            <th className="px-4 py-3">
                              Order
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
                              ) => (
                                <tr
                                  key={
                                    row.external_id
                                  }
                                  className="border-t border-slate-100"
                                >
                                  <td className="px-4 py-3 font-mono text-xs">
                                    {
                                      row.external_id
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.category
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.class_name ||
                                      "—"
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.board ||
                                      "—"
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.exam ||
                                      "—"
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.subject
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.chapter_name
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.topic_name ||
                                      "—"
                                    }
                                  </td>

                                  <td className="px-4 py-3">
                                    {
                                      row.order_no
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
                        Showing first 100
                        rows. All{" "}
                        {
                          csvRows.length
                        }{" "}
                        rows will be
                        uploaded.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm font-semibold">
                    Required CSV columns
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-300">
                    external_id,
                    category,
                    class_name,
                    board, exam,
                    subject,
                    chapter_name,
                    topic_name,
                    key_points,
                    order_no,
                    is_active
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Existing external_id =
                    update &nbsp; | &nbsp;
                    New external_id =
                    insert
                  </p>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex justify-end border-t px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeSyllabusManager
                  }
                  disabled={
                    syllabusLoading
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
