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

interface NewspaperPaper {
  id: string;
  newspaper_date: string;
  language: "hindi" | "english";
  paper_number: number;
  title: string | null;
  storage_path: string;
  published: boolean;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newspaperFileInputRef = useRef<HTMLInputElement>(null);

  /* =========================================================
     SYLLABUS STATE
     ========================================================= */

  const [showSyllabusManager, setShowSyllabusManager] =
    useState(false);

  const [csvRows, setCsvRows] = useState<SyllabusRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusMessage, setSyllabusMessage] = useState("");
  const [syllabusError, setSyllabusError] = useState("");

  /* =========================================================
     NEWSPAPER STATE
     ========================================================= */

  const [showNewspaperManager, setShowNewspaperManager] =
    useState(false);

  const [newspapers, setNewspapers] = useState<NewspaperPaper[]>([]);
  const [newspaperLoading, setNewspaperLoading] = useState(false);
  const [newspaperUploading, setNewspaperUploading] =
    useState(false);

  const [newspaperMessage, setNewspaperMessage] = useState("");
  const [newspaperError, setNewspaperError] = useState("");

  const [newspaperDate, setNewspaperDate] = useState("");
  const [newspaperLanguage, setNewspaperLanguage] =
    useState<"hindi" | "english">("hindi");

  const [paperNumber, setPaperNumber] = useState("1");
  const [newspaperTitle, setNewspaperTitle] = useState("");

  const [newspaperFile, setNewspaperFile] =
    useState<File | null>(null);

  /* =========================================================
     LOGOUT
     ========================================================= */

  async function handleLogout() {
    await signOut();
    navigate("/admin/login");
  }

  /* =========================================================
     SYLLABUS
     ========================================================= */

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

    lines.slice(1).forEach(
      (line, index) => {
        const values =
          parseCSVLine(line);

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
              values[columnIndex] ??
              "";
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
      setSyllabusError(
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.",
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
        error,
      } = await supabase
        .from("syllabi")
        .upsert(csvRows, {
          onConflict:
            "external_id",
        });

      if (error) {
        throw error;
      }

      setSyllabusMessage(
        `${csvRows.length} syllabus row${
          csvRows.length === 1
            ? ""
            : "s"
        } successfully inserted/updated.`,
      );
    } catch (err) {
      setSyllabusError(
        err instanceof Error
          ? err.message
          : "Unable to upload syllabus.",
      );
    } finally {
      setSyllabusLoading(false);
    }
  }

  /* =========================================================
     NEWSPAPER MANAGER
     ========================================================= */

  function openNewspaperManager() {
    setShowNewspaperManager(true);
    setNewspaperMessage("");
    setNewspaperError("");
    loadNewspapers();
  }

  function closeNewspaperManager() {
    if (newspaperUploading) return;

    setShowNewspaperManager(false);

    setNewspaperMessage("");
    setNewspaperError("");

    setNewspaperDate("");
    setNewspaperLanguage("hindi");
    setPaperNumber("1");
    setNewspaperTitle("");
    setNewspaperFile(null);

    if (
      newspaperFileInputRef.current
    ) {
      newspaperFileInputRef.current.value =
        "";
    }
  }

  async function loadNewspapers() {
    setNewspaperLoading(true);
    setNewspaperError("");

    try {
      const {
        data,
        error,
      } = await supabase
        .from("newspaper_papers")
        .select(
          "id,newspaper_date,language,paper_number,title,storage_path,published",
        )
        .order(
          "newspaper_date",
          {
            ascending: false,
          },
        )
        .order(
          "language",
          {
            ascending: true,
          },
        )
        .order(
          "paper_number",
          {
            ascending: true,
          },
        );

      if (error) {
        throw error;
      }

      setNewspapers(
        (data ||
          []) as NewspaperPaper[],
      );
    } catch (err) {
      console.error(
        "Load newspapers error:",
        err,
      );

      setNewspaperError(
        err instanceof Error
          ? err.message
          : "Unable to load newspapers.",
      );
    } finally {
      setNewspaperLoading(false);
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
      return;
    }

    const isPDF =
      file.type ===
        "application/pdf" ||
      file.name
        .toLowerCase()
        .endsWith(".pdf");

    if (!isPDF) {
      setNewspaperError(
        "Please select a PDF file only.",
      );

      event.target.value = "";
      setNewspaperFile(null);
      return;
    }

    setNewspaperFile(file);
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

    if (
      newspaperLanguage !==
        "hindi" &&
      newspaperLanguage !==
        "english"
    ) {
      setNewspaperError(
        "Please select a valid language.",
      );
      return;
    }

    const parsedPaperNumber =
      Number(paperNumber);

    if (
      !Number.isInteger(
        parsedPaperNumber,
      ) ||
      parsedPaperNumber < 1
    ) {
      setNewspaperError(
        "Paper number must be a positive whole number.",
      );
      return;
    }

    if (!newspaperFile) {
      setNewspaperError(
        "Please select a PDF file.",
      );
      return;
    }

    setNewspaperUploading(true);

    let uploadedPath = "";

    try {
      /*
       * Check logged-in user
       */
      const {
        data: {
          session,
        },
      } =
        await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      /*
       * Safe file name
       */
      const originalName =
        newspaperFile.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_",
          );

      const uniqueId =
        crypto.randomUUID();

      /*
       * Example:
       *
       * hindi/2026-08-30/paper-1-xxxxx.pdf
       *
       * or
       *
       * english/2026-08-30/paper-1-xxxxx.pdf
       */
      uploadedPath =
        `${newspaperLanguage}/${newspaperDate}/paper-${parsedPaperNumber}-${uniqueId}-${originalName}`;

      /*
       * Upload PDF to Storage
       */
      const {
        error: uploadError,
      } = await supabase.storage
        .from("newspapers")
        .upload(
          uploadedPath,
          newspaperFile,
          {
            contentType:
              "application/pdf",
            upsert: false,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      /*
       * Insert database record
       *
       * published = true
       *
       * So student can immediately
       * see today's/past paper.
       *
       * Future date is still hidden
       * by Edge Function because
       * it uses newspaper_date <= today.
       */
      const {
        data: insertedPaper,
        error: insertError,
      } = await supabase
        .from(
          "newspaper_papers",
        )
        .insert({
          newspaper_date:
            newspaperDate,
          language:
            newspaperLanguage,
          paper_number:
            parsedPaperNumber,
          title:
            newspaperTitle.trim() ||
            `Paper ${parsedPaperNumber}`,
          storage_path:
            uploadedPath,
          published: true,
        })
        .select()
        .single();

      if (insertError) {
        /*
         * Database insert failed.
         * Remove uploaded file so
         * storage doesn't contain orphan PDF.
         */
        await supabase.storage
          .from("newspapers")
          .remove([
            uploadedPath,
          ]);

        throw insertError;
      }

      console.log(
        "Newspaper uploaded:",
        insertedPaper,
      );

      setNewspaperMessage(
        "✅ Newspaper uploaded and published successfully.",
      );

      setNewspaperDate("");
      setNewspaperLanguage(
        "hindi",
      );
      setPaperNumber("1");
      setNewspaperTitle("");
      setNewspaperFile(null);

      if (
        newspaperFileInputRef.current
      ) {
        newspaperFileInputRef.current.value =
          "";
      }

      await loadNewspapers();
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
      setNewspaperUploading(false);
    }
  }

  async function toggleNewspaperPublished(
    paper: NewspaperPaper,
  ) {
    setNewspaperError("");
    setNewspaperMessage("");

    try {
      const {
        error,
      } = await supabase
        .from(
          "newspaper_papers",
        )
        .update({
          published:
            !paper.published,
        })
        .eq(
          "id",
          paper.id,
        );

      if (error) {
        throw error;
      }

      setNewspaperMessage(
        paper.published
          ? "Newspaper hidden successfully."
          : "Newspaper published successfully.",
      );

      await loadNewspapers();
    } catch (err) {
      console.error(
        "Publish toggle error:",
        err,
      );

      setNewspaperError(
        err instanceof Error
          ? err.message
          : "Unable to update newspaper.",
      );
    }
  }

  async function deleteNewspaper(
    paper: NewspaperPaper,
  ) {
    const confirmed =
      window.confirm(
        `Delete ${paper.language} Paper ${paper.paper_number} for ${paper.newspaper_date}?`,
      );

    if (!confirmed) {
      return;
    }

    setNewspaperError("");
    setNewspaperMessage("");

    try {
      /*
       * Delete database row first
       */
      const {
        error: deleteDbError,
      } = await supabase
        .from(
          "newspaper_papers",
        )
        .delete()
        .eq(
          "id",
          paper.id,
        );

      if (deleteDbError) {
        throw deleteDbError;
      }

      /*
       * Delete PDF from Storage
       */
      if (paper.storage_path) {
        const {
          error:
            deleteStorageError,
        } =
          await supabase.storage
            .from("newspapers")
            .remove([
              paper.storage_path,
            ]);

        if (
          deleteStorageError
        ) {
          console.error(
            "Storage delete error:",
            deleteStorageError,
          );
        }
      }

      setNewspaperMessage(
        "Newspaper deleted successfully.",
      );

      await loadNewspapers();
    } catch (err) {
      console.error(
        "Delete newspaper error:",
        err,
      );

      setNewspaperError(
        err instanceof Error
          ? err.message
          : "Unable to delete newspaper.",
      );
    }
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
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
            onClick={
              handleLogout
            }
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
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
              Newspapers
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {newspapers.length ||
                "—"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Newspaper records
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

          {/* NEWSPAPER */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">
              📰
            </div>

            <h3 className="mt-4 font-bold">
              Newspaper
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload Hindi and English newspaper PDFs with date and publish control.
            </p>

            <button
              type="button"
              onClick={
                openNewspaperManager
              }
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage Newspaper
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
              Manage student accounts and profiles.
            </p>

            <button
              type="button"
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage
            </button>
          </div>

          {/* VIDEOS */}
          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="text-3xl">
              🎥
            </div>

            <h3 className="mt-4 font-bold">
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
          NEWSPAPER MANAGER
          ===================================================== */}

      {showNewspaperManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold">
                    📰 Newspaper Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload PDF → Storage → Database automatically.
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
              <div className="p-6">

                {/* UPLOAD FORM */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">

                  <h3 className="text-lg font-bold">
                    Upload New Newspaper
                  </h3>

                  <div className="mt-5 grid gap-5 md:grid-cols-2">

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
                        onChange={(e) =>
                          setNewspaperDate(
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />

                      <p className="mt-1 text-xs text-slate-500">
                        Future date bhi upload kar sakte hain.
                      </p>
                    </div>

                    {/* LANGUAGE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Language
                      </label>

                      <select
                        value={
                          newspaperLanguage
                        }
                        onChange={(e) =>
                          setNewspaperLanguage(
                            e.target.value as
                              | "hindi"
                              | "english",
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="hindi">
                          🇮🇳 Hindi
                        </option>

                        <option value="english">
                          🇬🇧 English
                        </option>
                      </select>
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
                          paperNumber
                        }
                        onChange={(e) =>
                          setPaperNumber(
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* TITLE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Title
                      </label>

                      <input
                        type="text"
                        value={
                          newspaperTitle
                        }
                        onChange={(e) =>
                          setNewspaperTitle(
                            e.target.value,
                          )
                        }
                        placeholder="e.g. Daily Newspaper"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* PDF */}
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold">
                      Newspaper PDF
                    </label>

                    <input
                      ref={
                        newspaperFileInputRef
                      }
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={
                        handleNewspaperFile
                      }
                      className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm"
                    />

                    {newspaperFile && (
                      <p className="mt-2 text-sm font-medium text-blue-600">
                        Selected:{" "}
                        {
                          newspaperFile.name
                        }
                      </p>
                    )}
                  </div>

                  {/* UPLOAD BUTTON */}
                  <button
                    type="button"
                    onClick={
                      handleNewspaperUpload
                    }
                    disabled={
                      newspaperUploading
                    }
                    className="mt-5 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {newspaperUploading
                      ? "Uploading PDF..."
                      : "📤 Upload & Publish"}
                  </button>
                </div>

                {/* MESSAGES */}
                {newspaperError && (
                  <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ❌{" "}
                    {
                      newspaperError
                    }
                  </div>
                )}

                {newspaperMessage && (
                  <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {
                      newspaperMessage
                    }
                  </div>
                )}

                {/* LIST */}
                <div className="mt-8">

                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        Uploaded Newspapers
                      </h3>

                      <p className="text-sm text-slate-500">
                        Manage publish status and delete papers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        loadNewspapers
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Refresh
                    </button>
                  </div>

                  {newspaperLoading && (
                    <div className="rounded-2xl bg-slate-50 p-6 text-center">
                      Loading newspapers...
                    </div>
                  )}

                  {!newspaperLoading &&
                    newspapers.length ===
                      0 && (
                      <div className="rounded-2xl bg-slate-50 p-6 text-center">
                        <div className="text-4xl">
                          📰
                        </div>

                        <p className="mt-2 font-semibold">
                          No newspapers uploaded yet.
                        </p>
                      </div>
                    )}

                  {!newspaperLoading &&
                    newspapers.length >
                      0 && (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200">
                        <table className="min-w-[900px] w-full text-left text-sm">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-4 py-3">
                                Date
                              </th>

                              <th className="px-4 py-3">
                                Language
                              </th>

                              <th className="px-4 py-3">
                                Paper
                              </th>

                              <th className="px-4 py-3">
                                Title
                              </th>

                              <th className="px-4 py-3">
                                Status
                              </th>

                              <th className="px-4 py-3">
                                Actions
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {newspapers.map(
                              (paper) => (
                                <tr
                                  key={
                                    paper.id
                                  }
                                  className="border-t border-slate-200"
                                >
                                  <td className="px-4 py-4 font-medium">
                                    {
                                      paper.newspaper_date
                                    }
                                  </td>

                                  <td className="px-4 py-4">
                                    {paper.language ===
                                    "hindi"
                                      ? "🇮🇳 Hindi"
                                      : "🇬🇧 English"}
                                  </td>

                                  <td className="px-4 py-4">
                                    Paper{" "}
                                    {
                                      paper.paper_number
                                    }
                                  </td>

                                  <td className="px-4 py-4">
                                    {paper.title ||
                                      `Paper ${paper.paper_number}`}
                                  </td>

                                  <td className="px-4 py-4">
                                    {paper.published ? (
                                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                                        PUBLISHED
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                                        HIDDEN
                                      </span>
                                    )}
                                  </td>

                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleNewspaperPublished(
                                            paper,
                                          )
                                        }
                                        className={`rounded-lg px-3 py-2 text-xs font-bold text-white ${
                                          paper.published
                                            ? "bg-orange-500 hover:bg-orange-600"
                                            : "bg-green-600 hover:bg-green-700"
                                        }`}
                                      >
                                        {paper.published
                                          ? "Hide"
                                          : "Publish"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          deleteNewspaper(
                                            paper,
                                          )
                                        }
                                        className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
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
                </div>

                {/* IMPORTANT INFO */}
                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                  <h4 className="font-bold">
                    🔐 How publishing works
                  </h4>

                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li>
                      • PDF automatically uploads to the{" "}
                      <b>newspapers</b> Storage bucket.
                    </li>

                    <li>
                      • Database record automatically goes into{" "}
                      <b>newspaper_papers</b>.
                    </li>

                    <li>
                      • Today's and previous published papers are visible to students.
                    </li>

                    <li>
                      • Future-date papers remain hidden from students until that date.
                    </li>

                    <li>
                      • Hide button can temporarily remove a paper from the student page.
                    </li>
                  </ul>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end border-t px-6 py-4">
                <button
                  type="button"
                  onClick={
                    closeNewspaperManager
                  }
                  disabled={
                    newspaperUploading
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

      {/* =====================================================
          SYLLABUS MANAGER
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
                    Upload CSV to insert new syllabus or update existing syllabus.
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
                    Use the standard PadhAI syllabus CSV format.
                  </p>

                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept=".csv,text/csv"
                    onChange={
                      handleCSVFile
                    }
                    className="mt-5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700"
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
                          rows ready for upload.
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
                        className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
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
                                    {row.class_name ||
                                      "—"}
                                  </td>

                                  <td className="px-4 py-3">
                                    {row.board ||
                                      "—"}
                                  </td>

                                  <td className="px-4 py-3">
                                    {row.exam ||
                                      "—"}
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
                                    {row.topic_name ||
                                      "—"}
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
                        Showing first 100 rows. All{" "}
                        {
                          csvRows.length
                        }{" "}
                        rows will be uploaded.
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-6 rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm font-semibold">
                    Required CSV columns
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-300">
                    external_id, category, class_name, board, exam, subject, chapter_name, topic_name, key_points, order_no, is_active
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Existing external_id = update | New external_id = insert
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
