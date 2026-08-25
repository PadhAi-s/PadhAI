import { HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { RootLayout } from "./layouts/RootLayout";
import { Home } from "./pages/Home";
import { StudentLogin } from "./pages/student/Login";
import { AdminLogin } from "./pages/admin/Login";
import { NotFound } from "./pages/NotFound";

const queryClient = new QueryClient();

// HashRouter, not BrowserRouter: GitHub Pages has no server-side rewrite
// rule to send deep links back to index.html, so a path-based router
// 404s on refresh. Hash routes (/#/student/login) always resolve to
// index.html first. Swap to BrowserRouter + the spa-github-pages
// 404.html redirect trick later if clean URLs matter more than this.
export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="student/login" element={<StudentLogin />} />
              <Route path="admin/login" element={<AdminLogin />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
