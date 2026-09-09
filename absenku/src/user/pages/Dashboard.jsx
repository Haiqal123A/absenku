import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  Timer,
  UserRound,
  BriefcaseBusiness,
  ChevronRight,
  Building2,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";
import { attendanceApi, authApi } from "../../lib/api";

function Dashboard() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    attendanceApi
      .today()
      .then(setTodayAttendance)
      .catch(() => setTodayAttendance(null));
    attendanceApi
      .history()
      .then(({ attendance = [] }) =>
        setRecentAttendance(
          attendance.slice(0, 4).map((item) => ({
            ...item,
            date: item.attendance_date,
            day: item.attendance_date,
            masuk: item.check_in_time,
            pulang: item.check_out_time,
            status: item.status === "COMPLETED" ? "Hadir" : "Sedang bekerja",
          })),
        ),
      )
      .catch(() => setRecentAttendance([]));
    authApi
      .me()
      .then(({ user }) => setUserProfile(user))
      .catch(() => setUserProfile(null));
  }, []);

  const userName = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("absenku_user") || "{}");
      return saved.full_name || saved.name || "Pengguna";
    } catch {
      return "Pengguna";
    }
  }, []);

  const today = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const currentHour = new Date().getHours();

  const greeting =
    currentHour < 11
      ? "Selamat pagi"
      : currentHour < 15
        ? "Selamat siang"
        : currentHour < 18
          ? "Selamat sore"
          : "Selamat malam";

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      {/* NAVBAR */}
      <UserNavbar />

      <main className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-8">
        {/* =========================================================
            HERO
        ========================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-[#073BBA] shadow-xl">
          {/* Decorative */}
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-[#FFD21A]/10" />
          <div className="absolute right-20 top-16 hidden h-32 w-32 rounded-full border border-white/10 lg:block" />

          <div className="relative z-10 grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_330px] lg:p-10">
            {/* HERO LEFT */}
            <div className="flex flex-col justify-center">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                  {today}
                </span>

                <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-medium text-emerald-100">
                  ● Sistem Aktif
                </span>
              </div>

              <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                {greeting}, {userName} 👋
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Selamat datang kembali di Absenku. Pantau presensi dan aktivitas
                PKL kamu dengan mudah dari satu tempat.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <NavLink
                  to="/user/presensi"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD21A] px-5 py-3.5 text-sm font-bold text-[#073BBA] shadow-lg transition hover:-translate-y-0.5 hover:bg-yellow-400"
                >
                  <Camera size={18} />
                  Rekam Presensi
                  <ArrowRight size={16} />
                </NavLink>

                <NavLink
                  to="/user/riwayat"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  Lihat Riwayat
                </NavLink>
              </div>
            </div>

            {/* STATUS CARD */}
            <div className="flex items-center">
              <div className="w-full rounded-2xl bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Status Presensi
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-[#0B2875]">
                      {todayAttendance?.has_checked_out
                        ? "Selesai"
                        : todayAttendance?.has_checked_in
                          ? "Sedang Bekerja"
                          : "Belum Presensi"}
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={23} className="text-emerald-600" />
                  </div>
                </div>

                <div className="my-5 h-px bg-slate-100" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Jam Masuk</p>

                    <p className="mt-1 text-2xl font-bold text-[#073BBA]">
                      {todayAttendance?.attendance?.check_in_time
                        ? new Date(
                            todayAttendance.attendance.check_in_time,
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Jam Pulang</p>

                    <p className="mt-1 text-2xl font-bold text-slate-300">
                      {todayAttendance?.attendance?.check_out_time
                        ? new Date(
                            todayAttendance.attendance.check_out_time,
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
                  <MapPin size={15} className="text-emerald-600" />

                  <span className="text-xs font-medium text-emerald-700">
                    {todayAttendance?.location
                      ? "Lokasi kantor aktif tersedia"
                      : "Lokasi presensi belum tersedia"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            JADWAL HARI INI
        ========================================================= */}
        <section className="mt-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER */}
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    <CalendarDays size={21} className="text-[#073BBA]" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[#073BBA]">
                      Jadwal Hari Ini
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Senin, 7 September 2026
                    </p>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                  Hari kerja
                </span>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* JAM KERJA */}
                <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-100 hover:bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Clock3 size={20} className="text-[#073BBA]" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Schedule
                    </span>
                  </div>

                  <p className="mt-5 text-xs text-slate-400">Jam Kerja</p>

                  <p className="mt-1 text-xl font-bold text-[#0B2875]">
                    08:00 - 16:00
                  </p>

                  <p className="mt-1 text-xs text-slate-500">Senin - Jumat</p>
                </div>

                {/* LOKASI */}
                <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-100 hover:bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Building2 size={20} className="text-[#073BBA]" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Location
                    </span>
                  </div>

                  <p className="mt-5 text-xs text-slate-400">Lokasi PKL</p>

                  <p className="mt-1 text-sm font-bold leading-5 text-[#0B2875]">
                    Direktorat Bina Teknik SDA
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Lokasi presensi utama
                  </p>
                </div>

                {/* DURASI */}
                <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-blue-100 hover:bg-blue-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Timer size={20} className="text-[#073BBA]" />
                    </div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Today
                    </span>
                  </div>

                  <p className="mt-5 text-xs text-slate-400">Durasi Hari Ini</p>

                  <p className="mt-1 text-xl font-bold text-[#0B2875]">
                    6j 18m
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Sejak pukul 07:42
                  </p>
                </div>
              </div>

              {/* LOCATION NOTICE */}
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                    <MapPin size={18} className="text-[#073BBA]" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#073BBA]">
                      Pastikan lokasi presensi sesuai
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Presensi hanya dapat dilakukan ketika kamu berada di area
                      lokasi PKL yang telah ditentukan.
                    </p>
                  </div>
                </div>

                <NavLink
                  to="/user/presensi"
                  className="inline-flex shrink-0 items-center justify-center gap-1 rounded-xl bg-[#073BBA] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#052f94]"
                >
                  Presensi
                  <ArrowRight size={14} />
                </NavLink>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            RINGKASAN + AKSES CEPAT
        ========================================================= */}
        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_350px]">
          {/* RINGKASAN */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-[#073BBA]">
                  Ringkasan Bulan Ini
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Rekap kehadiran September 2026
                </p>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 sm:flex">
                <BriefcaseBusiness size={19} className="text-[#073BBA]" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[11px] text-slate-400">Hari Kerja</p>

                <p className="mt-2 text-2xl font-bold text-[#0B2875]">22</p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-[11px] text-slate-400">Hadir</p>

                <p className="mt-2 text-2xl font-bold text-[#073BBA]">18</p>
              </div>

              <div className="rounded-2xl bg-yellow-50 p-4">
                <p className="text-[11px] text-slate-400">Terlambat</p>

                <p className="mt-2 text-2xl font-bold text-yellow-600">2</p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-[11px] text-slate-400">Kehadiran</p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">82%</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-100 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Rekap kehadiran kamu
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Data dapat berubah setelah terhubung dengan API.
                </p>
              </div>

              <NavLink
                to="/user/laporan"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#073BBA] transition hover:bg-blue-100"
              >
                <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>

          {/* AKSES CEPAT */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="font-bold text-[#073BBA]">Akses Cepat</h2>

            <p className="mt-1 text-xs text-slate-500">
              Menu yang sering digunakan.
            </p>

            <div className="mt-5 space-y-3">
              <NavLink
                to="/user/presensi"
                className="group flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3.5 transition hover:bg-blue-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Camera size={18} className="text-[#073BBA]" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-[#073BBA]">
                    Rekam Presensi
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Catat kehadiran
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-[#073BBA] transition group-hover:translate-x-1"
                />
              </NavLink>

              <NavLink
                to="/user/izin"
                className="group flex items-center gap-3 rounded-2xl border border-yellow-100 bg-yellow-50 p-3.5 transition hover:bg-yellow-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <CalendarDays size={18} className="text-yellow-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-yellow-700">
                    Ajukan Izin
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Buat pengajuan
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-yellow-600 transition group-hover:translate-x-1"
                />
              </NavLink>

              <NavLink
                to="/user/profile"
                className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:bg-slate-100"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <UserRound size={18} className="text-slate-600" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700">
                    Profil Saya
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Kelola data diri
                  </p>
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-500 transition group-hover:translate-x-1"
                />
              </NavLink>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRESENSI TERBARU
        ========================================================= */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div>
              <h2 className="font-bold text-[#073BBA]">Presensi Terbaru</h2>

              <p className="mt-1 text-xs text-slate-500">
                Aktivitas presensi terakhir kamu.
              </p>
            </div>

            <NavLink
              to="/user/riwayat"
              className="inline-flex w-fit items-center gap-1 text-xs font-bold text-[#073BBA] hover:underline"
            >
              Lihat semua
              <ArrowRight size={14} />
            </NavLink>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-slate-100 bg-slate-50 px-7 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tanggal
              </p>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Masuk
              </p>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pulang
              </p>

              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </p>
            </div>

            {recentAttendance.map((item, index) => (
              <div
                key={`${item.date}-${index}`}
                className="grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center border-b border-slate-100 px-7 py-4 last:border-b-0 hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                    <CalendarDays size={16} className="text-[#073BBA]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.date}
                    </p>

                    <p className="text-[11px] text-slate-400">{item.day}</p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  {item.masuk}
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  {item.pulang}
                </p>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold ${
                    item.status === "Terlambat"
                      ? "bg-yellow-100 text-yellow-700"
                      : item.status === "Sedang bekerja"
                        ? "bg-blue-100 text-[#073BBA]"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* MOBILE */}
          <div className="divide-y divide-slate-100 md:hidden">
            {recentAttendance.map((item, index) => (
              <div key={`${item.date}-mobile-${index}`} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#0B2875]">
                      {item.date}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">{item.day}</p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      item.status === "Terlambat"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "Sedang bekerja"
                          ? "bg-blue-100 text-[#073BBA]"
                          : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-400">Jam Masuk</p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.masuk}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] text-slate-400">Jam Pulang</p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.pulang}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            INFO PKL
        ========================================================= */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <BriefcaseBusiness size={21} className="text-[#073BBA]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#073BBA]">Informasi PKL</h2>

                  <p className="text-xs text-slate-500">
                    Detail kegiatan praktik kerja lapangan
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Peserta
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {userProfile?.full_name || userName}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Sekolah
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {userProfile?.school || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Jurusan
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {userProfile?.major || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium text-slate-400">
                    Periode PKL
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {userProfile?.nisn || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-[#073BBA] p-5 sm:p-7 lg:w-[270px]">
              <div>
                <p className="text-xs font-medium text-blue-100">Lokasi PKL</p>

                <div className="mt-2 flex items-start gap-2">
                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0 text-[#FFD21A]"
                  />

                  <p className="text-sm font-semibold leading-5 text-white">
                    {todayAttendance?.location?.name || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 pb-2 text-center text-[11px] text-slate-400 sm:flex-row sm:text-left">
          <p>Absenku • Sistem Presensi Peserta PKL</p>

          <p>Data diperbarui dari server.</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
