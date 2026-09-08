import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  XCircle,
} from "lucide-react";
import { useLeaveRequests, useStudents } from "../data";

const MONTHLY_LIMIT = 4;

function requestType(request) {
  const value = String(request.jenis || request.type || request.keteranganStatus || request.status || "").toLowerCase();
  return value.includes("sakit") ? "Sakit" : "Izin";
}

function requestState(request) {
  const value = String(request.statusPengajuan || request.approvalStatus || request.statusAdmin || "Menunggu").toLowerCase();
  if (["diterima", "disetujui", "approved"].includes(value)) return "Diterima";
  if (["ditolak", "rejected"].includes(value)) return "Ditolak";
  return "Menunggu";
}

function requestDate(request) {
  return String(request.tanggal || request.tanggalIzin || request.date || request.createdAt || "").slice(0, 10);
}

function formatDate(value) {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  }).format(date);
}

export default function PengajuanIzinSakit() {
  const [requests, setRequests] = useLeaveRequests();
  const [students, setStudents] = useStudents();
  const [filter, setFilter] = useState("Menunggu");
  const currentMonth = new Date().toISOString().slice(0, 7);

  const normalizedRequests = useMemo(() => requests.map((request, index) => ({
    ...request,
    id: request.id || `${request.studentId || request.nis || "request"}-${index}`,
    type: requestType(request),
    state: requestState(request),
    date: requestDate(request),
    studentName: request.nama || request.namaSiswa || request.studentName || "Siswa belum diketahui",
    studentNis: String(request.nis || request.studentNis || "-"),
    reason: request.alasan || request.keterangan || request.reason || "Tidak ada keterangan.",
  })), [requests]);

  const visibleRequests = normalizedRequests.filter((request) => filter === "Semua" || request.state === filter);
  const pendingCount = normalizedRequests.filter((request) => request.state === "Menunggu").length;

  function usedQuota(request) {
    return normalizedRequests.filter((item) =>
      item.studentNis === request.studentNis &&
      item.date.startsWith(currentMonth) &&
      item.state !== "Ditolak"
    ).length;
  }

  function updateRequest(request, nextState) {
    if (nextState === "Diterima" && usedQuota(request) > MONTHLY_LIMIT) {
      window.alert("Pengajuan tidak dapat diterima karena kuota siswa sudah melebihi 4 kali bulan ini.");
      return;
    }

    setRequests(requests.map((item, index) => {
      const itemId = item.id || `${item.studentId || item.nis || "request"}-${index}`;
      return itemId === request.id
        ? { ...item, statusPengajuan: nextState, diprosesPada: new Date().toISOString() }
        : item;
    }));

    // Hanya ubah presensi hari ini; pengajuan untuk tanggal lain tetap tersimpan
    // sebagai riwayat agar tidak mengubah absensi yang sedang berjalan.
    const today = new Date().toISOString().slice(0, 10);
    if (nextState === "Diterima" && request.date === today) {
      setStudents(students.map((student) =>
        String(student.nis) === request.studentNis || String(student.id) === String(request.studentId)
          ? { ...student, status: request.type, jamMasuk: "-", jamPulang: "-" }
          : student
      ));
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f8ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Pengajuan Izin & Sakit</h1>
            <p className="mt-2 text-slate-500">Terima atau tolak pengajuan siswa. Kuota maksimal 4 kali per siswa setiap bulan.</p>
          </div>
          <div className="rounded-2xl bg-[#073b9e] px-5 py-3 text-white shadow-sm">
            <p className="text-xs text-blue-100">Menunggu diproses</p>
            <p className="text-2xl font-extrabold">{pendingCount} pengajuan</p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {["Menunggu", "Diterima", "Ditolak", "Semua"].map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === item ? "bg-[#073b9e] text-white" : "bg-white text-slate-600 hover:bg-blue-50"}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {visibleRequests.map((request) => {
            const quota = usedQuota(request);
            return (
              <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${request.type === "Sakit" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{request.type}</span>
                      <StateBadge state={request.state} />
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-slate-900">{request.studentName}</h2>
                    <p className="text-sm text-slate-500">NIS: {request.studentNis}</p>
                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <p className="flex items-center gap-2"><CalendarDays size={17} className="text-[#073b9e]" />{formatDate(request.date)}</p>
                      <p className="flex items-center gap-2"><ClipboardList size={17} className="text-[#073b9e]" />Kuota bulan ini: {quota}/{MONTHLY_LIMIT}</p>
                    </div>
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><span className="font-semibold text-slate-800">Keterangan: </span>{request.reason}</div>
                  </div>
                  {request.state === "Menunggu" && (
                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => updateRequest(request, "Ditolak")} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"><XCircle size={18} />Tolak</button>
                      <button onClick={() => updateRequest(request, "Diterima")} disabled={quota > MONTHLY_LIMIT} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 size={18} />Terima</button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
          {visibleRequests.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500"><FileText className="mx-auto mb-3 text-slate-300" size={40} />Belum ada pengajuan {filter === "Semua" ? "izin atau sakit" : filter.toLowerCase()}.</div>}
        </div>
      </div>
    </div>
  );
}

function StateBadge({ state }) {
  const styles = {
    Menunggu: "bg-amber-100 text-amber-700",
    Diterima: "bg-green-100 text-green-700",
    Ditolak: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${styles[state]}`}><HeartPulse className="mr-1 inline" size={13} />{state}</span>;
}
