import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type Language = "hindi" | "english";

type Newspaper = {
  id: string;
  newspaper_date: string;
  language: Language;
  paper_number: number;
  file_path: string;
  file_name: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const BUCKET = "newspapers";

function todayLocal() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function AdminNewspaper() {
  const navigate = useNavigate();

  const [date, setDate] = useState(todayLocal());
  const [language, setLanguage] =
    useState<Language>("hindi");

  const [paperNumber, setPaperNumber] = useState(1);

  const [file, setFile] =
    useState<File | null>(null);

  const [newspapers, setNewspapers] =
    useState<Newspaper[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingList, setLoadingList] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadNewspapers();
  }, []);

  const loadNewspapers = async () => {
    try {
      setLoadingList(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("newspapers")
        .select("*")
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

      setNewspapers(
        (data || []) as Newspaper[],
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Newspapers load nahi ho paye.",
      );
    } finally {
      setLoadingList(false);
    }
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      if (!date) {
        setError("Newspaper date select karein.");
        return;
      }

      if (!file) {
        setError("PDF file select karein.");
        return;
      }

      if (file.type !== "application/pdf") {
        setError("Sirf PDF file upload karein.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login");
        return;
      }

      /*
       * File path:
       *
       * 2026-08-29/hindi/paper-1.pdf
       * 2026-08-29/hindi/paper-2.pdf
       * 2026-08-29/english/paper-1.pdf
       */
      const extension = "pdf";

      const filePath =
        `${date}/${language}/paper-${paperNumber}.${extension}`;

      /*
       * Upload / replace PDF
       */
      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET)
          .upload(filePath, file, {
            contentType: "application/pdf",
            upsert: true,
          });

      if (uploadError) {
        throw uploadError;
      }

      /*
       * Check whether this paper already exists
       */
      const { data: existing } =
        await supabase
          .from("newspapers")
          .select("id")
          .eq("newspaper_date", date)
          .eq("language", language)
          .eq("paper_number", paperNumber)
          .maybeSingle();

      if (existing?.id) {
        /*
         * Existing paper:
         * Update file but keep current publish status.
         */
        const {
          error: updateError,
        } = await supabase
          .from("newspapers")
          .update({
            file_path: filePath,
            file_name: file.name,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        setMessage(
          `✅ ${language === "hindi" ? "Hindi" : "English"} Paper ${paperNumber} updated successfully.`,
        );
      } else {
        /*
         * New paper starts UNPUBLISHED.
         *
         * This is important:
         * Future / newly uploaded papers are hidden
         * from students until admin clicks Publish.
         */
        const {
          error: insertError,
        } = await supabase
          .from("newspapers")
          .insert({
            newspaper_date: date,
            language,
            paper_number: paperNumber,
            file_path: filePath,
            file_name: file.name,
            published: false,
          });

        if (insertError) {
          throw insertError;
        }

        setMessage(
          `✅ ${language === "hindi" ? "Hindi" : "English"} Paper ${paperNumber} uploaded. Abhi unpublished hai.`,
        );
      }

      setFile(null);

      const input =
        document.getElementById(
          "newspaper-file",
        ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await loadNewspapers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Newspaper upload failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (
    newspaper: Newspaper,
  ) => {
    try {
      setError("");
      setMessage("");

      const nextPublished =
        !newspaper.published;

      const { error } = await supabase
        .from("newspapers")
        .update({
          published: nextPublished,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", newspaper.id);

      if (error) {
        throw error;
      }

      setMessage(
        nextPublished
          ? "✅ Newspaper published."
          : "🔒 Newspaper unpublished.",
      );

      await loadNewspapers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Publish status change nahi ho paya.",
      );
    }
  };

  const deleteNewspaper = async (
    newspaper: Newspaper,
  ) => {
    const confirmed =
      window.confirm(
        `Paper ${newspaper.paper_number} delete karna hai?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      /*
       * Delete storage file
       */
      const { error: storageError } =
        await supabase.storage
          .from(BUCKET)
          .remove([newspaper.file_path]);

      if (storageError) {
        console.error(
          "Storage delete error:",
          storageError,
        );
      }

      /*
       * Delete database record
       */
      const { error: dbError } =
        await supabase
          .from("newspapers")
          .delete()
          .eq("id", newspaper.id);

      if (dbError) {
        throw dbError;
      }

      setMessage("🗑️ Newspaper deleted.");

      await loadNewspapers();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Newspaper delete nahi ho paya.",
      );
    }
  };

  const openNewspaper = async (
    newspaper: Newspaper,
  ) => {
    try {
      setError("");

      const { data, error } =
        await supabase.storage
          .from(BUCKET)
          .createSignedUrl(
            newspaper.file_path,
            60 * 10,
          );

      if (error) {
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error(
          "PDF URL generate nahi hua.",
        );
      }

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "PDF open nahi ho paya.",
      );
    }
  };

  const formatDate = (
    value: string,
  ) => {
    const d = new Date(
      `${value}T00:00:00`,
    );

    return d.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const hindiPapers =
    newspapers.filter(
      (n) => n.language === "hindi",
    );

  const englishPapers =
    newspapers.filter(
      (n) => n.language === "english",
    );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI Admin
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Daily Newspaper Management
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/dashboard")
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">

        {/* Upload Card */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">
              📰 Upload Newspaper
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Date, language aur paper number select karke PDF upload karein.
              Upload ke baad paper automatically publish nahi hoga.
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
              ❌ {error}
            </div>
          )}

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Newspaper Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />

              <p className="mt-1 text-xs text-slate-500">
                Future date bhi upload kar sakte ho.
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value as Language,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="hindi">
                  🇮🇳 Hindi
                </option>

                <option value="english">
                  🇬🇧 English
                </option>
              </select>
            </div>

            {/* Paper Number */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Paper Number
              </label>

              <input
                type="number"
                min={1}
                max={100}
                value={paperNumber}
                onChange={(e) =>
                  setPaperNumber(
                    Math.max(
                      1,
                      Number(e.target.value) || 1,
                    ),
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />

              <p className="mt-1 text-xs text-slate-500">
                Paper 1, Paper 2, Paper 3...
              </p>
            </div>

            {/* File */}
            <div>
              <label
                htmlFor="newspaper-file"
                className="mb-2 block text-sm font-semibold"
              >
                PDF File
              </label>

              <input
                id="newspaper-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] ||
                      null,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Uploading..."
              : "📤 Upload Newspaper"}
          </button>

        </section>

        {/* Hindi */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                🇮🇳 Hindi Newspapers
              </h2>

              <p className="text-sm text-slate-500">
                Published aur unpublished Hindi papers
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">
              {hindiPapers.length} papers
            </span>
          </div>

          <NewspaperTable
            newspapers={hindiPapers}
            loading={loadingList}
            onPublish={togglePublish}
            onOpen={openNewspaper}
            onDelete={deleteNewspaper}
            formatDate={formatDate}
          />

        </section>

        {/* English */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                🇬🇧 English Newspapers
              </h2>

              <p className="text-sm text-slate-500">
                Published aur unpublished English papers
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">
              {englishPapers.length} papers
            </span>
          </div>

          <NewspaperTable
            newspapers={englishPapers}
            loading={loadingList}
            onPublish={togglePublish}
            onOpen={openNewspaper}
            onDelete={deleteNewspaper}
            formatDate={formatDate}
          />

        </section>

      </main>
    </div>
  );
}

type NewspaperTableProps = {
  newspapers: Newspaper[];
  loading: boolean;
  onPublish: (
    newspaper: Newspaper,
  ) => void;
  onOpen: (
    newspaper: Newspaper,
  ) => void;
  onDelete: (
    newspaper: Newspaper,
  ) => void;
  formatDate: (
    value: string,
  ) => string;
};

function NewspaperTable({
  newspapers,
  loading,
  onPublish,
  onOpen,
  onDelete,
  formatDate,
}: NewspaperTableProps) {
  if (loading) {
    return (
      <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-800">
        Loading newspapers...
      </div>
    );
  }

  if (newspapers.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-800">
        Abhi koi newspaper upload nahi hua.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">

      <table className="w-full min-w-[850px] text-sm">

        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">
              Date
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Paper
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              File
            </th>

            <th className="px-4 py-3 text-left font-semibold">
              Status
            </th>

            <th className="px-4 py-3 text-right font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">

          {newspapers.map(
            (newspaper) => (
              <tr
                key={newspaper.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >

                <td className="px-4 py-4 font-medium">
                  {formatDate(
                    newspaper.newspaper_date,
                  )}
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold dark:bg-slate-800">
                    Paper{" "}
                    {newspaper.paper_number}
                  </span>
                </td>

                <td className="max-w-[250px] truncate px-4 py-4 text-slate-600 dark:text-slate-400">
                  {newspaper.file_name}
                </td>

                <td className="px-4 py-4">

                  {newspaper.published ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      ● PUBLISHED
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      ● UNPUBLISHED
                    </span>
                  )}

                </td>

                <td className="px-4 py-4">

                  <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        onOpen(newspaper)
                      }
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      👁️ Open
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onPublish(
                          newspaper,
                        )
                      }
                      className={
                        newspaper.published
                          ? "rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                          : "rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      }
                    >
                      {newspaper.published
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onDelete(
                          newspaper,
                        )
                      }
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
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
  );
}
