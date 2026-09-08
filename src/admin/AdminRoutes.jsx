import { Routes, Route, Navigate } from "react-router-dom";

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <Navigate
            to="/user/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AdminRoutes;
