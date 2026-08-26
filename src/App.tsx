import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./layouts/RootLayout";

import { Home } from "./pages/Home";

import { StudentLogin } from "./pages/student/Login";
import { StudentDashboard } from "./pages/student/Dashboard";
import { StudentProfile } from "./pages/student/Profile";
import { StudentSyllabus } from "./pages/student/Syllabus";
import { AskPadhAI } from "./pages/student/AskPadhAI";

import { AdminLogin } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";

import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route element={<RootLayout />}>

              {/* ==================== HOME ==================== */}

              <Route
                index
                element={<Home />}
              />

              {/* ==================== STUDENT ==================== */}

              {/* Student Login */}
              <Route
                path="student/login"
                element={<StudentLogin />}
              />

              {/* Protected Student Routes */}
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
                  path="student/ask-ai"
                  element={<AskPadhAI />}
                />
              </Route>

              {/* ==================== ADMIN ==================== */}

              {/* Admin Login */}
              <Route
                path="admin/login"
                element={<AdminLogin />}
              />

              {/* Protected Admin Routes */}
              <Route
                element={
                  <ProtectedRoute allowedRole="admin" />
                }
              >
                <Route
                  path="admin/dashboard"
                  element={<AdminDashboard />}
                />
              </Route>

              {/* ==================== 404 ==================== */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Route>
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
