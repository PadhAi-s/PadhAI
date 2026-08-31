import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";

interface CurrentAffair {
  id: string;
  affair_date: string;
  serial_no: number;
  title: string;
  why_in_news: string;
  key_facts: string;
  exam_point: string;
  static_gk: string;
  category: string | null;
  mcqs: unknown[];
}

export function CurrentAffairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [record, setRecord] =
    useState<CurrentAffair | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      void loadCurrentAffair();
    }
  }, [id]);

  async function loadCurrentAffair() {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchError } = await supabase
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
            category,
            mcqs
          `,
        )
        .eq("id", id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setRecord({
        id: data.id,
        affair_date: data.affair_date ?? "",
        serial_no: Number(data.serial_no ?? 1),
        title: data.title ?? "",
        why_in_news: data.why_in_news ?? "",
        key_facts: data.key_facts ?? "",
        exam_point: data.exam_point ?? "",
        static_gk: data.static_gk ?? "",
        category: data.category ?? null,
        mcqs: Array.isArray(data.mcqs)
          ? data.mcqs
          : [],
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("currentAffairs.loadError"),
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center dark:bg-slate-950">
        {t("currentAffairs.loading")}
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
        <button
          type="button"
          onClick={() =>
            navigate("/student/current-affairs")
          }
          className="mb-6 font-semibold text-blue-600"
        >
          ← {t("common.back")}
        </button>

        <div className="rounded-xl bg-red-50 p-4 text-red-700">
          ❌ {error || "Current affair not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-4xl px-4 py-8">
        <button
          type="button"
          onClick={() =>
            navigate("/student/current-affairs")
          }
          className="mb-6 font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          ← {t("common.back")}
        </button>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
              {record.category ||
                t("currentAffairs.label")}
            </span>

            <span className="text-sm text-slate-400">
              {record.affair_date}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl">
            {record.title}
          </h1>

          <DetailSection
            title={t("currentAffairs.detail.whyInNews")}
            content={record.why_in_news}
          />

          <DetailSection
            title={t("currentAffairs.detail.keyFacts")}
            content={record.key_facts}
          />

          <DetailSection
            title={t("currentAffairs.detail.examPoint")}
            content={record.exam_point}
          />

          <DetailSection
            title={t("currentAffairs.detail.staticGK")}
            content={record.static_gk}
          />

          {record.mcqs.length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
              <h2 className="text-xl font-bold">
                {t("currentAffairs.detail.mcqs")}
              </h2>

              <div className="mt-4 space-y-3">
                {record.mcqs.map(
                  (mcq, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800"
                    >
                      {typeof mcq === "string"
                        ? mcq
                        : JSON.stringify(mcq)}
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

function DetailSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  if (!content) {
    return null;
  }

  return (
    <section className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <p className="mt-3 whitespace-pre-line leading-7 text-slate-600 dark:text-slate-300">
        {content}
      </p>
    </section>
  );
}

export default CurrentAffairDetail;
