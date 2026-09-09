import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";

import AdminRoutes from "./admin/AdminRoutes";
import UserRoutes from "./user/UserRoutes";

function AppRoutes() {
  const { pathname } = useLocation();

  // Halaman login dan seluruh halaman user
  // menggunakan UserRoutes
  if (pathname === "/login" || pathname.startsWith("/user")) {
    return <UserRoutes />;
  }

  // Halaman admin menggunakan AdminRoutes
  return <AdminRoutes />;
}

export default function App() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}