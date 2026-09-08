import { Navigate, Routes, Route } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import AdminDashboard from "./pages/AdminDashboard";
import AnakPKL from "./pages/AnakPKL";
import KehadiranHariIni from "./pages/KehadiranHariIni";
import Pengaturan from "./pages/Pengaturan";
import RekapExport from "./pages/RekapExport";
import RiwayatKehadiran from "./pages/RiwayatKehadiran";
import PengajuanIzinSakit from "./pages/PengajuanIzinSakit";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/anak-pkl" element={<AnakPKL />} />
        <Route path="/admin/kehadiran" element={<KehadiranHariIni />} />
        <Route path="/admin/pengajuan" element={<PengajuanIzinSakit />} />
        <Route path="/admin/riwayat" element={<RiwayatKehadiran />} />
        <Route path="/admin/rekap" element={<RekapExport />} />
        <Route path="/admin/pengaturan" element={<Pengaturan />} />
      </Route>
    </Routes>
  );
}