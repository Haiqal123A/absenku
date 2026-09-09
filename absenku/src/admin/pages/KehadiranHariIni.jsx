import { useMemo, useState } from "react";

import {
  Camera,
  Clock3,
  Home,
  Building2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Search,
  Filter,
  X,
} from "lucide-react";

import {
  useStudents,
  useAdminSettings,
  getAttendanceStatus,
  getDisplayAttendance,
  isStudentWfhDay,
} from "../data";

import ScheduleInfo from "../components/ScheduleInfo";

/* =========================================================
   NORMALISASI LOKASI
========================================================= */

function normalizeLocation(location) {
  const value = String(location ?? "")
    .toLowerCase()
    .trim();

  if (value === "wfh" || value === "work from home" || value === "rumah") {
    return "wfh";
  }

  return "kantor";
}

/* =========================================================
   LABEL LOKASI
========================================================= */

function getLocationLabel(location) {
  return normalizeLocation(location) === "wfh" ? "WFH" : "Kantor";
}

/* =========================================================
   MAIN
========================================================= */

export default function KehadiranHariIni() {
  const [students] = useStudents();
  const [settings] = useAdminSettings();

  const [filter, setFilter] = useState("semua");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  /* =========================================================
     NORMALISASI DATA SISWA
  ========================================================= */

  const normalizedStudents = useMemo(() => {
    if (!Array.isArray(students)) {
      return [];
    }

    const now = new Date();

    return students.map((student, index) => {
      /* WFH berdasarkan jadwal WFH siswa */
      const wfhToday = isStudentWfhDay(student, now);

      const lokasiAwal =
        student?.lokasiKerja ?? student?.lokasi ?? student?.modeKerja;

      const lokasiKerja = wfhToday ? "wfh" : normalizeLocation(lokasiAwal);

      /* STATUS berdasarkan jam masuk + jadwal admin */
      const status = getAttendanceStatus(student, settings, now);

      /* JAM ABSENSI ASLI */
      const attendance = getDisplayAttendance(student, settings, now);

      return {
        ...student,

        id: student?.id ?? index + 1,

        nama: student?.nama || "Nama belum diisi",

        nis: String(student?.nis ?? "-"),

        kelas: student?.kelas || "-",

        sekolah: student?.sekolah || "-",

        jurusan: student?.jurusan || "-",

        pembimbing: student?.pembimbing || "-",

        gmail: student?.gmail || "-",

        noHp: student?.noHp || "-",

        statusAkun: student?.statusAkun || "Aktif",

        status,

        jamMasuk: attendance?.jamMasuk ?? "-",

        jamPulang: attendance?.jamPulang ?? "-",

        jadwalMasuk: attendance?.jadwalMasuk ?? "-",

        jadwalPulang: attendance?.jadwalPulang ?? "-",

        lokasiKerja,

        foto: student?.foto || null,

        wfhToday: wfhToday || lokasiKerja === "wfh",
      };
    });
  }, [students, settings]);

  /* =========================================================
     FILTER + SEARCH
  ========================================================= */

  const filteredStudents = useMemo(() => {
    const keyword = String(search ?? "")
      .toLowerCase()
      .trim();

    return normalizedStudents.filter((student) => {
      const nama = String(student?.nama ?? "").toLowerCase();

      const nis = String(student?.nis ?? "").toLowerCase();

      const kelas = String(student?.kelas ?? "").toLowerCase();

      const status = String(student?.status ?? "").toLowerCase();

      const sekolah = String(student?.sekolah ?? "").toLowerCase();

      const jurusan = String(student?.jurusan ?? "").toLowerCase();

      const pembimbing = String(student?.pembimbing ?? "").toLowerCase();

      const lokasiKerja = normalizeLocation(student?.lokasiKerja);

      const matchSearch =
        !keyword ||
        nama.includes(keyword) ||
        nis.includes(keyword) ||
        kelas.includes(keyword) ||
        status.includes(keyword) ||
        sekolah.includes(keyword) ||
        jurusan.includes(keyword) ||
        pembimbing.includes(keyword) ||
        lokasiKerja.includes(keyword);

      const matchFilter = filter === "semua" || lokasiKerja === filter;

      return matchSearch && matchFilter;
    });
  }, [normalizedStudents, search, filter]);

  /* =========================================================
     STATISTIK
  ========================================================= */

  const totalSiswa = normalizedStudents.length;

  const hadir = normalizedStudents.filter(
    (student) => student.status === "Hadir",
  ).length;

  const izin = normalizedStudents.filter(
    (student) => student.status === "Izin",
  ).length;

  const sakit = normalizedStudents.filter(
    (student) => student.status === "Sakit",
  ).length;

  const belumAbsen = normalizedStudents.filter(
    (student) => student.status === "Belum Absen",
  ).length;

  const totalWFH = normalizedStudents.filter(
    (student) => student.lokasiKerja === "wfh",
  ).length;

  const totalKantor = normalizedStudents.filter(
    (student) => student.lokasiKerja === "kantor",
  ).length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f4f8ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1450px]">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          {/* KIRI */}

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Kehadiran Hari Ini
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Pantau kehadiran siswa PKL hari ini.
            </p>
          </div>

          {/* JADWAL HARI INI */}

          <div className="w-full lg:max-w-[610px]">
            <ScheduleInfo settings={settings} />
          </div>
        </div>

        {/* =====================================================
            STATISTIK
        ===================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Anak PKL"
            value={totalSiswa}
            subtitle="siswa terdaftar"
            valueClass="text-slate-900"
          />

          <StatCard
            title="Hadir Hari Ini"
            value={hadir}
            subtitle={`dari ${totalSiswa} siswa`}
            valueClass="text-green-600"
          />

          <StatCard
            title="Izin"
            value={izin}
            subtitle="siswa hari ini"
            valueClass="text-blue-600"
          />

          <StatCard
            title="Sakit"
            value={sakit}
            subtitle="siswa hari ini"
            valueClass="text-orange-600"
          />

          <StatCard
            title="Tidak Absen"
            value={belumAbsen}
            subtitle="belum melakukan absensi"
            valueClass="text-red-600"
          />
        </div>

        {/* =====================================================
            LOKASI
        ===================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* KANTOR */}

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0645bd]">
                <Building2 size={24} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Bekerja di Kantor</p>

                <p className="text-2xl font-extrabold text-slate-700">
                  {totalKantor} siswa
                </p>
              </div>
            </div>
          </div>

          {/* WFH */}

          <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Home size={24} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Work From Home</p>

                <p className="text-2xl font-extrabold text-slate-700">
                  {totalWFH} siswa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* HEADER TABLE */}

          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Daftar Kehadiran
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Jam masuk dan pulang mengikuti data absensi siswa. Status
                  terlambat mengikuti jadwal Admin.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* SEARCH */}

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama siswa..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                  />
                </div>

                {/* FILTER */}

                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    onClick={() => setFilter("semua")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      filter === "semua"
                        ? "bg-[#0645bd] text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    Semua
                  </button>

                  <button
                    onClick={() => setFilter("kantor")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      filter === "kantor"
                        ? "bg-[#0645bd] text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Building2 size={15} />
                    Kantor
                  </button>

                  <button
                    onClick={() => setFilter("wfh")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      filter === "wfh"
                        ? "bg-[#0645bd] text-white shadow-sm"
                        : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    <Home size={15} />
                    WFH
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              DESKTOP
          =================================================== */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="bg-blue-50 text-left text-sm font-bold text-[#0645bd]">
                  <th className="px-6 py-4">Siswa</th>

                  <th className="px-5 py-4">Kelas</th>

                  <th className="px-5 py-4">Lokasi Kerja</th>

                  <th className="px-5 py-4">Jam Masuk</th>

                  <th className="px-5 py-4">Jam Pulang</th>

                  <th className="px-5 py-4">Status</th>

                  <th className="px-5 py-4 text-center">Detail</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const lokasi = normalizeLocation(student.lokasiKerja);

                  return (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* SISWA */}

                      <td className="px-6 py-5">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-left"
                        >
                          <p className="font-bold text-slate-900 hover:text-[#0645bd]">
                            {student.nama}
                          </p>

                          <p className="mt-0.5 text-sm text-slate-400">
                            NIS: {student.nis}
                          </p>
                        </button>
                      </td>

                      {/* KELAS */}

                      <td className="px-5 py-5 text-sm font-medium text-slate-600">
                        {student.kelas}
                      </td>

                      {/* LOKASI */}

                      <td className="px-5 py-5">
                        <LocationBadge location={lokasi} />
                      </td>

                      {/* JAM MASUK */}

                      <td className="px-5 py-5">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {student.jamMasuk}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Jadwal: {student.jadwalMasuk}
                          </p>
                        </div>
                      </td>

                      {/* JAM PULANG */}

                      <td className="px-5 py-5">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {student.jamPulang}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Jadwal: {student.jadwalPulang}
                          </p>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">
                        <StatusBadge status={student.status} />
                      </td>

                      {/* DETAIL */}

                      <td className="px-5 py-5 text-center">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-[#0645bd] transition hover:bg-blue-100"
                        >
                          <Camera size={17} />
                          Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ===================================================
              MOBILE
          =================================================== */}

          <div className="divide-y divide-slate-100 md:hidden">
            {filteredStudents.map((student) => {
              const lokasi = normalizeLocation(student.lokasiKerja);

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="block w-full p-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{student.nama}</p>

                      <p className="mt-1 text-sm text-slate-400">
                        NIS: {student.nis}
                        {" • "}
                        Kelas {student.kelas}
                      </p>
                    </div>

                    <Camera size={19} className="shrink-0 text-[#0645bd]" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Lokasi</p>

                      <div className="mt-1">
                        <LocationBadge location={lokasi} />
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Status</p>

                      <div className="mt-1">
                        <StatusBadge status={student.status} />
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Jam Masuk</p>

                      <p className="mt-1 font-bold text-slate-800">
                        {student.jamMasuk}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Jadwal {student.jadwalMasuk}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">Jam Pulang</p>

                      <p className="mt-1 font-bold text-slate-800">
                        {student.jamPulang}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Jadwal {student.jadwalPulang}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* EMPTY */}

          {filteredStudents.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Filter size={40} className="mx-auto mb-3 text-slate-300" />

              <p className="font-semibold text-slate-600">
                Data tidak ditemukan
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Belum ada data siswa PKL.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedStudent && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Detail Presensi
                </h3>

                <p className="text-sm text-slate-400">
                  Informasi kehadiran siswa
                </p>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={19} />
              </button>
            </div>

            {/* FOTO */}

            <div className="bg-slate-100 p-6">
              {selectedStudent.foto ? (
                <img
                  src={selectedStudent.foto}
                  alt={`Foto presensi ${selectedStudent.nama}`}
                  className="mx-auto aspect-video w-full rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400">
                  <Camera size={42} />

                  <p className="mt-3 font-medium">Belum ada foto presensi</p>

                  <p className="mt-1 text-center text-xs">
                    Foto akan muncul setelah siswa melakukan presensi.
                  </p>
                </div>
              )}
            </div>

            {/* INFO */}

            <div className="space-y-4 p-6">
              {/* NAMA */}

              <div>
                <p className="text-sm text-slate-400">Nama Siswa</p>

                <p className="font-bold text-slate-900">
                  {selectedStudent.nama}
                </p>
              </div>

              {/* NIS + KELAS */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">NIS</p>

                  <p className="font-semibold text-slate-800">
                    {selectedStudent.nis}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Kelas</p>

                  <p className="font-semibold text-slate-800">
                    {selectedStudent.kelas}
                  </p>
                </div>
              </div>

              {/* SEKOLAH + JURUSAN */}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Sekolah</p>

                  <p className="font-semibold text-slate-800">
                    {selectedStudent.sekolah}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Jurusan</p>

                  <p className="font-semibold text-slate-800">
                    {selectedStudent.jurusan}
                  </p>
                </div>
              </div>

              {/* JAM ABSENSI */}

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-400">Jam Masuk</p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {selectedStudent.jamMasuk}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Jadwal: {selectedStudent.jadwalMasuk}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-400">Jam Pulang</p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {selectedStudent.jamPulang}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Jadwal: {selectedStudent.jadwalPulang}
                  </p>
                </div>
              </div>

              {/* LOKASI + STATUS */}

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-sm text-slate-400">Lokasi Kerja</p>

                  <div className="mt-1">
                    <LocationBadge location={selectedStudent.lokasiKerja} />
                  </div>
                </div>

                <div>
                  <p className="text-right text-sm text-slate-400">Status</p>

                  <div className="mt-1">
                    <StatusBadge status={selectedStudent.status} />
                  </div>
                </div>
              </div>

              {/* LOKASI PRESENSI */}

              <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0645bd]">
                  {normalizeLocation(selectedStudent.lokasiKerja) === "wfh" ? (
                    <Home size={20} />
                  ) : (
                    <MapPin size={20} />
                  )}
                </div>

                <div>
                  <p className="text-xs text-slate-400">Lokasi Presensi</p>

                  <p className="font-semibold text-slate-800">
                    {normalizeLocation(selectedStudent.lokasiKerja) === "wfh"
                      ? "Work From Home"
                      : settings?.lokasi || "Kantor PUPR, Jakarta"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
   TANPA KOTAK ICON ABU-ABU
   ISI RATA KIRI
========================================================= */

function StatCard({ title, value, subtitle, valueClass = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-left">
        <p className="text-sm font-medium text-slate-500">{title}</p>

        <p className={`mt-1 text-3xl font-extrabold ${valueClass}`}>{value}</p>

        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

/* =========================================================
   LOCATION BADGE
========================================================= */

function LocationBadge({ location }) {
  const normalizedLocation = normalizeLocation(location);

  const isWFH = normalizedLocation === "wfh";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isWFH ? "bg-cyan-50 text-cyan-700" : "bg-blue-50 text-[#0645bd]"
      }`}
    >
      {isWFH ? <Home size={14} /> : <Building2 size={14} />}

      {getLocationLabel(normalizedLocation)}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const safeStatus = String(status ?? "Belum Absen");

  /* HADIR */

  if (safeStatus === "Hadir") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        <CheckCircle2 size={14} />
        Hadir
      </span>
    );
  }

  /* TERLAMBAT */

  if (safeStatus === "Terlambat") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700">
        <Clock3 size={14} />
        Terlambat
      </span>
    );
  }

  /* IZIN */

  if (safeStatus === "Izin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <AlertCircle size={14} />
        Izin
      </span>
    );
  }

  /* SAKIT */

  if (safeStatus === "Sakit") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
        <XCircle size={14} />
        Sakit
      </span>
    );
  }

  /* TIDAK HADIR */

  if (safeStatus === "Tidak Hadir") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        <XCircle size={14} />
        Tidak Hadir
      </span>
    );
  }

  /* BELUM ABSEN */

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
      <AlertCircle size={14} />
      Belum Absen
    </span>
  );
}
