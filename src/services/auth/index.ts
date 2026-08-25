// Built out in Phase 2 (Authentication + Student/Admin roles).
// Will wrap supabase.auth.signInWithPassword / signUp / signOut and expose
// the current user's role (read from `profiles`, stamped into the JWT via
// a Custom Access Token Hook) to the rest of the app.
export {};
