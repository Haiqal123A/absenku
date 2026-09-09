import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Camera,
  Eye,
  X,
  Building2,
  Home,
  CheckCircle2,
  FileText,
  BriefcaseBusiness,
  Target,
  AlertCircle,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";
import { attendanceApi } from "../../lib/api";

function Riwayat() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterMode, setFilterMode] = useState("SEMUA");

  useEffect(() => {
    let active = true;

    attendanceApi
      .history()
      .then(({ attendance }) => {
        if (!active || !attendance) return;

        setRecords(
          attendance.map((item) => ({
            ...item,
            mode: "WFO",
            type: item.check_out_time ? "pulang" : "masuk",
            date: item.attendance_date,
            time: item.check_out_time || item.check_in_time,
            status: item.status,
            photo: item.check_in_photo_path,
          })),
        );
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRecords =
    filterMode === "SEMUA"
      ? records
      : records.filter((record) => record.mode === filterMode);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeLabel = (record) => {
    if (record.mode === "WFH") {
      return "Presensi WFH";
    }

    return record.type === "pulang" ? "Presensi Pulang" : "Presensi Masuk";
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] pb-24 lg:pb-8">
      {/* ================= NAVBAR ================= */}
      <UserNavbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* ================= HEADER ================= */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#073BBA] font-semibold">
              Riwayat Presensi
            </span>
          </div>

          <p className="text-sm font-semibold text-[#073BBA] mb-1">PRESENSI</p>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2875]">
            Riwayat Presensi
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Lihat seluruh riwayat kehadiran dan detail aktivitas kamu.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            Memuat riwayat dari database...
          </div>
        )}

        {/* ================= FILTER ================= */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm mb-6">
          <div className="grid grid-cols-3 gap-2">
            {["SEMUA", "WFO", "WFH"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilterMode(item)}
                className={`py-3 rounded-xl text-sm font-bold transition ${
                  filterMode === item
                    ? "bg-[#073BBA] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#0B2875]">Daftar Presensi</h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredRecords.length} data presensi
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock3 size={19} className="text-[#073BBA]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Tanggal
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Mode
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Jenis
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Waktu
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                    Detail
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition">
                    {/* TANGGAL */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-slate-400" />

                        <span className="text-sm font-semibold text-slate-700">
                          {formatShortDate(record.date)}
                        </span>
                      </div>
                    </td>

                    {/* MODE */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                          record.mode === "WFH"
                            ? "bg-purple-50 text-purple-600"
                            : "bg-blue-50 text-[#073BBA]"
                        }`}
                      >
                        {record.mode === "WFH" ? (
                          <Home size={13} />
                        ) : (
                          <Building2 size={13} />
                        )}

                        {record.mode}
                      </span>
                    </td>

                    {/* JENIS */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {getTypeLabel(record)}
                    </td>

                    {/* WAKTU */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock3 size={16} className="text-slate-400" />

                        {formatTime(record.time)}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 size={13} />
                        Tercatat
                      </span>
                    </td>

                    {/* DETAIL */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRecord(record)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 text-[#073BBA] hover:bg-blue-100 text-xs font-bold transition"
                      >
                        <Eye size={15} />
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                          <Clock3 size={22} className="text-slate-400" />
                        </div>

                        <p className="text-sm font-semibold text-slate-500">
                          Belum ada riwayat presensi
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Data presensi akan muncul di sini.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MOBILE CARD ================= */}
        <div className="md:hidden space-y-3">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#0B2875]">
                    {formatShortDate(record.date)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        record.mode === "WFH"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-[#073BBA]"
                      }`}
                    >
                      {record.mode === "WFH" ? (
                        <Home size={12} />
                      ) : (
                        <Building2 size={12} />
                      )}

                      {record.mode}
                    </span>

                    <span className="text-xs text-slate-500">
                      {getTypeLabel(record)}
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                  <CheckCircle2 size={12} />
                  Tercatat
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                <Clock3 size={16} className="text-slate-400" />

                {record.time}
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(record)}
                className="w-full mt-4 py-3 rounded-xl bg-blue-50 text-[#073BBA] text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition"
              >
                <Eye size={17} />
                Lihat Detail Presensi
              </button>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Clock3 size={22} className="text-slate-400" />
              </div>

              <p className="text-sm font-semibold text-slate-500">
                Belum ada riwayat presensi
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Data presensi akan muncul di sini.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* ================= DETAIL MODAL ================= */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#073BBA]">
                  DETAIL PRESENSI
                </p>

                <h2 className="text-lg sm:text-xl font-black text-[#0B2875] mt-1">
                  {getTypeLabel(selectedRecord)}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X size={19} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* INFO */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs text-slate-400">Tanggal</p>

                  <p className="text-sm font-bold text-[#0B2875] mt-1">
                    {formatDate(selectedRecord.date)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs text-slate-400">Waktu</p>

                  <p className="text-sm font-bold text-[#0B2875] mt-1">
                    {selectedRecord.time}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs text-slate-400">Mode</p>

                  <p
                    className={`text-sm font-bold mt-1 ${
                      selectedRecord.mode === "WFH"
                        ? "text-purple-600"
                        : "text-[#073BBA]"
                    }`}
                  >
                    {selectedRecord.mode}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs text-slate-400">Status</p>

                  <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 mt-1">
                    <CheckCircle2 size={15} />
                    Tercatat
                  </p>
                </div>
              </div>

              {/* FOTO */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera size={18} className="text-[#073BBA]" />

                  <h3 className="font-bold text-[#0B2875]">Foto Presensi</h3>
                </div>

                {selectedRecord.photo ? (
                  <img
                    src={selectedRecord.photo}
                    alt="Foto presensi"
                    className="w-full max-h-[380px] object-cover rounded-2xl bg-slate-100"
                  />
                ) : (
                  <div className="h-48 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <div className="text-center">
                      <Camera size={30} className="mx-auto text-slate-300" />

                      <p className="text-xs text-slate-400 mt-2">
                        Foto dummy / belum tersedia
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* LOCATION */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-[#073BBA]" />

                  <h3 className="font-bold text-[#0B2875]">Lokasi Presensi</h3>
                </div>

                {selectedRecord.mode === "WFH" ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-sm font-semibold text-slate-600">
                      Tidak direkam
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Presensi WFH tidak menggunakan GPS.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="text-sm font-bold text-[#073BBA]">
                      Lokasi berhasil direkam
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-[10px] text-slate-400">Latitude</p>

                        <p className="text-xs font-bold text-slate-700">
                          {selectedRecord.latitude ?? "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Longitude</p>

                        <p className="text-xs font-bold text-slate-700">
                          {selectedRecord.longitude ?? "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Akurasi</p>

                        <p className="text-xs font-bold text-slate-700">
                          ±{Math.round(selectedRecord.accuracy || 0)} m
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= WFH ACTIVITY ================= */}
              {selectedRecord.mode === "WFH" && selectedRecord.wfh_activity && (
                <div className="rounded-2xl border border-purple-100 overflow-hidden">
                  {/* HEADER */}
                  <div className="bg-purple-50 px-4 sm:px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                        <BriefcaseBusiness
                          size={19}
                          className="text-purple-600"
                        />
                      </div>

                      <div>
                        <h3 className="font-black text-purple-700">
                          Aktivitas WFH
                        </h3>

                        <p className="text-xs text-purple-500 mt-0.5">
                          Aktivitas yang dikirim bersamaan dengan presensi
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-4">
                    {/* PEKERJAAN */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-slate-400" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                          Pekerjaan yang Dilakukan
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedRecord.wfh_activity.pekerjaan || "-"}
                        </p>
                      </div>
                    </div>

                    {/* HASIL */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-slate-400" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                          Hasil Pekerjaan
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedRecord.wfh_activity.hasil || "-"}
                        </p>
                      </div>
                    </div>

                    {/* PROGRESS */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target size={16} className="text-slate-400" />

                          <p className="text-xs font-bold text-slate-500 uppercase">
                            Progress
                          </p>
                        </div>

                        <span className="text-sm font-black text-purple-600">
                          {selectedRecord.wfh_activity.progress || 0}%
                        </span>
                      </div>

                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  selectedRecord.wfh_activity.progress || 0,
                                ),
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* KENDALA */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} className="text-slate-400" />

                        <p className="text-xs font-bold text-slate-500 uppercase">
                          Kendala
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50">
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {selectedRecord.wfh_activity.kendala ||
                            "Tidak ada kendala."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* KETERANGAN */}
              {selectedRecord.note && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} className="text-[#073BBA]" />

                    <h3 className="font-bold text-[#0B2875]">Keterangan</h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedRecord.note}
                    </p>
                  </div>
                </div>
              )}

              {/* CLOSE */}
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="w-full py-3.5 rounded-xl bg-[#073BBA] text-white font-bold hover:bg-[#062f94] transition"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Riwayat;
