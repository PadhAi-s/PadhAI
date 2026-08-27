<Route
  element={
    <ProtectedRoute allowedRole="student" />
  }
>
  <Route
    path="student/dashboard"
    element={<StudentDashboard />}
  />

  <Route
    path="student/profile"
    element={<StudentProfile />}
  />

  <Route
    path="student/syllabus"
    element={<StudentSyllabus />}
  />

  <Route
    path="student/ask"
    element={<AskPadhAI />}
  />

  <Route
    path="student/current-affairs"
    element={<WeeklyCurrentAffairs />}
  />

  <Route
    path="student/daily-newspaper"
    element={<DailyNewspaper />}
  />
</Route>
