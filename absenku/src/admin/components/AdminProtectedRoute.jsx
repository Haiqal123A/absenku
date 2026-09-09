import { Navigate, Outlet, useLocation } from "react-router-dom";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("absenku_user") || "{}");
  } catch {
    return null;
  }
}

function AdminProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("absenku_token");
  const isLoggedIn =
    localStorage.getItem("absenku_logged_in") === "true" && Boolean(token);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const isAdmin = String(user.role || "").toLowerCase() === "admin";

  if (!isAdmin) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
