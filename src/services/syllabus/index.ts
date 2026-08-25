// Built out starting Phase 4 (database + syllabus system) and Phase 5
// (admin PDF upload/processing/publishing).
// Reads published syllabus_versions for students; admin-only writes go
// through RLS-checked calls plus the `process-syllabus-pdf` Edge Function.
//
// Planned exports: getPublishedSyllabus(), listChapters(), listTopics()
export {};
