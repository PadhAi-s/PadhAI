import { useEffect, useRef, useState } from "react";
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

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
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
  published: boolean;
}

const emptyMCQ = (): MCQ => ({
  question: "",
  options: ["", "", "", ""],
  answer: "",
  explanation: "",
});

const createEmptyAffair = (
  date: string,
  serialNo: number,
): CurrentAffair => ({
  affair_date: date,
  serial_no: serialNo,
  title: "",
  why_in_news: "",
  key_facts: "",
  exam_point: "",
  static_gk: "",
  mcqs: [],
  published: false,
});

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  // =========================================================
  // SYLLABUS
  // =========================================================

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSyllabusManager, setShowSyllabusManager] =
    useState(false);

  const [csvRows, setCsvRows] = useState<SyllabusRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [syllabusLoading, setSyllabusLoading] = useState(false);
  const [syllabusMessage, setSyllabusMessage] = useState("");
  const [syllabusError, setSyllabusError] = useState("");

  // =========================================================
  // CURRENT AFFAIRS
  // =========================================================

  const [showCurrentAffairsManager, setShowCurrentAffairsManager] =
    useState(false);

  const [affairDate, setAffairDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const [affairs, setAffairs] = useState<CurrentAffair[]>([]);

  const [currentAffairsLoading, setCurrentAffairsLoading] =
    useState(false);

  const [currentAffairsSaving, setCurrentAffairsSaving] =
    useState(false);

  const [currentAffairsMessage, setCurrentAffairsMessage] =
    useState("");

  const [currentAffairsError, setCurrentAffairsError] =
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

    return ![
      "false",
      "0",
      "no",
      "inactive",
    ].includes(normalized);
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
        throw new Error(
          `Missing CSV column: ${required}`,
        );
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
      const category = row.category
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

      const parsedOrder = Number(
        row.order_no || "1",
      );

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
        chapter_name:
          row.chapter_name.trim(),
        topic_name: normalizeValue(
          row.topic_name,
        ),
        key_points: normalizeValue(
          row.key_points,
        ),
        order_no: parsedOrder,
        is_active: parseBoolean(
          row.is_active,
        ),
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
    setSyllabusError("");
    setSyllabusMessage("");
    setCsvRows([]);

    const file = event.target.files?.[0];

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
      const text = await file.text();
      const rows = parseCSV(text);

      setCsvRows(rows);

      setSyllabusMessage(
        `${rows.length} syllabus row${
          rows.length === 1 ? "" : "s"
        } loaded successfully.`,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to read CSV file.";

      setSyllabusError(message);
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
      const { error: upsertError } =
        await supabase
          .from("syllabi")
          .upsert(csvRows, {
            onConflict: "external_id",
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
      const message =
        err instanceof Error
          ? err.message
          : "Unable to upload syllabus.";

      setSyllabusError(message);
    } finally {
      setSyllabusLoading(false);
    }
  }

  // =========================================================
  // CURRENT AFFAIRS HELPERS
  // =========================================================

  function clearCurrentAffairsMessages() {
    setCurrentAffairsMessage("");
    setCurrentAffairsError("");
  }

  function openCurrentAffairsManager() {
    clearCurrentAffairsMessages();
    setShowCurrentAffairsManager(true);
    loadCurrentAffairs(affairDate);
  }

  function closeCurrentAffairsManager() {
    if (currentAffairsSaving) return;

    setShowCurrentAffairsManager(false);
    setAffairs([]);
    clearCurrentAffairsMessages();
  }

  async function loadCurrentAffairs(
    date: string,
  ) {
    setCurrentAffairsLoading(true);
    clearCurrentAffairsMessages();

    try {
      const {
        data,
        error,
      } = await supabase
        .from("current_affairs")
        .select(
          `
          id,
          affair_date,
          serial_no,
          title,
          why_in_news,
          key_facts,
          exam_point,
          static_gk,
          mcqs,
          published
          `,
        )
        .eq("affair_date", date)
        .order("serial_no", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      const loaded =
        (data ?? []).map(
          (item) => ({
            id: item.id,
            affair_date:
              item.affair_date,
            serial_no:
              Number(item.serial_no),
            title:
              item.title ?? "",
            why_in_news:
              item.why_in_news ?? "",
            key_facts:
              item.key_facts ?? "",
            exam_point:
              item.exam_point ?? "",
            static_gk:
              item.static_gk ?? "",
            mcqs: Array.isArray(item.mcqs)
              ? item.mcqs
              : [],
            published:
              Boolean(item.published),
          }),
        );

      const normalized: CurrentAffair[] =
        [];

      for (let i = 1; i <= 10; i++) {
        const existing =
          loaded.find(
            (item) =>
              item.serial_no === i,
          );

        normalized.push(
          existing ??
            createEmptyAffair(
              date,
              i,
            ),
        );
      }

      setAffairs(normalized);
    } catch (err) {
      console.error(
        "Current affairs loading error:",
        err,
      );

      setCurrentAffairsError(
        err instanceof Error
          ? err.message
          : "Current affairs load nahi hua.",
      );

      setAffairs(
        Array.from(
          { length: 10 },
          (_, index) =>
            createEmptyAffair(
              date,
              index + 1,
            ),
        ),
      );
    } finally {
      setCurrentAffairsLoading(false);
    }
  }

  function handleAffairDateChange(
    date: string,
  ) {
    setAffairDate(date);
    loadCurrentAffairs(date);
  }

  function updateAffair(
    index: number,
    field: keyof CurrentAffair,
    value: string | boolean,
  ) {
    setAffairs((previous) =>
      previous.map((affair, affairIndex) =>
        affairIndex === index
          ? {
              ...affair,
              [field]: value,
            }
          : affair,
      ),
    );
  }

  function addMCQ(affairIndex: number) {
    setAffairs((previous) =>
      previous.map(
        (affair, index) =>
          index === affairIndex
            ? {
                ...affair,
                mcqs: [
                  ...affair.mcqs,
                  emptyMCQ(),
                ],
              }
            : affair,
      ),
    );
  }

  function removeMCQ(
    affairIndex: number,
    mcqIndex: number,
  ) {
    setAffairs((previous) =>
      previous.map(
        (affair, index) =>
          index === affairIndex
            ? {
                ...affair,
                mcqs: affair.mcqs.filter(
                  (_, index2) =>
                    index2 !== mcqIndex,
                ),
              }
            : affair,
      ),
    );
  }

  function updateMCQ(
    affairIndex: number,
    mcqIndex: number,
    field: keyof MCQ,
    value: string | string[],
  ) {
    setAffairs((previous) =>
      previous.map(
        (affair, index) => {
          if (
            index !== affairIndex
          ) {
            return affair;
          }

          return {
            ...affair,
            mcqs: affair.mcqs.map(
              (mcq, index2) =>
                index2 === mcqIndex
                  ? {
                      ...mcq,
                      [field]:
                        value,
                    }
                  : mcq,
            ),
          };
        },
      ),
    );
  }

  function updateMCQOption(
    affairIndex: number,
    mcqIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setAffairs((previous) =>
      previous.map(
        (affair, index) => {
          if (
            index !== affairIndex
          ) {
            return affair;
          }

          return {
            ...affair,
            mcqs: affair.mcqs.map(
              (mcq, index2) => {
                if (
                  index2 !==
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
          };
        },
      ),
    );
  }

  function validateAffairs(): string | null {
    const nonEmptyAffairs =
      affairs.filter(
        (affair) =>
          affair.title.trim() !== "",
      );

    if (!nonEmptyAffairs.length) {
      return "Kam se kam 1 current affair enter karo.";
    }

    for (const affair of nonEmptyAffairs) {
      if (!affair.title.trim()) {
        return `Top ${affair.serial_no}: title required hai.`;
      }

      for (let i = 0; i < affair.mcqs.length; i++) {
        const mcq =
          affair.mcqs[i];

        if (!mcq.question.trim()) {
          return `Top ${affair.serial_no}, MCQ ${i + 1}: question required hai.`;
        }

        if (
          mcq.options.some(
            (option) =>
              !option.trim(),
          )
        ) {
          return `Top ${affair.serial_no}, MCQ ${i + 1}: all 4 options required hain.`;
        }

        if (!mcq.answer.trim()) {
          return `Top ${affair.serial_no}, MCQ ${i + 1}: answer required hai.`;
        }
      }
    }

    return null;
  }

  async function saveCurrentAffairs(
    publish: boolean,
  ) {
    clearCurrentAffairsMessages();

    const validationError =
      validateAffairs();

    if (validationError) {
      setCurrentAffairsError(
        validationError,
      );
      return;
    }

    setCurrentAffairsSaving(true);

    try {
      const rows = affairs
        .filter(
          (affair) =>
            affair.title.trim() !== "",
        )
        .map((affair) => ({
          affair_date:
            affairDate,
          serial_no:
            affair.serial_no,
          title:
            affair.title.trim(),
          why_in_news:
            affair.why_in_news.trim() ||
            null,
          key_facts:
            affair.key_facts.trim() ||
            null,
          exam_point:
            affair.exam_point.trim() ||
            null,
          static_gk:
            affair.static_gk.trim() ||
            null,
          mcqs: affair.mcqs,
          published: publish,
          updated_at:
            new Date().toISOString(),
        }));

      const {
        error,
      } = await supabase
        .from("current_affairs")
        .upsert(rows, {
          onConflict:
            "affair_date,serial_no",
        });

      if (error) {
        throw error;
      }

      setAffairs((previous) =>
        previous.map(
          (affair) => ({
            ...affair,
            published:
              publish
                ? true
                : affair.published,
          }),
        ),
      );

      setCurrentAffairsMessage(
        publish
          ? `${rows.length} current affair${
              rows.length === 1
                ? ""
                : "s"
            } successfully published.`
          : `${rows.length} current affair${
              rows.length === 1
                ? ""
                : "s"
            } successfully saved as draft.`,
      );
    } catch (err) {
      console.error(
        "Current affairs save error:",
        err,
      );

      setCurrentAffairsError(
        err instanceof Error
          ? err.message
          : "Current affairs save nahi hua.",
      );
    } finally {
      setCurrentAffairsSaving(false);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
          ===================================================== */}

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

        {/* Welcome */}

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
              {csvRows.length || "—"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              CSV rows loaded
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Affairs
            </p>

            <p className="mt-2 text-3xl font-bold">
              10
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Daily Top 10
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

          {/* Syllabus */}

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
              className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Manage Syllabus
            </button>

          </div>

          {/* Current Affairs */}

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">

            <div className="text-3xl">
              📰
            </div>

            <h3 className="mt-4 font-bold">
              Current Affairs
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Daily Top 10 current affairs,
              facts and MCQs publish karo.
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

          {/* Students */}

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

          {/* Videos */}

          <div className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">

            <div className="text-3xl">
              🎥
            </div>

            <h3 className="mt-4 font-bold">
              Videos
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage educational video
              content.
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
          SYLLABUS MODAL
          ===================================================== */}

      {showSyllabusManager && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">

          <div className="flex min-h-full items-center justify-center">

            <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold">
                    📚 Syllabus Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Upload CSV to insert new
                    syllabus or update existing
                    syllabus.
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

              {/* Body */}

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
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={
                      handleCSVFile
                    }
                    className="mt-5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white"
                  />

                  {fileName && (
                    <p className="mt-3 text-sm font-medium text-blue-600">
                      Selected: {fileName}
                    </p>
                  )}

                </div>

                {syllabusError && (
                  <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    ❌ {syllabusError}
                  </div>
                )}

                {syllabusMessage && (
                  <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    ✅ {syllabusMessage}
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
                          {csvRows.length} rows
                          ready for upload.
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

                    <div className="max-h-[420px] overflow-auto rounded-2xl border">

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
                            .slice(0, 100)
                            .map((row) => (
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
                            ))}

                        </tbody>

                      </table>

                    </div>

                    {csvRows.length > 100 && (
                      <p className="mt-2 text-xs text-slate-500">
                        Showing first 100 rows.
                        All{" "}
                        {csvRows.length}{" "}
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
                    external_id, category,
                    class_name, board, exam,
                    subject, chapter_name,
                    topic_name, key_points,
                    order_no, is_active
                  </p>

                  <p className="mt-3 text-xs text-slate-400">
                    Existing external_id =
                    update | New
                    external_id = insert
                  </p>

                </div>

              </div>

              {/* Footer */}

              <div className="flex justify-end border-t px-6 py-4">

                <button
                  type="button"
                  onClick={
                    closeSyllabusManager
                  }
                  disabled={
                    syllabusLoading
                  }
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-5">

          <div className="mx-auto w-full max-w-7xl rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 rounded-t-3xl border-b bg-white px-5 py-5 sm:px-7">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-xl font-bold sm:text-2xl">
                    📰 Current Affairs Manager
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Daily Top 10 Current Affairs
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeCurrentAffairsManager
                  }
                  disabled={
                    currentAffairsSaving
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200 disabled:opacity-50"
                >
                  ×
                </button>

              </div>

              {/* Date */}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">

                <div>

                  <label className="mb-1 block text-sm font-semibold">
                    Affair Date
                  </label>

                  <input
                    type="date"
                    value={affairDate}
                    onChange={(event) =>
                      handleAffairDateChange(
                        event.target.value,
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadCurrentAffairs(
                      affairDate,
                    )
                  }
                  disabled={
                    currentAffairsLoading ||
                    currentAffairsSaving
                  }
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  🔄 Reload
                </button>

              </div>

            </div>

            {/* Messages */}

            <div className="px-5 sm:px-7">

              {currentAffairsError && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  ❌ {currentAffairsError}
                </div>
              )}

              {currentAffairsMessage && (
                <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  ✅ {currentAffairsMessage}
                </div>
              )}

            </div>

            {/* Loading */}

            {currentAffairsLoading ? (
              <div className="p-10 text-center">

                <div className="text-4xl">
                  📰
                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Current affairs loading...
                </p>

              </div>
            ) : (
              <div className="space-y-6 p-5 sm:p-7">

                {affairs.map(
                  (affair, affairIndex) => (
                    <div
                      key={
                        affair.serial_no
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >

                      {/* Affair Header */}

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                            {
                              affair.serial_no
                            }
                          </span>

                          <div>

                            <h3 className="font-bold">
                              Top{" "}
                              {
                                affair.serial_no
                              }
                            </h3>

                            <p className="text-xs text-slate-500">
                              Current Affair
                            </p>

                          </div>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            affair.published
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {affair.published
                            ? "PUBLISHED"
                            : "DRAFT"}
                        </span>

                      </div>

                      {/* Title */}

                      <div className="mt-5">

                        <label className="mb-1 block text-sm font-semibold">
                          Title *
                        </label>

                        <input
                          type="text"
                          value={
                            affair.title
                          }
                          onChange={(event) =>
                            updateAffair(
                              affairIndex,
                              "title",
                              event.target
                                .value,
                            )
                          }
                          placeholder="Example: RBI announces new FCNR(B) rules"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                      </div>

                      {/* Why in News */}

                      <div className="mt-4">

                        <label className="mb-1 block text-sm font-semibold">
                          Why in News
                        </label>

                        <textarea
                          value={
                            affair.why_in_news
                          }
                          onChange={(event) =>
                            updateAffair(
                              affairIndex,
                              "why_in_news",
                              event.target
                                .value,
                            )
                          }
                          rows={3}
                          placeholder="Why is this news important?"
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                      </div>

                      {/* Key Facts */}

                      <div className="mt-4">

                        <label className="mb-1 block text-sm font-semibold">
                          Key Facts
                        </label>

                        <textarea
                          value={
                            affair.key_facts
                          }
                          onChange={(event) =>
                            updateAffair(
                              affairIndex,
                              "key_facts",
                              event.target
                                .value,
                            )
                          }
                          rows={4}
                          placeholder={"• Important fact 1\n• Important fact 2\n• Important fact 3"}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                        />

                      </div>

                      {/* Exam Point + Static GK */}

                      <div className="mt-4 grid gap-4 md:grid-cols-2">

                        <div>

                          <label className="mb-1 block text-sm font-semibold">
                            🎯 Exam Point
                          </label>

                          <textarea
                            value={
                              affair.exam_point
                            }
                            onChange={(
                              event,
                            ) =>
                              updateAffair(
                                affairIndex,
                                "exam_point",
                                event
                                  .target
                                  .value,
                              )
                            }
                            rows={4}
                            placeholder="What should an aspirant remember?"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />

                        </div>

                        <div>

                          <label className="mb-1 block text-sm font-semibold">
                            📚 Static GK
                          </label>

                          <textarea
                            value={
                              affair.static_gk
                            }
                            onChange={(
                              event,
                            ) =>
                              updateAffair(
                                affairIndex,
                                "static_gk",
                                event
                                  .target
                                  .value,
                              )
                            }
                            rows={4}
                            placeholder="Related static GK"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                          />

                        </div>

                      </div>

                      {/* MCQs */}

                      <div className="mt-6 rounded-2xl border border-blue-100 bg-white p-4">

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <div>

                            <h4 className="font-bold">
                              ❓ MCQs
                            </h4>

                            <p className="text-xs text-slate-500">
                              Optional exam
                              questions
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              addMCQ(
                                affairIndex,
                              )
                            }
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            + Add MCQ
                          </button>

                        </div>

                        <div className="mt-4 space-y-5">

                          {affair.mcqs.map(
                            (
                              mcq,
                              mcqIndex,
                            ) => (
                              <div
                                key={
                                  mcqIndex
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                              >

                                <div className="mb-3 flex items-center justify-between">

                                  <p className="font-semibold">
                                    MCQ{" "}
                                    {
                                      mcqIndex +
                                      1
                                    }
                                  </p>

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

                                </div>

                                <textarea
                                  value={
                                    mcq.question
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateMCQ(
                                      affairIndex,
                                      mcqIndex,
                                      "question",
                                      event
                                        .target
                                        .value,
                                    )
                                  }
                                  rows={2}
                                  placeholder="Question"
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                />

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">

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
                                          event,
                                        ) =>
                                          updateMCQOption(
                                            affairIndex,
                                            mcqIndex,
                                            optionIndex,
                                            event
                                              .target
                                              .value,
                                          )
                                        }
                                        placeholder={`Option ${String.fromCharCode(
                                          65 +
                                            optionIndex,
                                        )}`}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                      />
                                    ),
                                  )}

                                </div>

                                <div className="mt-3 grid gap-3 md:grid-cols-2">

                                  <input
                                    type="text"
                                    value={
                                      mcq.answer
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateMCQ(
                                        affairIndex,
                                        mcqIndex,
                                        "answer",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder="Correct answer — e.g. A"
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                  />

                                  <input
                                    type="text"
                                    value={
                                      mcq.explanation
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateMCQ(
                                        affairIndex,
                                        mcqIndex,
                                        "explanation",
                                        event
                                          .target
                                          .value,
                                      )
                                    }
                                    placeholder="Explanation"
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                                  />

                                </div>

                              </div>
                            ),
                          )}

                          {affair.mcqs
                            .length ===
                            0 && (
                            <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                              Abhi koi MCQ
                              nahi hai.
                            </p>
                          )}

                        </div>

                      </div>

                    </div>
                  ),
                )}

              </div>
            )}

            {/* =================================================
                FOOTER ACTIONS
                ================================================= */}

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 rounded-b-3xl border-t bg-white p-5 sm:flex-row sm:justify-end sm:px-7">

              <button
                type="button"
                onClick={
                  closeCurrentAffairsManager
                }
                disabled={
                  currentAffairsSaving
                }
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  saveCurrentAffairs(
                    false,
                  )
                }
                disabled={
                  currentAffairsSaving ||
                  currentAffairsLoading
                }
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {currentAffairsSaving
                  ? "Saving..."
                  : "💾 Save Draft"}
              </button>

              <button
                type="button"
                onClick={() =>
                  saveCurrentAffairs(
                    true,
                  )
                }
                disabled={
                  currentAffairsSaving ||
                  currentAffairsLoading
                }
                className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {currentAffairsSaving
                  ? "Publishing..."
                  : "🚀 Publish All"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
