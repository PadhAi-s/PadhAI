import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRole?: "student" | "admin";
}

export function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">
            Loading PadhAI...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    const loginPath =
      allowedRole === "admin"
        ? "/admin/login"
        : "/student/login";

    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (allowedRole && profile?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
