import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Language = "hindi" | "english";

type NewspaperPaper = {
  id: string;
  newspaper_date: string;
  language: Language;
  paper_number: number;
  title: string | null;
  storage_path: string;
  published: boolean;
  created_at: string;
};

const BUCKET_NAME = "newspapers";

export function AdminNewspaper() {
  const [papers, setPapers] = useState<NewspaperPaper[]>([]);

  const [selectedDate, setSelectedDate] = useState(
    getTodayDate(),
  );

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>("hindi");

  const [selectedFiles, setSelectedFiles] = useState<File[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [publishingId, setPublishingId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPapers();
  }, []);

  function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1,
    ).padStart(2, "0");
    const day = String(
      now.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function formatDate(date: string) {
    return new Date(
      `${date}T00:00:00`,
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function isFutureDate(date: string) {
    return date > getTodayDate();
  }

  function getLanguageFolder(language: Language) {
    return language === "hindi"
      ? "HINDI"
      : "ENGLISH";
  }

  /*
   * PAPER - 1.pdf
   * PAPER - 2.pdf
   * paper-3.pdf
   *
   * Filename se paper number automatically nikalta hai.
   */
  function getPaperNumber(
    fileName: string,
    fallbackNumber: number,
  ) {
    const nameWithoutExtension =
      fileName.replace(/\.[^/.]+$/, "");

    const match =
      nameWithoutExtension.match(
        /paper\s*[-_ ]*\s*(\d+)/i,
      );

    if (match?.[1]) {
      const number = Number(match[1]);

      if (
        Number.isInteger(number) &&
        number > 0
      ) {
        return number;
      }
    }

    return fallbackNumber;
  }

  function getTitle(
    fileName: string,
    paperNumber: number,
  ) {
    const nameWithoutExtension =
      fileName.replace(/\.[^/.]+$/, "");

    const cleaned =
      nameWithoutExtension
        .replace(
          /paper\s*[-_ ]*\s*\d+/i,
          "",
        )
        .replace(/[-_]+/g, " ")
        .trim();

    if (cleaned) {
      return cleaned;
    }

    return `Paper ${paperNumber}`;
  }

  async function loadPapers() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin login session nahi mila.",
        );
      }

      const {
        data,
        error: queryError,
      } = await supabase
        .from("newspaper_papers")
        .select(
          `
          id,
          newspaper_date,
          language,
          paper_number,
          title,
          storage_path,
          published,
          created_at
          `,
        )
        .order("newspaper_date", {
          ascending: false,
        })
        .order("language", {
          ascending: true,
        })
        .order("paper_number", {
          ascending: true,
        });

      if (queryError) {
        throw new Error(
          queryError.message,
        );
      }

      setPapers(
        (data || []) as NewspaperPaper[],
      );
    } catch (err) {
      console.error(
        "Load newspaper papers error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Papers load nahi ho paye.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files || [],
    );

    const pdfFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name
          .toLowerCase()
          .endsWith(".pdf"),
    );

    if (pdfFiles.length !== files.length) {
      setError(
        "Sirf PDF files upload kar sakte hain.",
      );
    } else {
      setError("");
    }

    setSelectedFiles(pdfFiles);
  }

  function clearSelectedFiles() {
    setSelectedFiles([]);

    const input =
      document.getElementById(
        "newspaper-files",
      ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function uploadPapers() {
    if (!selectedDate) {
      setError("Newspaper date select karein.");
      return;
    }

    if (selectedFiles.length === 0) {
      setError(
        "Kam se kam ek PDF select karein.",
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin login session nahi mila.",
        );
      }

      const languageFolder =
        getLanguageFolder(
          selectedLanguage,
        );

      let successCount = 0;
      const failedFiles: string[] = [];

      /*
       * Files ko paper number ke according
       * sort kar rahe hain.
       */
      const sortedFiles = [...selectedFiles].sort(
        (a, b) =>
          getPaperNumber(a.name, 9999) -
          getPaperNumber(b.name, 9999),
      );

      for (
        let index = 0;
        index < sortedFiles.length;
        index++
      ) {
        const file = sortedFiles[index];

        const paperNumber =
          getPaperNumber(
            file.name,
            index + 1,
          );

        const title = getTitle(
          file.name,
          paperNumber,
        );

        /*
         * Exact storage structure:
         *
         * 2026-08-30/HINDI/PAPER - 1.pdf
         * 2026-08-30/HINDI/PAPER - 2.pdf
         *
         * 2026-08-30/ENGLISH/PAPER - 1.pdf
         */
        const storagePath =
          `${selectedDate}/${languageFolder}/${file.name}`;

        try {
          /*
           * Same file already exists to
           * overwrite karne ke liye upsert true.
           */
          const {
            error: uploadError,
          } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(
              storagePath,
              file,
              {
                upsert: true,
                contentType:
                  "application/pdf",
              },
            );

          if (uploadError) {
            throw new Error(
              uploadError.message,
            );
          }

          /*
           * Check if database row already exists.
           */
          const {
            data: existingPaper,
            error: existingError,
          } = await supabase
            .from("newspaper_papers")
            .select("id")
            .eq(
              "newspaper_date",
              selectedDate,
            )
            .eq(
              "language",
              selectedLanguage,
            )
            .eq(
              "paper_number",
              paperNumber,
            )
            .maybeSingle();

          if (existingError) {
            throw new Error(
              existingError.message,
            );
          }

          if (existingPaper?.id) {
            /*
             * Existing paper:
             * storage update ho gaya,
             * DB row bhi update.
             *
             * IMPORTANT:
             * Existing published paper ko
             * automatically unpublished nahi karenge.
             */
            const {
              error: updateError,
            } = await supabase
              .from("newspaper_papers")
              .update({
                title,
                storage_path:
                  storagePath,
                updated_at:
                  new Date().toISOString(),
              })
              .eq(
                "id",
                existingPaper.id,
              );

            if (updateError) {
              throw new Error(
                updateError.message,
              );
            }
          } else {
            /*
             * New paper:
             * Upload ke baad PUBLISHED = FALSE
             *
             * Admin ko manually Publish karna hoga.
             */
            const {
              error: insertError,
            } = await supabase
              .from("newspaper_papers")
              .insert({
                newspaper_date:
                  selectedDate,

                language:
                  selectedLanguage,

                paper_number:
                  paperNumber,

                title,

                storage_path:
                  storagePath,

                published: false,
              });

            if (insertError) {
              throw new Error(
                insertError.message,
              );
            }
          }

          successCount++;
        } catch (fileError) {
          console.error(
            "File upload failed:",
            file.name,
            fileError,
          );

          failedFiles.push(
            file.name,
          );
        }
      }

      if (successCount > 0) {
        setMessage(
          `${successCount} paper upload ho gaye. Ab Publish button se student ke liye live karein.`,
        );
      }

      if (failedFiles.length > 0) {
        setError(
          `Ye files upload nahi hui: ${failedFiles.join(
            ", ",
          )}`,
        );
      }

      clearSelectedFiles();

      await loadPapers();
    } catch (err) {
      console.error(
        "Upload papers error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Papers upload nahi ho paye.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function publishPaper(
    paper: NewspaperPaper,
  ) {
    try {
      setPublishingId(paper.id);
      setError("");
      setMessage("");

      /*
       * Future date ko publish kar sakte ho.
       * Student Edge Function future date
       * ko automatically hide karega.
       *
       * Isliye admin ko scheduling ka option
       * milta hai.
       */
      const {
        error: updateError,
      } = await supabase
        .from("newspaper_papers")
        .update({
          published: !paper.published,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", paper.id);

      if (updateError) {
        throw new Error(
          updateError.message,
        );
      }

      setMessage(
        paper.published
          ? "Paper unpublished ho gaya."
          : "Paper publish ho gaya.",
      );

      await loadPapers();
    } catch (err) {
      console.error(
        "Publish paper error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Publish status update nahi ho paya.",
      );
    } finally {
      setPublishingId(null);
    }
  }

  async function deletePaper(
    paper: NewspaperPaper,
  ) {
    const confirmed = window.confirm(
      `Kya aap "${paper.title || `Paper ${paper.paper_number}`}" ko delete karna chahte hain?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      /*
       * Database row delete.
       */
      const {
        error: deleteDbError,
      } = await supabase
        .from("newspaper_papers")
        .delete()
        .eq("id", paper.id);

      if (deleteDbError) {
        throw new Error(
          deleteDbError.message,
        );
      }

      /*
       * Storage file delete.
       */
      if (paper.storage_path) {
        const {
          error: deleteStorageError,
        } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([
            paper.storage_path,
          ]);

        if (deleteStorageError) {
          console.error(
            "Storage delete error:",
            deleteStorageError,
          );
        }
      }

      setMessage(
        "Paper delete ho gaya.",
      );

      await loadPapers();
    } catch (err) {
      console.error(
        "Delete paper error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Paper delete nahi ho paya.",
      );
    }
  }

  const groupedDates = useMemo(() => {
    const groups: Record<
      string,
      NewspaperPaper[]
    > = {};

    for (const paper of papers) {
      if (!groups[paper.newspaper_date]) {
        groups[paper.newspaper_date] = [];
      }

      groups[paper.newspaper_date].push(
        paper,
      );
    }

    return Object.entries(groups).sort(
      ([dateA], [dateB]) =>
        dateB.localeCompare(dateA),
    );
  }, [papers]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            📰 Newspaper Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Upload, manage and publish Hindi &
            English newspapers.
          </p>
        </div>

        {/* MESSAGES */}
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            ❌ {error}
          </div>
        )}

        {/* UPLOAD CARD */}
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">
          <h2 className="text-xl font-bold">
            Upload Newspaper
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Date aur language select karke
            multiple PDF papers upload karein.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* DATE */}
            <div>
              <label
                htmlFor="newspaper-date"
                className="mb-2 block text-sm font-semibold"
              >
                Newspaper Date
              </label>

              <input
                id="newspaper-date"
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
              />

              {selectedDate &&
                isFutureDate(
                  selectedDate,
                ) && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    ⚠️ Future date hai. Admin
                    me publish kar sakte hain,
                    lekin student page par date
                    automatically hide rahegi jab
                    tak date nahi aa jaati.
                  </p>
                )}
            </div>

            {/* LANGUAGE */}
            <div>
              <label
                htmlFor="newspaper-language"
                className="mb-2 block text-sm font-semibold"
              >
                Language
              </label>

              <select
                id="newspaper-language"
                value={selectedLanguage}
                onChange={(event) =>
                  setSelectedLanguage(
                    event.target
                      .value as Language,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="hindi">
                  🇮🇳 Hindi
                </option>

                <option value="english">
                  🇬🇧 English
                </option>
              </select>
            </div>
          </div>

          {/* FILE INPUT */}
          <div className="mt-5">
            <label
              htmlFor="newspaper-files"
              className="mb-2 block text-sm font-semibold"
            >
              PDF Papers
            </label>

            <input
              id="newspaper-files"
              type="file"
              accept="application/pdf,.pdf"
              multiple
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Recommended names:
              <br />
              PAPER - 1.pdf
              <br />
              PAPER - 2.pdf
              <br />
              PAPER - 3.pdf
            </p>
          </div>

          {/* SELECTED FILES */}
          {selectedFiles.length > 0 && (
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Selected Files (
                  {selectedFiles.length})
                </h3>

                <button
                  type="button"
                  onClick={
                    clearSelectedFiles
                  }
                  className="text-xs font-semibold text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {selectedFiles.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm dark:bg-slate-900"
                    >
                      <span>
                        📄 {file.name}
                      </span>

                      <span className="text-xs text-slate-500">
                        Paper{" "}
                        {getPaperNumber(
                          file.name,
                          index + 1,
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          <button
            type="button"
            onClick={uploadPapers}
            disabled={
              uploading ||
              selectedFiles.length === 0
            }
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : `Upload ${
                  selectedFiles.length || ""
                } Paper${
                  selectedFiles.length === 1
                    ? ""
                    : "s"
                } →`}
          </button>

          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <strong>Important:</strong>{" "}
            Upload ke baad paper automatically
            <strong> unpublished</strong> rahega.
            Student ko dikhane ke liye neeche
            <strong> Publish</strong> button dabana
            hoga.
          </div>
        </div>

        {/* EXISTING PAPERS */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Uploaded Newspapers
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Future, current aur previous dates
                yahan manage kar sakte hain.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPapers}
              disabled={loading}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {loading
                ? "Loading..."
                : "↻ Refresh"}
            </button>
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl bg-white p-6 text-center dark:bg-slate-900">
              Newspapers loading...
            </div>
          )}

          {!loading &&
            groupedDates.length === 0 && (
              <div className="mt-6 rounded-2xl bg-white p-8 text-center dark:bg-slate-900">
                <div className="text-4xl">
                  📰
                </div>

                <p className="mt-3 font-semibold">
                  Abhi koi newspaper upload nahi
                  hua.
                </p>
              </div>
            )}

          {!loading &&
            groupedDates.length > 0 && (
              <div className="mt-6 space-y-6">
                {groupedDates.map(
                  ([date, datePapers]) => {
                    const hindiPapers =
                      datePapers
                        .filter(
                          (paper) =>
                            paper.language ===
                            "hindi",
                        )
                        .sort(
                          (a, b) =>
                            a.paper_number -
                            b.paper_number,
                        );

                    const englishPapers =
                      datePapers
                        .filter(
                          (paper) =>
                            paper.language ===
                            "english",
                        )
                        .sort(
                          (a, b) =>
                            a.paper_number -
                            b.paper_number,
                        );

                    return (
                      <div
                        key={date}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                      >
                        {/* DATE HEADER */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800">
                          <div>
                            <h3 className="text-lg font-bold">
                              📅{" "}
                              {formatDate(
                                date,
                              )}
                            </h3>

                            {isFutureDate(
                              date,
                            ) && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                UPCOMING
                              </span>
                            )}

                            {!isFutureDate(
                              date,
                            ) && (
                              <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                PAST / TODAY
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-500">
                            {
                              datePapers.length
                            }{" "}
                            paper
                            {datePapers.length !==
                            1
                              ? "s"
                              : ""}
                          </div>
                        </div>

                        <div className="grid gap-6 p-5 md:grid-cols-2">
                          {/* HINDI */}
                          <PaperSection
                            language="hindi"
                            papers={
                              hindiPapers
                            }
                            publishingId={
                              publishingId
                            }
                            onPublish={
                              publishPaper
                            }
                            onDelete={
                              deletePaper
                            }
                          />

                          {/* ENGLISH */}
                          <PaperSection
                            language="english"
                            papers={
                              englishPapers
                            }
                            publishingId={
                              publishingId
                            }
                            onPublish={
                              publishPaper
                            }
                            onDelete={
                              deletePaper
                            }
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

/* =====================================================
   PAPER SECTION
===================================================== */

type PaperSectionProps = {
  language: Language;
  papers: NewspaperPaper[];
  publishingId: string | null;
  onPublish: (
    paper: NewspaperPaper,
  ) => void;
  onDelete: (
    paper: NewspaperPaper,
  ) => void;
};

function PaperSection({
  language,
  papers,
  publishingId,
  onPublish,
  onDelete,
}: PaperSectionProps) {
  const isHindi =
    language === "hindi";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-lg font-bold">
          {isHindi
            ? "🇮🇳 Hindi"
            : "🇬🇧 English"}
        </h4>

        <span className="text-xs text-slate-500">
          {papers.length} paper
          {papers.length !== 1
            ? "s"
            : ""}
        </span>
      </div>

      {papers.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400 dark:border-slate-700">
          {isHindi
            ? "Hindi paper nahi hai."
            : "English paper nahi hai."}
        </div>
      )}

      <div className="space-y-3">
        {papers.map((paper) => (
          <div
            key={paper.id}
            className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">
                  📄 Paper{" "}
                  {paper.paper_number}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {paper.title ||
                    `Paper ${paper.paper_number}`}
                </p>

                <p className="mt-1 break-all text-[11px] text-slate-400">
                  {paper.storage_path}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                  paper.published
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {paper.published
                  ? "PUBLISHED"
                  : "DRAFT"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onPublish(paper)
                }
                disabled={
                  publishingId ===
                  paper.id
                }
                className={`rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                  paper.published
                    ? "bg-slate-600 hover:bg-slate-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {publishingId ===
                paper.id
                  ? "Updating..."
                  : paper.published
                    ? "Unpublish"
                    : "Publish"}
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(paper)
                }
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
