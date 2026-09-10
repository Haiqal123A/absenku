import {
  Users,
  Clock3,
  Camera,
  BarChart3,
  MapPin,
  CalendarDays,
  TrendingUp,
  ArrowRight,
  Navigation,
  ShieldCheck,
  Home,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getAttendance,
  getAttendanceStatus,
  getDisplayAttendance,
  getLateStudents,
  isStudentWfhDay,
  useAdminSettings,
  useStudents,
} from "../data";

import ScheduleInfo from "../components/ScheduleInfo";

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    Hadir: "bg-green-100 text-green-700",
    Terlambat: "bg-yellow-100 text-yellow-700",
    Izin: "bg-blue-100 text-blue-700",
    Sakit: "bg-orange-100 text-orange-700",
    "Tidak Hadir": "bg-red-100 text-red-700",
    "Belum Absen": "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status || "Belum Absen"}
    </span>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  const [students] = useStudents();
  const [settings] = useAdminSettings();

  const safeStudents = Array.isArray(students) ? students : [];

  /* =========================================================
     DATA KEHADIRAN
  ========================================================= */

  const lateStudents = getLateStudents(safeStudents, settings);

  const hadir = safeStudents.filter((item) =>
    ["Hadir", "Terlambat"].includes(
      getAttendanceStatus(item, settings),
    ),
  ).length;

  const sakit = safeStudents.filter(
    (item) => getAttendanceStatus(item, settings) === "Sakit",
  ).length;

  const izin = safeStudents.filter(
    (item) => getAttendanceStatus(item, settings) === "Izin",
  ).length;

  const tidakAbsen = safeStudents.filter(
    (item) => getAttendanceStatus(item, settings) === "Belum Absen",
  ).length;

  /* =========================================================
     WFH
  ========================================================= */

  const totalWFH = safeStudents.filter((student) =>
    isStudentWfhDay(student),
  ).length;

  const totalKantor = Math.max(
    safeStudents.length - totalWFH,
    0,
  );

  /* =========================================================
     PERSENTASE
  ========================================================= */

  const persentase = safeStudents.length
    ? Math.round((hadir / safeStudents.length) * 100)
    : 0;

  /* =========================================================
     TANGGAL HARI INI
  ========================================================= */

  const today = new Date();

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  /* =========================================================
     STAT CARD
  ========================================================= */

  const stats = [
    {
      title: "Total Anak PKL",
      value: safeStudents.length,
      subtitle: "siswa terdaftar",
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Hadir Hari Ini",
      value: hadir,
      subtitle: `dari ${safeStudents.length} siswa`,
      bg: "bg-green-50",
      color: "text-green-700",
    },
    {
      title: "Izin",
      value: izin,
      subtitle: "siswa hari ini",
      bg: "bg-blue-50",
      color: "text-blue-700",
    },
    {
      title: "Sakit",
      value: sakit,
      subtitle: "siswa hari ini",
      bg: "bg-orange-50",
      color: "text-orange-700",
    },
    {
      title: "Tidak Absen",
      value: tidakAbsen,
      subtitle: "belum melakukan absensi",
      bg: "bg-red-50",
      color: "text-red-700",
    },
  ];

  /* =========================================================
     DATA TABLE
  ========================================================= */

  const attendance = safeStudents.map((student) => ({
    ...getAttendance(getDisplayAttendance(student, settings)),
    status: getAttendanceStatus(student, settings),
    isWfh: isStudentWfhDay(student),
  }));

  /* =========================================================
     CHART
  ========================================================= */

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const currentDay = dayNames[today.getDay()];

  const chartData = dayNames
    .slice(1)
    .concat("Min")
    .map((day) => ({
      day,
      value: day === currentDay ? hadir : 0,
      izin: day === currentDay ? izin : 0,
      sakit: day === currentDay ? sakit : 0,
      tidakAbsen: day === currentDay ? tidakAbsen : 0,
    }));

  return (
    <div className="space-y-5">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#073b9e] via-[#0848b5] to-[#0d5bd7] p-5 text-white shadow-[0_12px_40px_rgba(7,59,158,0.18)] sm:p-6 md:p-8">

        {/* Decorative */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[35px] border-white/[0.05]" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-white/[0.025]" />

        <div className="pointer-events-none absolute right-[28%] top-10 h-2 w-2 rounded-full bg-white/30 shadow-[18px_8px_0_rgba(255,255,255,0.12),35px_-5px_0_rgba(255,255,255,0.08)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

          {/* LEFT */}

          <div className="max-w-3xl">

           

            <p className="text-sm font-medium text-blue-100">
              Selamat datang,
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-[42px]">
              {settings?.nama || "Admin"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              Pantau dan kelola kehadiran seluruh siswa PKL dengan mudah,
              cepat, dan terorganisir.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-blue-50 backdrop-blur-sm">
                <CalendarDays size={17} />
                <span>{formattedDate}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-blue-50 backdrop-blur-sm">
                <ShieldCheck size={17} />
                <span>Presensi terpantau</span>
              </div>

            </div>
          </div>

          {/* RIGHT - RINGKASAN */}

          <div className="relative w-full lg:w-[310px]">

            <div className="rounded-[22px] border border-white/10 bg-white/[0.10] p-5 shadow-xl backdrop-blur-md">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-blue-100">
                    Ringkasan hari ini
                  </p>

                  <p className="mt-1 text-lg font-bold">
                    Kondisi Presensi
                  </p>
                </div>

              </div>

              <div className="mt-5 flex items-end gap-3">

                <span className="text-4xl font-extrabold">
                  {persentase}%
                </span>

                <span className="mb-1 text-xs text-blue-100">
                  tingkat kehadiran
                </span>

              </div>

              {/* Progress */}

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{
                    width: `${persentase}%`,
                  }}
                />
              </div>

              {/* Mini info */}

              <div className="mt-5 grid grid-cols-2 gap-2">

                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                  <div className="flex items-center gap-2">
                    <Home size={14} className="text-cyan-200" />

                    <span className="text-xs text-blue-100">
                      WFH
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold">
                    {totalWFH}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-200" />

                    <span className="text-xs text-blue-100">
                      Hadir
                    </span>
                  </div>

                  <p className="mt-1 text-lg font-bold">
                    {hadir}
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SCHEDULE
      ===================================================== */}

      <ScheduleInfo
        settings={settings}
        showLateLink
        lateCount={lateStudents.length}
      />

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {stats.map((item) => (
          <div
            key={item.title}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200 ${item.bg} p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md`}
          >

            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/40 transition duration-300 group-hover:scale-125" />

            <div className="relative">

              <p className="text-sm font-semibold text-slate-600">
                {item.title}
              </p>

              <p
                className={`mt-2 text-3xl font-extrabold tracking-tight ${item.color}`}
              >
                {item.value}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {item.subtitle}
              </p>

            </div>
          </div>
        ))}

      </section>

      {/* =====================================================
          LATE NOTIFICATION
      ===================================================== */}

      {lateStudents.length > 0 && (
        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100">
                  <Clock3
                    size={17}
                    className="text-yellow-700"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-yellow-900">
                    Pemberitahuan Keterlambatan
                  </h2>

                  <p className="text-xs text-yellow-700">
                    Perlu diperhatikan hari ini
                  </p>
                </div>

              </div>

              <p className="mt-3 text-sm text-yellow-800">
                {lateStudents.length} siswa terlambat masuk hari ini.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              {lateStudents.map((student) => (
                <span
                  key={student.id}
                  className="rounded-full border border-yellow-100 bg-white px-3 py-1.5 text-xs font-semibold text-yellow-900 shadow-sm"
                >
                  {student.nama}

                  {student.jamMasuk &&
                  student.jamMasuk !== "-"
                    ? ` - ${student.jamMasuk}`
                    : ""}
                </span>
              ))}

            </div>

          </div>
        </section>
      )}

      {/* =====================================================
          CHART + PERCENTAGE
      ===================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">

        {/* CHART */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <div className="flex items-center gap-2">

                <BarIcon />

                <h2 className="font-bold text-[#073b9e]">
                  Grafik Kehadiran
                </h2>

              </div>

              <p className="mt-1 text-xs text-slate-500">
                Statistik kehadiran siswa PKL minggu ini
              </p>

            </div>

            <div className="hidden rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#073b9e] sm:block">
              Minggu ini
            </div>

          </div>

          <div className="relative flex h-64 items-end justify-between gap-2 border-b border-slate-200 px-2 pb-0 sm:gap-3">

            {chartData.map((item) => (
              <div
                key={item.day}
                className="relative flex h-full flex-1 items-end justify-center gap-1"
              >

                <div className="flex h-full items-end">

                  <div
                    className="w-6 rounded-t-md bg-[#073b9e] transition hover:bg-[#0b4fc9]"
                    style={{
                      height: `${
                        (item.value /
                          Math.max(safeStudents.length, 1)) *
                        85
                      }%`,
                    }}
                    title={`${item.value} hadir`}
                  />

                </div>

                <div className="flex h-full items-end">

                  <div
                    className="w-6 rounded-t-md bg-blue-400"
                    style={{
                      height: `${
                        (item.izin /
                          Math.max(safeStudents.length, 1)) *
                        85
                      }%`,
                    }}
                    title={`${item.izin} izin`}
                  />

                </div>

                <div className="flex h-full items-end">

                  <div
                    className="w-6 rounded-t-md bg-orange-400"
                    style={{
                      height: `${
                        (item.sakit /
                          Math.max(safeStudents.length, 1)) *
                        85
                      }%`,
                    }}
                    title={`${item.sakit} sakit`}
                  />

                </div>

                <div className="flex h-full items-end">

                  <div
                    className="w-6 rounded-t-md bg-red-500"
                    style={{
                      height: `${
                        (item.tidakAbsen /
                          Math.max(safeStudents.length, 1)) *
                        85
                      }%`,
                    }}
                    title={`${item.tidakAbsen} tidak absen`}
                  />

                </div>

                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500">
                  {item.day}
                </span>

              </div>
            ))}

          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-3 text-xs sm:grid-cols-4 sm:gap-4">

            <Legend
              color="bg-[#073b9e]"
              label="Hadir"
              value={`${hadir} siswa`}
            />

            <Legend
              color="bg-blue-400"
              label="Izin"
              value={`${izin} siswa`}
            />

            <Legend
              color="bg-orange-400"
              label="Sakit"
              value={`${sakit} siswa`}
            />

            <Legend
              color="bg-red-500"
              label="Tidak Absen"
              value={`${tidakAbsen} siswa`}
            />

          </div>
        </div>

        {/* PERCENTAGE */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-2">

            <TrendingUp
              size={21}
              className="text-[#073b9e]"
            />

            <h2 className="font-bold text-[#073b9e]">
              Persentase Kehadiran
            </h2>

          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row">

            <div
              className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full sm:h-40 sm:w-40"
              style={{
                background: `conic-gradient(
                  #073b9e 0deg ${
                    (hadir / Math.max(safeStudents.length, 1)) * 360
                  }deg,

                  #60a5fa ${
                    (hadir / Math.max(safeStudents.length, 1)) * 360
                  }deg ${
                    ((hadir + izin) /
                      Math.max(safeStudents.length, 1)) *
                    360
                  }deg,

                  #fb923c ${
                    ((hadir + izin) /
                      Math.max(safeStudents.length, 1)) *
                    360
                  }deg ${
                    ((hadir + izin + sakit) /
                      Math.max(safeStudents.length, 1)) *
                    360
                  }deg,

                  #ef4444 ${
                    ((hadir + izin + sakit) /
                      Math.max(safeStudents.length, 1)) *
                    360
                  }deg 360deg
                )`,
              }}
            >

              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white sm:h-36 sm:w-36">

                <span className="text-2xl font-extrabold text-[#073b9e] sm:text-3xl">
                  {persentase}%
                </span>

                <span className="text-xs text-slate-500">
                  Kehadiran
                </span>

              </div>

            </div>

            <div className="w-full max-w-[220px] space-y-3 text-sm sm:space-y-4">

              <Legend
                color="bg-[#073b9e]"
                label="Hadir"
                value={`${hadir} siswa`}
              />

              <Legend
                color="bg-blue-400"
                label="Izin"
                value={`${izin} siswa`}
              />

              <Legend
                color="bg-orange-400"
                label="Sakit"
                value={`${sakit} siswa`}
              />

              <Legend
                color="bg-red-500"
                label="Tidak Absen"
                value={`${tidakAbsen} siswa`}
              />

            </div>

          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

            <div>
              <p className="text-xs text-slate-400">
                Di Kantor
              </p>

              <p className="mt-1 font-bold text-slate-700">
                {totalKantor} siswa
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                WFH
              </p>

              <p className="mt-1 font-bold text-cyan-600">
                {totalWFH} siswa
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          TABLE + QUICK ACTION
      ===================================================== */}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 p-5">

            <div>

              <h2 className="font-bold text-[#073b9e]">
                Kehadiran Terbaru
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Data absensi siswa PKL hari ini
              </p>

            </div>

            <Link
              to="/admin/kehadiran"
              className="group flex items-center gap-1 text-sm font-semibold text-[#073b9e]"
            >
              Lihat Semua

              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

          </div>

          <div className="overflow-x-auto p-4">

            <table className="w-full min-w-[700px] text-left text-sm">

              <thead>

                <tr className="bg-blue-50 text-xs font-semibold text-[#073b9e]">

                  <th className="rounded-l-lg px-4 py-3">
                    Siswa
                  </th>

                  <th className="px-4 py-3">
                    Kelas
                  </th>

                  <th className="px-4 py-3">
                    Jam Masuk
                  </th>

                  <th className="px-4 py-3">
                    Jam Pulang
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="rounded-r-lg px-4 py-3 text-center">
                    Detail
                  </th>

                </tr>

              </thead>

              <tbody>

                {attendance.map((item, index) => (
                  <tr
                    key={`${item.id}-${item.nama}-${index}`}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                  >

                    {/* SISWA */}

                    <td className="px-4 py-4">

                      <div>

                        <p className="font-semibold text-slate-700">
                          {item.nama}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          NIS: {item.nis}
                        </p>

                      </div>

                    </td>

                    {/* KELAS */}

                    <td className="px-4 py-4 text-slate-500">
                      {item.kelas}
                    </td>

                    {/* JAM MASUK */}

                    <td className="px-4 py-4">

                      <p className="font-medium text-slate-600">
                        {item.jamMasuk}
                      </p>

                    </td>

                    {/* JAM PULANG */}

                    <td className="px-4 py-4">

                      <p className="font-medium text-slate-600">
                        {item.jamPulang}
                      </p>

                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-4">

                      <div className="flex flex-wrap items-center gap-2">

                        <StatusBadge status={item.status} />

                        {item.isWfh &&
                          ["Hadir", "Terlambat"].includes(
                            item.status,
                          ) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                              <Home size={12} />
                              WFH
                            </span>
                          )}

                      </div>

                    </td>

                    {/* DETAIL */}

                    <td className="px-4 py-4 text-center">

                      <Link
                        to="/admin/kehadiran"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Lihat
                        <ArrowRight size={13} />
                      </Link>

                    </td>

                  </tr>
                ))}

                {attendance.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center"
                    >
                      <Users
                        size={35}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <p className="font-semibold text-slate-500">
                        Belum ada data siswa
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Data siswa PKL akan muncul di sini.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* =================================================
            QUICK ACTION
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-bold text-[#073b9e]">
                Aksi Cepat
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Menu yang sering digunakan
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#073b9e]">
              <ArrowRight size={17} />
            </div>

          </div>

          <div className="mt-5 space-y-3">

            <QuickAction
              to="/admin/anak-pkl"
              icon={<Users size={19} />}
              text="Kelola Siswa PKL"
            />

            <QuickAction
              to="/admin/kehadiran"
              icon={<Camera size={19} />}
              text="Lihat Kehadiran"
            />

            <QuickAction
              to="/admin/pengajuan"
              icon={<ClipboardList size={19} />}
              text="Pengajuan Izin & Sakit"
            />

            <QuickAction
              to="/admin/riwayat"
              icon={<Clock3 size={19} />}
              text="Lihat Riwayat"
            />

            <QuickAction
              to="/admin/rekap"
              icon={<BarChart3 size={19} />}
              text="Rekap & Export"
            />

          </div>

          {/* =================================================
              LOCATION CARD
          ================================================= */}

          <div className="group relative mt-5 overflow-hidden rounded-[20px] bg-[#073b9e] p-5 text-white shadow-lg">

            {/* Decorative */}

            <div className="pointer-events-none absolute -right-10 -top-14 h-28 w-28 rounded-full bg-white/10" />

            <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full border-[18px] border-white/5" />

            <div className="relative">

              {/* HEADER */}

              <div className="flex items-center gap-3">

                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">

                  <div className="absolute h-8 w-8 rounded-full bg-white/10 transition group-hover:scale-125" />

                  <MapPin
                    size={21}
                    className="relative"
                  />

                </div>

                <div>

                  <h2 className="font-bold">
                    Lokasi Presensi
                  </h2>

                  <p className="mt-0.5 text-xs text-blue-200">
                    Lokasi sistem saat ini
                  </p>

                </div>

              </div>

              {/* DIVIDER */}

              <div className="my-4 h-px bg-white/10" />

              {/* LOCATION */}

              <div className="flex items-start gap-3">

                <Navigation
                  size={17}
                  className="mt-0.5 shrink-0 text-blue-200"
                />

                <div>

                  <p className="text-xs text-blue-200">
                    Lokasi terdaftar
                  </p>

                  <p className="mt-0.5 text-sm font-semibold">
                    {settings?.lokasi ||
                      "Kantor PUPR, Jakarta"}
                  </p>

                </div>

              </div>

              {/* STATUS */}

              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.07] px-3.5 py-3">

                <div className="flex items-center gap-2">

                  <span className="relative flex h-2.5 w-2.5">

                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />

                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />

                  </span>

                  <span className="text-xs font-medium text-blue-50">
                    Sistem aktif
                  </span>

                </div>

                <span className="text-[11px] text-blue-200">
                  Online
                </span>

              </div>

              {/* BOTTOM */}

              <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-200">

                <ShieldCheck size={14} />

                <span>
                  Presensi berbasis lokasi
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   BAR ICON
========================================================= */

function BarIcon() {
  return (
    <div className="flex items-end gap-1 text-[#073b9e]">
      <span className="h-4 w-1.5 rounded bg-current" />
      <span className="h-6 w-1.5 rounded bg-current" />
      <span className="h-3 w-1.5 rounded bg-current" />
      <span className="h-7 w-1.5 rounded bg-current" />
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function Legend({ color, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">

      <span
        className={`h-3 w-3 shrink-0 rounded-full ${color}`}
      />

      <span className="whitespace-nowrap text-slate-600">
        {label}
      </span>

      <strong className="whitespace-nowrap text-[#073b9e]">
        {value}
      </strong>

    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#073b9e] hover:shadow-sm"
    >

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#073b9e] shadow-sm transition group-hover:bg-blue-100">
        {icon}
      </span>

      <span className="min-w-0 truncate">
        {text}
      </span>

      <ArrowRight
        size={15}
        className="ml-auto shrink-0 transition-transform group-hover:translate-x-1"
      />

    </Link>
  );
}