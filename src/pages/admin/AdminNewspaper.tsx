import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  Loader2,
  Languages,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

type Language = "hindi" | "english";

type ProcessingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface CurrentAffair {
  affair_date: string;
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  mcqs: MCQ[];
}

interface NewspaperPaper {
  id: string;
  newspaper_date: string;
  language: Language;
  paper_number: number;
  title: string | null;
  storage_path: string;
  published: boolean;

  output_language: Language;

  processing_status: ProcessingStatus;
  processing_error: string | null;
  extracted_text: string | null;
  current_affairs: CurrentAffair[] | null;
  processed_at: string | null;

  created_at: string;
  updated_at?: string | null;
}

const STORAGE_BUCKET = "newspapers";

const LANGUAGE_LABEL: Record<Language, string> = {
  hindi: "Hindi",
  english: "English",
};

const STATUS_LABEL: Record<ProcessingStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

function getStatusIcon(status: ProcessingStatus) {
  switch (status) {
    case "processing":
      return <Loader2 className="h-4 w-4 animate-spin" />;

    case "completed":
      return <CheckCircle2 className="h-4 w-4" />;

    case "failed":
      return <XCircle className="h-4 w-4" />;

    default:
      return <Clock3 className="h-4 w-4" />;
  }
}

function getStatusClass(status: ProcessingStatus) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";

    case "failed":
      return "bg-red-100 text-red-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function AdminNewspaper() {
  const [papers, setPapers] = useState<NewspaperPaper[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [sourceLanguage, setSourceLanguage] =
    useState<Language>("hindi");

  const [outputLanguage, setOutputLanguage] =
    useState<Language>("english");

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPaper, setSelectedPaper] =
    useState<NewspaperPaper | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadPapers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("newspaper_papers")
        .select(`
          id,
          newspaper_date,
          language,
          paper_number,
          title,
          storage_path,
          published,
          output_language,
          processing_status,
          processing_error,
          extracted_text,
          current_affairs,
          processed_at,
          created_at,
          updated_at
        `)
        .order("newspaper_date", {
          ascending: false,
        })
        .order("language", {
          ascending: true,
        })
        .order("paper_number", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setPapers((data || []) as NewspaperPaper[]);
    } catch (err: any) {
      setError(
        err?.message ||
          "Newspapers load karne me error aa gaya."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers();
  }, []);

  const groupedPapers = useMemo(() => {
    const groups: Record<
      string,
      {
        hindi: NewspaperPaper[];
        english: NewspaperPaper[];
      }
    > = {};

    for (const paper of papers) {
      if (!groups[paper.newspaper_date]) {
        groups[paper.newspaper_date] = {
          hindi: [],
          english: [],
        };
      }

      groups[paper.newspaper_date][paper.language].push(paper);
    }

    return groups;
  }, [papers]);

  const detectPaperNumber = (
    fileName: string,
    fallback: number
  ) => {
    const match = fileName.match(
      /(?:paper|page)\s*[-_ ]?\s*(\d+)/i
    );

    if (match) {
      return Number(match[1]);
    }

    const numberMatch = fileName.match(
      /(?:^|[-_ ])(\d+)(?:[-_ ]|\.pdf$)/i
    );

    if (numberMatch) {
      return Number(numberMatch[1]);
    }

    return fallback;
  };

  const processPaper = async (paperId: string) => {
    try {
      const { error } = await supabase.functions.invoke(
        "process-newspaper-paper",
        {
          body: {
            paper_id: paperId,
          },
        }
      );

      if (error) {
        throw error;
      }

      return true;
    } catch (err) {
      console.error(
        "process-newspaper-paper error:",
        err
      );

      return false;
    }
  };

  const uploadNewspapers = async () => {
    if (!selectedDate) {
      setError("Newspaper date select karo.");
      return;
    }

    if (!files.length) {
      setError("Kam se kam ek PDF select karo.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const languageFolder =
        sourceLanguage.toUpperCase();

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        if (
          file.type !== "application/pdf" &&
          !file.name.toLowerCase().endsWith(".pdf")
        ) {
          throw new Error(
            `${file.name} PDF file nahi hai.`
          );
        }

        const paperNumber = detectPaperNumber(
          file.name,
          index + 1
        );

        const storagePath =
          `${selectedDate}/${languageFolder}/${file.name}`;

        /*
         * 1. Upload / replace PDF
         */
        const { error: uploadError } =
          await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
              upsert: true,
              contentType: "application/pdf",
            });

        if (uploadError) {
          throw uploadError;
        }

        /*
         * 2. Check existing DB record
         */
        const { data: existingPaper, error: existingError } =
          await supabase
            .from("newspaper_papers")
            .select("id")
            .eq("newspaper_date", selectedDate)
            .eq("language", sourceLanguage)
            .eq("paper_number", paperNumber)
            .maybeSingle();

        if (existingError) {
          throw existingError;
        }

        let paperId = "";

        /*
         * 3. Update existing paper
         */
        if (existingPaper?.id) {
          const { data: updatedPaper, error: updateError } =
            await supabase
              .from("newspaper_papers")
              .update({
                title: file.name.replace(/\.pdf$/i, ""),
                storage_path: storagePath,

                output_language: outputLanguage,

                processing_status: "pending",
                processing_error: null,
                extracted_text: null,
                current_affairs: null,
                processed_at: null,

                updated_at: new Date().toISOString(),
              })
              .eq("id", existingPaper.id)
              .select("id")
              .single();

          if (updateError) {
            throw updateError;
          }

          paperId = updatedPaper.id;
        } else {
          /*
           * 4. Create new paper
           */
          const { data: newPaper, error: insertError } =
            await supabase
              .from("newspaper_papers")
              .insert({
                newspaper_date: selectedDate,
                language: sourceLanguage,
                output_language: outputLanguage,

                paper_number: paperNumber,

                title: file.name.replace(
                  /\.pdf$/i,
                  ""
                ),

                storage_path: storagePath,

                published: false,

                processing_status: "pending",
                processing_error: null,
                extracted_text: null,
                current_affairs: null,
                processed_at: null,
              })
              .select("id")
              .single();

          if (insertError) {
            throw insertError;
          }

          paperId = newPaper.id;
        }

        /*
         * 5. Start AI/OCR processing
         */
        await processPaper(paperId);
      }

      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadPapers();
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Newspaper upload/process karte waqt error aa gaya."
      );
    } finally {
      setUploading(false);
    }
  };

  const retryProcessing = async (
    paper: NewspaperPaper
  ) => {
    try {
      setError("");

      await supabase
        .from("newspaper_papers")
        .update({
          processing_status: "pending",
          processing_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paper.id);

      await processPaper(paper.id);

      await loadPapers();
    } catch (err: any) {
      setError(
        err?.message ||
          "Processing retry nahi ho paya."
      );
    }
  };

  const togglePublish = async (
    paper: NewspaperPaper
  ) => {
    if (
      !paper.published &&
      paper.processing_status !== "completed"
    ) {
      setError(
        "Newspaper ko publish karne se pehle processing complete honi chahiye."
      );
      return;
    }

    try {
      setError("");

      const { error } = await supabase
        .from("newspaper_papers")
        .update({
          published: !paper.published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paper.id);

      if (error) {
        throw error;
      }

      await loadPapers();
    } catch (err: any) {
      setError(
        err?.message ||
          "Publish status update nahi ho paya."
      );
    }
  };

  const deletePaper = async (
    paper: NewspaperPaper
  ) => {
    const confirmed = window.confirm(
      `Kya aap "${paper.title || "Newspaper"}" delete karna chahte hain?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const { error: storageError } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([paper.storage_path]);

      if (storageError) {
        console.warn(
          "Storage delete warning:",
          storageError
        );
      }

      const { error: dbError } = await supabase
        .from("newspaper_papers")
        .delete()
        .eq("id", paper.id);

      if (dbError) {
        throw dbError;
      }

      if (selectedPaper?.id === paper.id) {
        setSelectedPaper(null);
      }

      await loadPapers();
    } catch (err: any) {
      setError(
        err?.message ||
          "Newspaper delete nahi ho paya."
      );
    }
  };

  const openPdf = async (
    paper: NewspaperPaper
  ) => {
    try {
      const { data, error } =
        await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(
            paper.storage_path,
            60 * 60
          );

      if (error) {
        throw error;
      }

      if (data?.signedUrl) {
        window.open(
          data.signedUrl,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "PDF open nahi ho paya."
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Newspaper
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Upload newspaper PDFs and automatically
          convert them into translated current affairs.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* UPLOAD CARD */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Newspaper Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
          </div>

          {/* SOURCE LANGUAGE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Newspaper Language
            </label>

            <select
              value={sourceLanguage}
              onChange={(e) =>
                setSourceLanguage(
                  e.target.value as Language
                )
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
            >
              <option value="hindi">
                Hindi
              </option>

              <option value="english">
                English
              </option>
            </select>
          </div>

          {/* OUTPUT LANGUAGE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Output Language
            </label>

            <select
              value={outputLanguage}
              onChange={(e) =>
                setOutputLanguage(
                  e.target.value as Language
                )
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
            >
              <option value="english">
                English
              </option>

              <option value="hindi">
                Hindi
              </option>
            </select>
          </div>

          {/* FILE */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Newspaper PDF
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={(e) =>
                setFiles(
                  Array.from(
                    e.target.files || []
                  )
                )
              }
              className="block w-full text-sm"
            />
          </div>
        </div>

        {/* TRANSLATION INFO */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
          <Languages className="h-4 w-4" />

          <span>
            {LANGUAGE_LABEL[sourceLanguage]}
            {" → "}
            {LANGUAGE_LABEL[outputLanguage]}
          </span>
        </div>

        {/* SELECTED FILES */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">
              Selected files: {files.length}
            </p>

            {files.map((file) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-2 rounded-lg border p-2 text-sm"
              >
                <FileText className="h-4 w-4" />

                <span className="truncate">
                  {file.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* UPLOAD BUTTON */}
        <button
          type="button"
          disabled={
            uploading ||
            !selectedDate ||
            files.length === 0
          }
          onClick={uploadNewspapers}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading & Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload & Process
            </>
          )}
        </button>
      </div>

      {/* NEWSPAPER LIST */}
      {loading ? (
        <div className="flex items-center gap-2 py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading newspapers...
        </div>
      ) : Object.keys(groupedPapers).length === 0 ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          No newspapers uploaded yet.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPapers).map(
            ([date, languageGroups]) => (
              <div
                key={date}
                className="rounded-xl border bg-card p-5"
              >
                <h2 className="mb-5 text-lg font-semibold">
                  {formatDate(date)}
                </h2>

                {/* HINDI */}
                <LanguageSection
                  title="Hindi Newspaper"
                  papers={languageGroups.hindi}
                  onOpen={openPdf}
                  onPublish={togglePublish}
                  onDelete={deletePaper}
                  onRetry={retryProcessing}
                  onView={setSelectedPaper}
                />

                {/* ENGLISH */}
                <LanguageSection
                  title="English Newspaper"
                  papers={languageGroups.english}
                  onOpen={openPdf}
                  onPublish={togglePublish}
                  onDelete={deletePaper}
                  onRetry={retryProcessing}
                  onView={setSelectedPaper}
                />
              </div>
            )
          )}
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedPaper && (
        <PaperDetailsModal
          paper={selectedPaper}
          onClose={() =>
            setSelectedPaper(null)
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   LANGUAGE SECTION
========================================================= */

interface LanguageSectionProps {
  title: string;
  papers: NewspaperPaper[];
  onOpen: (paper: NewspaperPaper) => void;
  onPublish: (paper: NewspaperPaper) => void;
  onDelete: (paper: NewspaperPaper) => void;
  onRetry: (paper: NewspaperPaper) => void;
  onView: (paper: NewspaperPaper) => void;
}

function LanguageSection({
  title,
  papers,
  onOpen,
  onPublish,
  onDelete,
  onRetry,
  onView,
}: LanguageSectionProps) {
  if (!papers.length) {
    return null;
  }

  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-3 font-medium">
        {title}
      </h3>

      <div className="space-y-3">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="rounded-lg border p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    Paper {paper.paper_number}
                  </span>

                  {paper.title && (
                    <span className="truncate text-sm text-muted-foreground">
                      {paper.title}
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${getStatusClass(
                      paper.processing_status
                    )}`}
                  >
                    {getStatusIcon(
                      paper.processing_status
                    )}

                    {
                      STATUS_LABEL[
                        paper.processing_status
                      ]
                    }
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>
                    Source:{" "}
                    {LANGUAGE_LABEL[
                      paper.language
                    ]}
                  </span>

                  <span>
                    Output:{" "}
                    {LANGUAGE_LABEL[
                      paper.output_language
                    ]}
                  </span>

                  <span>
                    {paper.published
                      ? "Published"
                      : "Unpublished"}
                  </span>
                </div>

                {paper.processing_error && (
                  <div className="mt-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                    {paper.processing_error}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpen(paper)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  PDF
                </button>

                {paper.processing_status ===
                  "completed" && (
                  <button
                    type="button"
                    onClick={() => onView(paper)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </button>
                )}

                {paper.processing_status ===
                  "failed" && (
                  <button
                    type="button"
                    onClick={() => onRetry(paper)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                )}

                <button
                  type="button"
                  disabled={
                    !paper.published &&
                    paper.processing_status !==
                      "completed"
                  }
                  onClick={() => onPublish(paper)}
                  className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {paper.published ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Publish
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(paper)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   DETAILS MODAL
========================================================= */

function PaperDetailsModal({
  paper,
  onClose,
}: {
  paper: NewspaperPaper;
  onClose: () => void;
}) {
  const affairs = paper.current_affairs || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
      <div className="mx-auto max-w-5xl rounded-xl bg-background p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {paper.title ||
                `Paper ${paper.paper_number}`}
            </h2>

            <p className="text-sm text-muted-foreground">
              {LANGUAGE_LABEL[paper.language]}
              {" → "}
              {
                LANGUAGE_LABEL[
                  paper.output_language
                ]
              }
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        {affairs.length === 0 ? (
          <p className="text-muted-foreground">
            No current affairs generated.
          </p>
        ) : (
          <div className="space-y-6">
            {affairs.map((affair, index) => (
              <div
                key={`${paper.id}-${index}`}
                className="rounded-xl border p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    #{affair.serial_no}
                  </span>

                  <h3 className="text-lg font-semibold">
                    {affair.title}
                  </h3>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold">
                      Why in News
                    </h4>

                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {affair.why_in_news}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      Key Facts
                    </h4>

                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {affair.key_facts}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      Exam Point
                    </h4>

                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {affair.exam_point}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      Static GK
                    </h4>

                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {affair.static_gk}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      MCQs
                    </h4>

                    <div className="mt-3 space-y-4">
                      {affair.mcqs?.map(
                        (mcq, mcqIndex) => (
                          <div
                            key={mcqIndex}
                            className="rounded-lg bg-muted p-4"
                          >
                            <p className="font-medium">
                              Q{mcqIndex + 1}.{" "}
                              {mcq.question}
                            </p>

                            <div className="mt-2 space-y-1">
                              {mcq.options.map(
                                (
                                  option,
                                  optionIndex
                                ) => (
                                  <div
                                    key={
                                      optionIndex
                                    }
                                  >
                                    {
                                      String.fromCharCode(
                                        65 +
                                          optionIndex
                                      )
                                    }
                                    . {option}
                                  </div>
                                )
                              )}
                            </div>

                            <p className="mt-2 font-medium">
                              Answer:{" "}
                              {mcq.answer}
                            </p>

                            <p className="mt-1 text-muted-foreground">
                              {mcq.explanation}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {paper.extracted_text && (
          <details className="mt-6">
            <summary className="cursor-pointer font-medium">
              View Extracted Newspaper Text
            </summary>

            <pre className="mt-3 max-h-[500px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-xs">
              {paper.extracted_text}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
