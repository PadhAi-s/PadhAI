import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";

export function StudentLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function redirectStudent(userId: string) {
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          "full_name, class_name, board, exam",
        )
        .eq("id", userId)
        .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    const profileComplete =
      Boolean(profile?.full_name?.trim()) &&
      Boolean(profile?.class_name) &&
      Boolean(profile?.board) &&
      Boolean(profile?.exam);

    if (profileComplete) {
      navigate("/student/dashboard");
    } else {
      navigate("/student/profile");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError(
        "Please enter email and password. / कृपया ईमेल और पासवर्ड दर्ज करें।",
      );
      return;
    }

    if (isSignup && !fullName.trim()) {
      setError(
        "Please enter your full name. / कृपया अपना पूरा नाम दर्ज करें।",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters. / पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        const { data, error: signupError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });

        if (signupError) {
          throw signupError;
        }

        if (!data.user) {
          throw new Error(
            "Unable to create account. Please try again.",
          );
        }

        if (!data.session) {
          setMessage(
            "Please check your email and confirm your account before logging in. / कृपया अपना ईमेल चेक करके अकाउंट कन्फर्म करें।",
          );
          return;
        }

        const { error: profileError } =
          await supabase
            .from("profiles")
            .update({
              full_name: fullName.trim(),
            })
            .eq("id", data.user.id);

        if (profileError) {
          console.error(
            "Profile name update error:",
            profileError,
          );
        }

        await redirectStudent(data.user.id);
      } else {
        const { data, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (loginError) {
          throw loginError;
        }

        if (!data.user) {
          throw new Error(
            "Login failed. Please try again.",
          );
        }

        await redirectStudent(data.user.id);
      }
    } catch (err) {
      console.error("Student login error:", err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    if (loading) {
      return;
    }

    setIsSignup((previous) => !previous);
    setError("");
    setMessage("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-8">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white shadow-lg">
            P
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isSignup
              ? t("studentLogin.createAccount")
              : t("studentLogin.login")}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isSignup
              ? t("studentLogin.createSubtitle")
              : t("studentLogin.loginSubtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* FULL NAME */}
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                {t("studentLogin.fullName")}
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder={t(
                  "studentLogin.fullNamePlaceholder",
                )}
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                autoComplete="name"
              />
            </div>
          )}

          {/* EMAIL */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("studentLogin.email")}
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="student@example.com"
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {t("studentLogin.password")}
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder={t(
                "studentLogin.passwordPlaceholder",
              )}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              autoComplete={
                isSignup
                  ? "new-password"
                  : "current-password"
              }
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* MESSAGE */}
          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300">
              ✅ {message}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <span className="text-base">
                ⏳
              </span>
            )}

            {loading
              ? "Please wait... / कृपया प्रतीक्षा करें..."
              : isSignup
                ? t(
                    "studentLogin.createAccountButton",
                  )
                : t(
                    "studentLogin.loginButton",
                  )}
          </button>
        </form>

        {/* TOGGLE */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          {isSignup
            ? t("studentLogin.alreadyAccount")
            : t("studentLogin.noAccount")}

          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="ml-1 font-semibold text-blue-600 transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSignup
              ? t("studentLogin.login")
              : t(
                  "studentLogin.createAccount",
                )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
