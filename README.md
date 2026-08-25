# PadhAI

A bilingual (Hindi/English), AI-powered study companion. Students pick
Class + Board + Exam, get the matching syllabus, ask an AI tutor
questions, watch relevant YouTube lessons, take quizzes, and track
progress. Admins upload and publish official syllabus PDFs, which always
take priority over the AI-generated fallback.

**Status:** Phase 1 (project setup) complete. See [Development phases](#development-phases).

## Architecture

- **Frontend** — React + Vite + TypeScript, deployed as a static site to
  GitHub Pages. Tailwind CSS v4 for styling, `react-router-dom`
  (`HashRouter`, so GitHub Pages needs no server rewrite rules) for
  routing, TanStack Query for server-state/caching, `react-i18next` for
  EN/HI.
- **Backend** — [Supabase](https://supabase.com): Postgres (with
  Row-Level Security) for data, Supabase Auth for both Student and Admin
  accounts (role lives in `profiles.role`, not a separate auth system),
  Storage for syllabus PDFs, and Edge Functions as the *only* place that
  calls the Gemini and YouTube APIs — their keys are Supabase secrets
  and never reach frontend code.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

`.env.local` is gitignored. See `.env.example` for which variables are
safe in the frontend (`VITE_`-prefixed) versus server-only (set via
`supabase secrets set`, never committed).

## Project structure

```
src/
├── components/       shared UI (Logo, LanguageToggle, ThemeToggle, ...)
├── pages/
│   ├── student/       student-facing screens
│   └── admin/         admin-facing screens
├── layouts/           route layouts (header/footer shell, etc.)
├── services/
│   ├── auth/           Supabase Auth wrapper + role handling  (Phase 2)
│   ├── gemini/          calls the Gemini Edge Functions          (Phase 7+)
│   ├── youtube/         calls the get-videos Edge Function       (Phase 9)
│   ├── syllabus/        published-syllabus reads + admin writes  (Phase 4-5)
│   └── supabase/         the Supabase client itself
├── context/            React context providers (theme, ...)
├── hooks/              shared hooks
├── translations/        en.json / hi.json
└── utils/               i18n setup, misc helpers

supabase/
├── migrations/          SQL schema + RLS policies      (Phase 4)
└── functions/            Edge Functions                (Phase 5, 7-9)
```

## Development phases

1. Architecture + project setup ✅
2. Authentication + Student/Admin roles
3. Student onboarding (Class/Board/Exam/Language)
4. Database + syllabus system
5. Admin syllabus PDF upload, processing, publishing
6. Student dashboard + syllabus navigation
7. Gemini AI study assistant
8. Image question solving
9. YouTube recommendations
10. Notes + Tasks + Study Timer
11. Quiz + AI quiz generator
12. Progress + analytics
13. Bilingual polish
14. Security + performance
15. GitHub Pages deployment

Each phase is built, run, and tested before moving to the next.

## Deployment (GitHub Pages)

Not wired up yet — lands in Phase 15, once there's a Supabase project to
point the built frontend at. Frontend and backend deploy independently:
GitHub Actions builds and publishes `dist/` to GitHub Pages; Supabase
Edge Functions deploy separately via the Supabase CLI.
