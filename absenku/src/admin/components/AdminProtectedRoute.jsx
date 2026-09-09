import { Navigate, Outlet, useLocation } from "react-router-dom";

function AdminProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("absenku_token");
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
