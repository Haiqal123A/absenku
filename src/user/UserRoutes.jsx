import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import Presensi from "./pages/Presensi";
import Riwayat from "./pages/Riwayat";
import Izin from "./pages/Izin";
import Laporan from "./pages/Laporan";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

function UserRoutes() {
  return (
    <Routes>
      {/* ========================= */}
      {/* PUBLIC */}
      {/* ========================= */}

      <Route path="/login" element={<Login />} />

      <Route
        path="/user/forgot-password"
        element={<ForgotPassword />}
      />

      {/* ========================= */}
      {/* USER */}
      {/* ========================= */}

      <Route element={<ProtectedRoute />}>
        <Route
          path="/user/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/user/presensi"
          element={<Presensi />}
        />

        <Route
          path="/user/riwayat"
          element={<Riwayat />}
        />

        <Route
          path="/user/izin"
          element={<Izin />}
        />

        <Route
          path="/user/laporan"
          element={<Laporan />}
        />

        <Route
          path="/user/profile"
          element={<Profile />}
        />
      </Route>

      {/* ========================= */}
      {/* DEFAULT */}
      {/* ========================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/user/dashboard"
            replace
          />
        }
      />

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

export default UserRoutes;