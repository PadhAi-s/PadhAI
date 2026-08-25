import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in dev rather than silently shipping a broken client.
  // Copy .env.example to .env.local and fill in your Supabase project
  // values (Project Settings -> API) to fix this.
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.",
  );
}

// This anon key is safe to ship in the frontend bundle by design — every
// table it can reach is locked down with Row-Level Security policies
// (see supabase/migrations, added in Phase 4). Gemini/YouTube API keys
// and the Supabase service-role key must NEVER go through this file or
// any other frontend code — they live only in Supabase Edge Function
// secrets (supabase/functions), added starting Phase 5/7.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
