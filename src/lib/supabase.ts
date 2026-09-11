import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is missing.");
}

if (!supabasePublishableKey) {
  throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY is missing.");
}

// Supabase URL ko clean karo
const cleanSupabaseUrl = supabaseUrl.replace(/\/+$/, "");

// URL validation
try {
  const url = new URL(cleanSupabaseUrl);

  if (url.protocol !== "https:") {
    throw new Error(
      "Supabase URL must start with https://"
    );
  }

  if (url.pathname !== "") {
    throw new Error(
      "Invalid Supabase URL. Use only the Supabase Project URL."
    );
  }
} catch {
  throw new Error(
    "Invalid Supabase URL. Example: https://your-project-ref.supabase.co"
  );
}

export const supabase = createClient(
  cleanSupabaseUrl,
  supabasePublishableKey
);
