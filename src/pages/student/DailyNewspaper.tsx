import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function DailyNewspaper() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const scriptId = "razorpay-checkout-script";

    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);
  }, []);

  async function handleUnlock() {
    try {
      setLoading(true);
      setMessage("");

      /*
       * Make sure Razorpay Checkout is loaded.
       */
      if (!window.Razorpay) {
        throw new Error(
          "Payment system is still loading. Please try again."
        );
      }

      /*
       * Create Razorpay order through Supabase Edge Function.
       *
       * Edge Function name:
       * create-daily-newspaper-order
       */
      const {
        data: orderData,
        error: orderError,
      } = await supabase.functions.invoke(
        "create-daily-newspaper-order"
      );

      if (orderError) {
        throw new Error(
          orderError.message || "Unable to create payment order."
        );
      }

      if (!orderData?.order_id || !orderData?.key_id) {
        throw new Error("Invalid payment order received.");
      }

      /*
       * Open Razorpay Checkout.
       */
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PadhAI",
        description: "Daily Newspaper - 30 Days",
        order_id: orderData.order_id,

        handler: async function (response: any) {
          try {
            setLoading(true);
            setMessage("Verifying your payment...");

            /*
             * Verify payment through Supabase Edge Function.
             */
            const {
              data: verifyData,
              error: verifyError,
            } = await supabase.functions.invoke(
              "verify-daily-newspaper-payment",
              {
                body: {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,
                },
              }
            );

            if (verifyError) {
              throw new Error(
                verifyError.message ||
                  "Payment verification failed."
              );
            }

            if (!verifyData?.success) {
              throw new Error(
                verifyData?.error ||
                  "Payment verification failed."
              );
            }

            setIsPremium(true);
            setMessage(
              "Payment successful! Your Daily Newspaper access is active for 30 days."
            );
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            setMessage(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            setMessage("Payment cancelled.");
          },
        },

        theme: {
          color: "#f59e0b",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setLoading(false);

          setMessage(
            response?.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      setLoading(false);

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start payment."
      );
    }
  }

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
              navigate("/student/dashboard")
            }
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">
          {/* Title */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl">📰</div>

              <h2 className="mt-4 text-2xl font-bold">
                Daily Newspaper
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Today's important news selected specially
                for students.
              </p>
            </div>

            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
              PREMIUM
            </span>
          </div>

          {/* Premium / Payment Box */}
          {!isPremium ? (
            <div className="mt-8 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/30">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    🔒 Unlock Daily Newspaper
                  </h3>

                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Get premium daily newspaper access
                    for 30 days.
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    ₹49
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    30 days
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUnlock}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Processing..."
                  : "Pay ₹49 & Unlock →"}
              </button>

              {message && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4 text-sm text-slate-700 dark:border-amber-900/50 dark:bg-slate-900 dark:text-slate-300">
                  {message}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/30">
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                ✅ Premium Access Active
              </h3>

              <p className="mt-2 text-sm text-green-700/80 dark:text-green-300/80">
                Your Daily Newspaper subscription is
                active for 30 days.
              </p>

              <button
                type="button"
                className="mt-5 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700"
              >
                Read Today's Newspaper →
              </button>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <h3 className="font-semibold">
              What you'll get
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📰 Daily important news
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🎯 Exam-focused updates
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                📚 Easy student-friendly explanations
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                🔐 Non-shareable premium content
              </div>
            </div>
          </div>

          {/* Back */}
          <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
