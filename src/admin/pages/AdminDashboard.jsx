import {
  Users,
  Clock3,
  Camera,
  BarChart3,
  MapPin,
  CalendarDays,
  TrendingUp,
  ArrowRight,
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
import puLogo from "../../assets/pu.png";
import ScheduleInfo from "../components/ScheduleInfo";

function StatusBadge({ status }) {
  const styles = {
    Hadir: "bg-green-100 text-green-700",
    Terlambat: "bg-yellow-100 text-yellow-700",
    Izin: "bg-blue-100 text-blue-700",
    Sakit: "bg-orange-100 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function AdminDashboard() {
  const [students] = useStudents();
  const [settings] = useAdminSettings();
  const lateStudents = getLateStudents(students, settings);
  const hadir = students.filter(
    (item) => ["Hadir", "Terlambat"].includes(getAttendanceStatus(item, settings)),
  ).length;
  const sakit = students.filter(
    (item) => getAttendanceStatus(item, settings) === "Sakit",
  ).length;
  const izin = students.filter(
    (item) => getAttendanceStatus(item, settings) === "Izin",
  ).length;
  const tidakAbsen = students.filter(
    (item) => getAttendanceStatus(item, settings) === "Belum Absen",
  ).length;
  const stats = [
    { title: "Total Anak PKL", value: students.length, subtitle: "siswa terdaftar", bg: "bg-blue-50", color: "text-blue-700" },
    { title: "Hadir Hari Ini", value: hadir, subtitle: `dari ${students.length} siswa`, bg: "bg-green-50", color: "text-green-700" },
    { title: "Izin", value: izin, subtitle: "siswa hari ini", bg: "bg-blue-50", color: "text-blue-700" },
    { title: "Sakit", value: sakit, subtitle: "siswa hari ini", bg: "bg-orange-50", color: "text-orange-700" },
    { title: "Tidak Absen", value: tidakAbsen, subtitle: "belum melakukan absensi", bg: "bg-red-50", color: "text-red-700" },
  ];
  const attendance = students.map((student) => ({
    ...getAttendance(getDisplayAttendance(student, settings)),
    status: getAttendanceStatus(student, settings),
  }));
  const persentase = students.length
    ? Math.round((hadir / students.length) * 100)
    : 0;
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = dayNames[new Date().getDay()];
  const chartData = dayNames.slice(1).concat("Min").map((day) => ({
    day,
    value: day === today ? hadir : 0,
    izin: day === today ? izin : 0,
    sakit: day === today ? sakit : 0,
    tidakAbsen: day === today ? tidakAbsen : 0,
  }));

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#073b9e] to-[#0d54c7] p-4 text-white shadow-sm sm:p-5 md:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-100">
              Selamat datang,
            </p>

            <h1 className="text-2xl font-extrabold sm:text-3xl md:text-4xl">
              {settings.nama} 
            </h1>

            <p className="mt-2 text-sm text-blue-100 md:text-base">
              Pantau dan kelola kehadiran seluruh Siswa PKL.
            </p>

            <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
              <CalendarDays size={17} />
              Selasa, 9 September 2025
            </div>
          </div>

          <div className="hidden h-32 w-64 overflow-hidden rounded-2xl bg-[#ffd51c] md:block">
            <img
              src={puLogo}
              alt="Logo PU"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <ScheduleInfo
        settings={settings}
        showLateLink
        lateCount={lateStudents.length}
      />

      {/* STATS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((item) => {
          return (
            <div
              key={item.title}
              className={`rounded-2xl border border-slate-200 ${item.bg} p-5 shadow-sm`}
            >
              <div>
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {item.title}
                  </p>

                  <p className={`mt-2 text-3xl font-extrabold ${item.color}`}>
                    {item.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.subtitle}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </section>

      {lateStudents.length > 0 && (
        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-yellow-900">
                Pemberitahuan Keterlambatan
              </h2>
              <p className="mt-1 text-sm text-yellow-800">
                {lateStudents.length} siswa terlambat masuk hari ini.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {lateStudents.map((student) => (
                <span
                  key={student.id}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-yellow-900 shadow-sm"
                >
                  {student.nama}
                  {student.jamMasuk && student.jamMasuk !== "-"
                    ? ` - ${student.jamMasuk}`
                    : ""}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CHART + PERCENTAGE */}
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
                Statistik kehadiran Siswa PKL minggu ini
              </p>
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
                      height: `${(item.value / Math.max(students.length, 1)) * 85}%`,
                    }}
                    title={`${item.value} hadir`}
                  />
                </div>

                <div className="flex h-full items-end">
                  <div
                    className="w-6 rounded-t-md bg-blue-400"
                    style={{
                      height: `${(item.izin / Math.max(students.length, 1)) * 85}%`,
                    }}
                    title={`${item.izin} izin`}
                  />
                </div>

                <div className="flex h-full items-end">
                  <div
                    className="w-6 rounded-t-md bg-orange-400"
                    style={{
                      height: `${(item.sakit / Math.max(students.length, 1)) * 85}%`,
                    }}
                    title={`${item.sakit} sakit`}
                  />
                </div>

                <div className="flex h-full items-end">
                  <div
                    className="w-6 rounded-t-md bg-red-500"
                    style={{
                      height: `${(item.tidakAbsen / Math.max(students.length, 1)) * 85}%`,
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
            <TrendingUp size={21} className="text-[#073b9e]" />

            <h2 className="font-bold text-[#073b9e]">
              Persentase Kehadiran
            </h2>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <div
              className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full sm:h-40 sm:w-40"
              style={{
                background:
                  `conic-gradient(#073b9e 0deg ${(hadir / Math.max(students.length, 1)) * 360}deg, #60a5fa ${(hadir / Math.max(students.length, 1)) * 360}deg ${((hadir + izin) / Math.max(students.length, 1)) * 360}deg, #fb923c ${((hadir + izin) / Math.max(students.length, 1)) * 360}deg ${((hadir + izin + sakit) / Math.max(students.length, 1)) * 360}deg, #ef4444 ${((hadir + izin + sakit) / Math.max(students.length, 1)) * 360}deg 360deg)`,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white">
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

          <div className="mt-7 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">
                Total Siswa PKL
              </span>

              <strong className="text-[#073b9e]">
                {students.length} siswa
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* TABLE + QUICK ACTION */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[2fr_1fr]">

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-bold text-[#073b9e]">
                Kehadiran Terbaru
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Data absensi Siswa PKL hari ini
              </p>
            </div>

            <Link
              to="/admin/kehadiran"
              className="flex items-center gap-1 text-sm font-semibold text-[#073b9e] hover:underline"
            >
              Lihat Semua
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full min-w-[760px] text-left text-sm">
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
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {item.foto && (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        )}

                        <div>
                          <p className="font-medium text-slate-700">
                            {item.nama}
                          </p>
                          <p className="text-xs text-slate-500">
                            NIS: {item.nis}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {item.kelas}
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {item.jamMasuk}
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {item.jamPulang}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={item.status} />
                        {isStudentWfhDay(item) &&
                          ["Hadir", "Terlambat"].includes(item.status) && (
                            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                              WFH
                            </span>
                          )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <Link
                        to="/admin/kehadiran"
                        className="inline-flex rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK ACTION */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-[#073b9e]">
            Aksi Cepat
          </h2>

          <div className="mt-4 space-y-3">
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

          <div className="mt-5 rounded-xl bg-[#073b9e] p-5 text-white">
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span className="font-semibold">
                Lokasi Presensi
              </span>
            </div>

            <p className="mt-2 text-sm text-blue-100">
              Kantor PUPR, Jakarta
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Sistem aktif
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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

function Legend({ color, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${color}`} />

      <span className="whitespace-nowrap text-slate-600">
        {label}
      </span>

      <strong className="text-[#073b9e]">
        {value}
      </strong>
    </div>
  );
}

function QuickAction({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#073b9e]"
    >
      <span className="text-[#073b9e]">
        {icon}
      </span>

      {text}

      <ArrowRight size={15} className="ml-auto" />
    </Link>
  );
}