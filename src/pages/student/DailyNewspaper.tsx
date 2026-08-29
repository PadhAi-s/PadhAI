import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

type Paper = {
  name: string;
  paper: number;
  url: string;
};

type NewspaperDay = {
  date: string;
  hindi: Paper[];
  english: Paper[];
};

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

function formatDate(date: string) {
  const d = new Date(`${date}T00:00:00`);

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function DailyNewspaper() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] =
    useState(true);

  const [message, setMessage] = useState("");

  const [newspapers, setNewspapers] =
    useState<NewspaperDay[]>([]);

  const [subscribed, setSubscribed] =
    useState(false);

  useEffect(() => {
    loadNewspapers();
  }, []);

  const loadNewspapers = async () => {
    try {
      setCheckingStatus(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/student/login");
        return;
      }

      const { data, error } =
        await supabase.functions.invoke(
          "get-newspapers",
        );

      if (error) {
        console.error(
          "Get newspapers error:",
          error,
        );

        setSubscribed(false);
        setNewspapers([]);

        return;
      }

      if (data?.code === "NOT_SUBSCRIBED") {
        setSubscribed(false);
        setNewspapers([]);
        return;
      }

      if (
        data?.code ===
        "SUBSCRIPTION_EXPIRED"
      ) {
        setSubscribed(false);
        setNewspapers([]);
        return;
      }

      if (
        data?.success &&
        Array.isArray(data.newspapers)
      ) {
        setSubscribed(true);
        setNewspapers(data.newspapers);
      } else {
        setSubscribed(false);
        setNewspapers([]);
      }
    } catch (error) {
      console.error(
        "Newspaper loading failed:",
        error,
      );

      setSubscribed(false);
      setNewspapers([]);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/student/login");
        return;
      }

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout load nahi ho paya.",
        );
      }

      const { data, error } =
        await supabase.functions.invoke(
          "create-daily-newspaper-order",
        );

      if (error) {
        throw new Error(
          error.message ||
            "Payment order create nahi ho paya.",
        );
      }

      if (
        !data?.order_id ||
        !data?.key_id
      ) {
        throw new Error(
          "Invalid Razorpay order response.",
        );
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency:
          data.currency || "INR",

        name: "PadhAI",
        description:
          "Daily Newspaper - 30 Days",

        order_id: data.order_id,

        prefill: {
          email:
            session.user.email || "",
        },

        theme: {
          color: "#f59e0b",
        },

        handler: async (
          response: any,
        ) => {
          try {
            setLoading(true);

            setMessage(
              "Payment received. Verifying...",
            );

            const {
              data: verifyData,
              error: verifyError,
            } =
              await supabase.functions.invoke(
                "verify-razorpay-payment",
                {
                  body: {
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  },
                },
              );

            if (verifyError) {
              throw new Error(
                verifyError.message ||
                  "Payment verification failed.",
              );
            }

            if (
              !verifyData?.success
            ) {
              throw new Error(
                verifyData?.error ||
                  "Payment verification failed.",
              );
            }

            setMessage(
              "🎉 Payment successful! Daily Newspaper unlocked.",
            );

            /*
             * Reload newspapers after payment.
             */
            await loadNewspapers();
          } catch (error) {
            console.error(
              "Payment verification failed:",
              error,
            );

            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage(
              "Payment cancelled.",
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response: any) => {
          console.error(
            "Payment failed:",
            response,
          );

          setLoading(false);

          setMessage(
            response?.error?.description ||
              "Payment failed. Please try again.",
          );
        },
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Payment start nahi ho paya.",
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              PadhAI
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Daily Newspaper
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/student/dashboard",
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">

        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">

          {/* Title */}
          <div className="flex items-start justify-between gap-4">

            <div>
              <div className="text-4xl">
                📰
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                Daily Newspaper
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Hindi & English newspapers,
                including previous dates.
              </p>
            </div>

            {subscribed && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                ACTIVE
              </span>
            )}

            {!checkingStatus &&
              !subscribed && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                  PREMIUM
                </span>
              )}

          </div>

          {/* Checking */}
          {checkingStatus && (
            <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Checking your subscription...
            </div>
          )}

          {/* Premium Paywall */}
          {!checkingStatus &&
            !subscribed && (
              <div className="mt-8 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/30">

                <h3 className="font-semibold">
                  🔒 Premium Content
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Daily Newspaper is available
                  for paid members. Subscribe
                  for ₹49 and get access for
                  30 days.
                </p>

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={loading}
                  className="mt-5 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Processing..."
                    : "Unlock Daily Newspaper ₹49 →"}
                </button>

                {message && (
                  <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {message}
                  </p>
                )}

              </div>
            )}

          {/* Newspapers */}
          {!checkingStatus &&
            subscribed && (
              <div className="mt-8 space-y-6">

                {newspapers.length === 0 && (
                  <div className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30">

                    <h3 className="font-semibold">
                      ⏳ Newspaper abhi upload nahi hua
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      Subscription active hai.
                      Jaise hi newspaper upload
                      hoga, yahan automatically
                      dikh jayega.
                    </p>

                  </div>
                )}

                {newspapers.map(
                  (day) => (
                    <div
                      key={day.date}
                      className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700"
                    >

                      {/* Date */}
                      <div className="bg-slate-100 px-5 py-4 dark:bg-slate-800">

                        <h3 className="text-lg font-bold">
                          📅{" "}
                          {formatDate(
                            day.date,
                          )}
                        </h3>

                      </div>

                      <div className="grid gap-5 p-5 md:grid-cols-2">

                        {/* Hindi */}
                        <div className="rounded-2xl bg-orange-50 p-5 dark:bg-orange-950/20">

                          <h4 className="text-lg font-bold">
                            🇮🇳 Hindi Newspaper
                          </h4>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {day.hindi.length} paper
                            {day.hindi.length !== 1
                              ? "s"
                              : ""}
                            {" "}available
                          </p>

                          <div className="mt-4 space-y-3">

                            {day.hindi.length ===
                              0 && (
                              <p className="text-sm text-slate-500">
                                Hindi paper
                                uploaded nahi hai.
                              </p>
                            )}

                            {day.hindi.map(
                              (
                                paper,
                                index,
                              ) => (
                                <a
                                  key={`${day.date}-hi-${paper.name}-${index}`}
                                  href={
                                    paper.url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 font-semibold shadow-sm transition hover:shadow-md dark:bg-slate-900"
                                >
                                  <span>
                                    📄 Paper{" "}
                                    {paper.paper !==
                                    999
                                      ? paper.paper
                                      : index +
                                        1}
                                  </span>

                                  <span className="text-blue-600">
                                    Open →
                                  </span>
                                </a>
                              ),
                            )}

                          </div>

                        </div>

                        {/* English */}
                        <div className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/20">

                          <h4 className="text-lg font-bold">
                            🇬🇧 English Newspaper
                          </h4>

                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {day.english.length} paper
                            {day.english.length !== 1
                              ? "s"
                              : ""}
                            {" "}available
                          </p>

                          <div className="mt-4 space-y-3">

                            {day.english.length ===
                              0 && (
                              <p className="text-sm text-slate-500">
                                English paper
                                uploaded nahi hai.
                              </p>
                            )}

                            {day.english.map(
                              (
                                paper,
                                index,
                              ) => (
                                <a
                                  key={`${day.date}-en-${paper.name}-${index}`}
                                  href={
                                    paper.url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 font-semibold shadow-sm transition hover:shadow-md dark:bg-slate-900"
                                >
                                  <span>
                                    📄 Paper{" "}
                                    {paper.paper !==
                                    999
                                      ? paper.paper
                                      : index +
                                        1}
                                  </span>

                                  <span className="text-blue-600">
                                    Open →
                                  </span>
                                </a>
                              ),
                            )}

                          </div>

                        </div>

                      </div>
                    </div>
                  ),
                )}

              </div>
            )}

          {/* Features */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">

            <h3 className="font-semibold">
              What you'll get
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📰 Daily important news
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📅 Previous dates available
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🇮🇳 Hindi papers
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🇬🇧 English papers
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
