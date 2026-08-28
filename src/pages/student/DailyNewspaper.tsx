import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

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

export function DailyNewspaper() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");

      /*
       * Check login
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Please login first.");
        navigate("/student/login");
        return;
      }

      /*
       * Load Razorpay Checkout
       */
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Razorpay Checkout load nahi ho paya. Internet connection check karein.",
        );
      }

      /*
       * Create Razorpay order
       */
      const { data, error } =
        await supabase.functions.invoke(
          "create-daily-newspaper-order",
        );

      if (error) {
        console.error(
          "Create order error:",
          error,
        );

        throw new Error(
          error.message ||
            "Payment order create nahi ho paya.",
        );
      }

      if (!data?.order_id || !data?.key_id) {
        console.error(
          "Invalid order response:",
          data,
        );

        throw new Error(
          "Invalid Razorpay order response.",
        );
      }

      /*
       * Open Razorpay Checkout
       */
      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency || "INR",

        name: "PadhAI",
        description: "Daily Newspaper - 30 Days",

        order_id: data.order_id,

        prefill: {
          email: session.user.email || "",
        },

        theme: {
          color: "#f59e0b",
        },

        handler: async function (response: any) {
          try {
            setLoading(true);
            setMessage(
              "Payment received. Verifying payment...",
            );

            /*
             * Verify payment on Supabase Edge Function
             */
            const { data: verifyData, error: verifyError } =
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
              console.error(
                "Verify payment error:",
                verifyError,
              );

              throw new Error(
                verifyError.message ||
                  "Payment verification failed.",
              );
            }

            if (!verifyData?.success) {
              console.error(
                "Invalid verification response:",
                verifyData,
              );

              throw new Error(
                verifyData?.error ||
                  "Payment verification failed.",
              );
            }

            /*
             * Payment successful
             */
            setMessage(
              "🎉 Payment successful! Daily Newspaper unlocked.",
            );

            alert(
              "🎉 Payment successful!\n\nDaily Newspaper is now unlocked for 30 days.",
            );

            /*
             * Reload current page so subscription
             * status can be checked again.
             */
            window.location.reload();
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
          ondismiss: function () {
            setLoading(false);
            setMessage("Payment cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Razorpay payment failed:",
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-4xl">
                📰
              </div>

              <h2 className="mt-4 text-2xl font-bold">
                Daily Newspaper
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Today's important news selected
                specially for students.
              </p>
            </div>

            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
              PREMIUM
            </span>
          </div>

          {/* Premium Box */}
          <div className="mt-8 rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/30">
            <h3 className="font-semibold">
              🔒 Premium Content
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Daily Newspaper is available for
              paid members. Subscribe for ₹49 and
              get access for 30 days.
            </p>

            {/* Payment Button */}
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="mt-5 rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Processing..."
                : "Unlock Daily Newspaper ₹49 →"}
            </button>

            {/* Status */}
            {message && (
              <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                {message}
              </p>
            )}
          </div>

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
        </div>
      </main>
    </div>
  );
}
