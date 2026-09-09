import { BrowserRouter, useLocation } from "react-router-dom";
import { useEffect } from "react";

import AdminRoutes from "./admin/AdminRoutes";
import UserRoutes from "./user/UserRoutes";

function AppRoutes() {
  const { pathname } = useLocation();

  return pathname.startsWith("/user") ? <UserRoutes /> : <AdminRoutes />;
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