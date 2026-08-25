import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function StudentLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function redirectStudent(userId: string) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, class_name, board, exam")
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (isSignup && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
          throw new Error("Account could not be created.");
        }

        if (!data.session) {
          setMessage(
            "Account created! Please check your email to confirm your account."
          );
          return;
        }

        // Save the signup name to the student's profile.
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: fullName.trim(),
          })
          .eq("id", data.user.id);

        if (profileError) {
          console.error("Profile name update error:", profileError);
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
          throw new Error("Unable to login. Please try again.");
        }

        await redirectStudent(data.user.id);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
            P
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {isSignup
              ? "Create Student Account"
              : "Student Login"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {isSignup
              ? "Create your PadhAI student account"
              : "Login to continue learning with PadhAI"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="student@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              autoComplete={
                isSignup
                  ? "new-password"
                  : "current-password"
              }
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setMessage("");
            }}
            className="ml-1 font-semibold text-blue-600 hover:underline"
          >
            {isSignup ? "Login" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
