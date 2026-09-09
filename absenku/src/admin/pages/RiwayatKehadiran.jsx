import { useMemo, useState } from "react";

import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Home,
  Building2,
  AlertCircle,
  XCircle,
  Search,
  X,
  MapPin,
} from "lucide-react";

import {
  useStudents,
  useAdminSettings,
  getAttendanceStatus,
  getDisplayAttendance,
  isStudentWfhDay,
} from "../data";

/* =========================================================
   NORMALISASI LOKASI
========================================================= */

function normalizeLocation(location) {
  const value = String(location ?? "")
    .toLowerCase()
    .trim();

  if (
    value === "wfh" ||
    value === "work from home" ||
    value === "rumah"
  ) {
    return "wfh";
  }

  return "kantor";
}

/* =========================================================
   LABEL LOKASI
========================================================= */

function getLocationLabel(location) {
  return normalizeLocation(location) === "wfh"
    ? "WFH"
    : "Kantor";
}

/* =========================================================
   FORMAT TANGGAL
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/* =========================================================
   FORMAT HARI
========================================================= */

function formatDay(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    weekday: "long",
  });
}

/* =========================================================
   GET DATE KEY
========================================================= */

function getDateKey(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   WEEK KEY
   SENIN = AWAL MINGGU
========================================================= */

function getWeekKey(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const day = parsed.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(parsed);

  monday.setDate(
    parsed.getDate() + diff
  );

  monday.setHours(0, 0, 0, 0);

  return getDateKey(monday);
}

/* =========================================================
   RANGE MINGGU
========================================================= */

function formatWeekRange(weekKey) {
  if (!weekKey) {
    return "Riwayat";
  }

  const monday = new Date(`${weekKey}T00:00:00`);

  if (Number.isNaN(monday.getTime())) {
    return "Riwayat";
  }

  const sunday = new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  const start =
    monday.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
      }
    );

  const end =
    sunday.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  return `${start} - ${end}`;
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const safeStatus = String(
    status ?? "Belum Absen"
  );

  if (safeStatus === "Hadir") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        <CheckCircle2 size={14} />
        Hadir
      </span>
    );
  }

  if (safeStatus === "Terlambat") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700">
        <Clock3 size={14} />
        Terlambat
      </span>
    );
  }

  if (safeStatus === "Izin") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <AlertCircle size={14} />
        Izin
      </span>
    );
  }

  if (safeStatus === "Sakit") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
        <XCircle size={14} />
        Sakit
      </span>
    );
  }

  if (safeStatus === "Tidak Hadir") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        <XCircle size={14} />
        Tidak Hadir
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
      <AlertCircle size={14} />
      Belum Absen
    </span>
  );
}

/* =========================================================
   LOCATION BADGE
========================================================= */

function LocationBadge({ location }) {
  const normalized =
    normalizeLocation(location);

  const isWFH =
    normalized === "wfh";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isWFH
          ? "bg-cyan-50 text-cyan-700"
          : "bg-blue-50 text-[#0645bd]"
      }`}
    >
      {isWFH ? (
        <Home size={14} />
      ) : (
        <Building2 size={14} />
      )}

      {getLocationLabel(normalized)}
    </span>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function RiwayatKehadiran() {
  const [students] = useStudents();
  const [settings] = useAdminSettings();

  const [search, setSearch] = useState("");

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  /* =========================================================
     NORMALISASI DATA
     
     SUMBER DATA DISAMAKAN DENGAN
     KEHADIRAN HARI INI
  ========================================================= */

  const normalizedHistory = useMemo(() => {
    if (!Array.isArray(students)) {
      return [];
    }

    const now = new Date();

    return students
      .map((student, index) => {
        /*
         * Ambil tanggal absensi dari data siswa.
         * Beberapa kemungkinan nama field didukung.
         */
        const tanggal =
          student?.tanggal ??
          student?.date ??
          student?.tanggalAbsensi ??
          student?.attendanceDate ??
          student?.createdAt ??
          student?.waktu ??
          student?.timestamp ??
          now;

        const tanggalObj =
          new Date(tanggal);

        /*
         * STATUS SAMA DENGAN
         * KEHADIRAN HARI INI
         */
        const status =
          getAttendanceStatus(
            student,
            settings,
            now
          );

        /*
         * JAM ABSENSI SAMA DENGAN
         * KEHADIRAN HARI INI
         */
        const attendance =
          getDisplayAttendance(
            student,
            settings,
            now
          );

        /*
         * WFH SAMA DENGAN
         * KEHADIRAN HARI INI
         */
        const wfhToday =
          isStudentWfhDay(
            student,
            now
          );

        const lokasiAwal =
          student?.lokasiKerja ??
          student?.lokasi ??
          student?.modeKerja;

        const lokasiKerja = wfhToday
          ? "wfh"
          : normalizeLocation(
              lokasiAwal
            );

        return {
          ...student,

          id:
            student?.id ??
            student?.attendanceId ??
            `history-${index}`,

          tanggal,

          tanggalObj,

          nama:
            student?.nama ||
            "Nama belum diisi",

          nis: String(
            student?.nis ??
              student?.NIS ??
              "-"
          ),

          kelas:
            student?.kelas ||
            "-",

          sekolah:
            student?.sekolah ||
            "-",

          jurusan:
            student?.jurusan ||
            "-",

          pembimbing:
            student?.pembimbing ||
            "-",

          gmail:
            student?.gmail ??
            student?.email ??
            "-",

          noHp:
            student?.noHp ??
            student?.nomorHp ??
            "-",

          status,

          jamMasuk:
            attendance?.jamMasuk ??
            "-",

          jamPulang:
            attendance?.jamPulang ??
            "-",

          jadwalMasuk:
            attendance?.jadwalMasuk ??
            "-",

          jadwalPulang:
            attendance?.jadwalPulang ??
            "-",

          lokasiKerja,

          lokasiPresensi:
            student?.lokasiPresensi ??
            student?.alamatPresensi ??
            student?.alamat ??
            null,

          foto:
            student?.foto ??
            student?.fotoPresensi ??
            student?.photo ??
            student?.photoUrl ??
            null,

          wfhToday:
            wfhToday ||
            lokasiKerja === "wfh",
        };
      })
      .filter((item) => {
        return (
          item.tanggalObj &&
          !Number.isNaN(
            item.tanggalObj.getTime()
          )
        );
      });
  }, [students, settings]);

  /* =========================================================
     SEARCH
========================================================= */

  const filteredHistory = useMemo(() => {
    const keyword = String(
      search ?? ""
    )
      .toLowerCase()
      .trim();

    if (!keyword) {
      return normalizedHistory;
    }

    return normalizedHistory.filter(
      (item) => {
        const fields = [
          item.nama,
          item.nis,
          item.kelas,
          item.sekolah,
          item.jurusan,
          item.pembimbing,
          item.status,
          item.lokasiKerja,
          item.lokasiPresensi,
          item.jamMasuk,
          item.jamPulang,
        ];

        return fields.some((field) =>
          String(field ?? "")
            .toLowerCase()
            .includes(keyword)
        );
      }
    );
  }, [
    normalizedHistory,
    search,
  ]);

  /* =========================================================
     SORT TERBARU
========================================================= */

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort(
      (a, b) =>
        b.tanggalObj.getTime() -
        a.tanggalObj.getTime()
    );
  }, [filteredHistory]);

  /* =========================================================
     MINGGU SEKARANG
========================================================= */

  const currentWeekKey = useMemo(
    () => getWeekKey(new Date()),
    []
  );

  /* =========================================================
     STATISTIK
========================================================= */

  const total =
    normalizedHistory.length;

  const hadir =
    normalizedHistory.filter(
      (item) =>
        item.status === "Hadir"
    ).length;

  const terlambat =
    normalizedHistory.filter(
      (item) =>
        item.status === "Terlambat"
    ).length;

  const izin =
    normalizedHistory.filter(
      (item) =>
        item.status === "Izin"
    ).length;

  const sakit =
    normalizedHistory.filter(
      (item) =>
        item.status === "Sakit"
    ).length;

  /* =========================================================
     RENDER
========================================================= */

  return (
    <div className="min-h-screen bg-[#f4f8ff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1450px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Riwayat Kehadiran
            </h1>

            <p className="mt-2 text-base text-slate-500">
              Semua data presensi siswa yang tersimpan.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0645bd]">
              <CalendarDays size={20} />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Minggu berjalan
              </p>

              <p className="text-sm font-bold text-slate-700">
                {formatWeekRange(
                  currentWeekKey
                )}
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            STATISTIK
        ================================================= */}

        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-5">

          <SimpleStat
            title="Total Presensi"
            value={total}
          />

          <SimpleStat
            title="Hadir"
            value={hadir}
            valueClass="text-green-600"
          />

          <SimpleStat
            title="Terlambat"
            value={terlambat}
            valueClass="text-yellow-600"
          />

          <SimpleStat
            title="Izin"
            value={izin}
            valueClass="text-blue-600"
          />

          <SimpleStat
            title="Sakit"
            value={sakit}
            valueClass="text-orange-600"
          />

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER TABLE */}

          <div className="border-b border-slate-200 px-5 py-5 sm:px-7">

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Daftar Riwayat
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Data menggunakan sumber absensi yang sama dengan halaman Kehadiran Hari Ini.
                </p>
              </div>

              <div className="relative w-full lg:w-72">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Cari siswa..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              DESKTOP
          ================================================= */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[1100px]">

              <thead>

                <tr className="bg-blue-50 text-left text-sm font-bold text-[#0645bd]">

                  <th className="px-6 py-4">
                    Tanggal
                  </th>

                  <th className="px-5 py-4">
                    Siswa
                  </th>

                  <th className="px-5 py-4">
                    Kelas
                  </th>

                  <th className="px-5 py-4">
                    Lokasi
                  </th>

                  <th className="px-5 py-4">
                    Masuk
                  </th>

                  <th className="px-5 py-4">
                    Pulang
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center">
                    Detail
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {sortedHistory.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* TANGGAL */}

                      <td className="px-6 py-5">

                        <p className="text-sm font-bold text-slate-800">
                          {formatDate(
                            item.tanggalObj
                          )}
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-400">
                          {formatDay(
                            item.tanggalObj
                          )}
                        </p>

                      </td>

                      {/* SISWA */}

                      <td className="px-5 py-5">

                        <p className="font-bold text-slate-900">
                          {item.nama}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          NIS: {item.nis}
                        </p>

                      </td>

                      {/* KELAS */}

                      <td className="px-5 py-5 text-sm font-medium text-slate-600">
                        {item.kelas}
                      </td>

                      {/* LOKASI */}

                      <td className="px-5 py-5">

                        <LocationBadge
                          location={
                            item.lokasiKerja
                          }
                        />

                      </td>

                      {/* MASUK */}

                      <td className="px-5 py-5">

                        <p className="text-sm font-bold text-slate-800">
                          {item.jamMasuk}
                        </p>

                        {item.jadwalMasuk &&
                          item.jadwalMasuk !== "-" && (
                            <p className="mt-1 text-xs text-slate-400">
                              Jadwal:{" "}
                              {item.jadwalMasuk}
                            </p>
                          )}

                      </td>

                      {/* PULANG */}

                      <td className="px-5 py-5">

                        <p className="text-sm font-bold text-slate-800">
                          {item.jamPulang}
                        </p>

                        {item.jadwalPulang &&
                          item.jadwalPulang !== "-" && (
                            <p className="mt-1 text-xs text-slate-400">
                              Jadwal:{" "}
                              {item.jadwalPulang}
                            </p>
                          )}

                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">

                        <StatusBadge
                          status={
                            item.status
                          }
                        />

                      </td>

                      {/* DETAIL */}

                      <td className="px-5 py-5 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRecord(
                              item
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-[#0645bd] transition hover:bg-blue-100"
                        >

                          <Camera
                            size={16}
                          />

                          Detail

                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE
          ================================================= */}

          <div className="divide-y divide-slate-100 md:hidden">

            {sortedHistory.map(
              (item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedRecord(
                      item
                    )
                  }
                  className="block w-full p-5 text-left transition hover:bg-slate-50"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="font-bold text-slate-900">
                        {item.nama}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(
                          item.tanggalObj
                        )}
                        {" • "}
                        {item.kelas}
                      </p>

                    </div>

                    <Camera
                      size={18}
                      className="shrink-0 text-[#0645bd]"
                    />

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    {/* LOKASI */}

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Lokasi
                      </p>

                      <div className="mt-1">

                        <LocationBadge
                          location={
                            item.lokasiKerja
                          }
                        />

                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Status
                      </p>

                      <div className="mt-1">

                        <StatusBadge
                          status={
                            item.status
                          }
                        />

                      </div>

                    </div>

                    {/* JAM MASUK */}

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Jam Masuk
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {item.jamMasuk}
                      </p>

                    </div>

                    {/* JAM PULANG */}

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        Jam Pulang
                      </p>

                      <p className="mt-1 font-bold text-slate-800">
                        {item.jamPulang}
                      </p>

                    </div>

                  </div>

                </button>
              )
            )}

          </div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {sortedHistory.length === 0 && (
            <div className="px-6 py-16 text-center">

              <CalendarDays
                size={42}
                className="mx-auto mb-4 text-slate-300"
              />

              <p className="font-semibold text-slate-600">
                Belum ada riwayat presensi
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
                Data riwayat menggunakan data absensi siswa yang tersimpan pada data harian.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedRecord && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedRecord(null)
          }
        >

          <div
            onClick={(e) =>
              e.stopPropagation()
            }
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  Detail Presensi
                </h3>

                <p className="text-sm text-slate-400">
                  Informasi lengkap kehadiran siswa
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRecord(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={19} />
              </button>

            </div>

            {/* FOTO */}

            <div className="bg-slate-100 p-6">

              {selectedRecord.foto ? (
                <img
                  src={
                    selectedRecord.foto
                  }
                  alt={`Foto presensi ${selectedRecord.nama}`}
                  className="mx-auto aspect-video w-full rounded-2xl object-cover shadow-sm"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400">

                  <Camera size={42} />

                  <p className="mt-3 font-medium">
                    Belum ada foto presensi
                  </p>

                  <p className="mt-1 text-center text-xs">
                    Foto akan muncul setelah siswa melakukan presensi.
                  </p>

                </div>
              )}

            </div>

            {/* DETAIL */}

            <div className="space-y-5 p-6">

              <DetailItem
                label="Nama Siswa"
                value={
                  selectedRecord.nama
                }
              />

              <div className="grid grid-cols-2 gap-4">

                <DetailItem
                  label="NIS"
                  value={
                    selectedRecord.nis
                  }
                />

                <DetailItem
                  label="Kelas"
                  value={
                    selectedRecord.kelas
                  }
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <DetailItem
                  label="Sekolah"
                  value={
                    selectedRecord.sekolah
                  }
                />

                <DetailItem
                  label="Jurusan"
                  value={
                    selectedRecord.jurusan
                  }
                />

              </div>

              <DetailItem
                label="Pembimbing"
                value={
                  selectedRecord.pembimbing
                }
              />

              <DetailItem
                label="Email"
                value={
                  selectedRecord.gmail
                }
              />

              <DetailItem
                label="No. HP"
                value={
                  selectedRecord.noHp
                }
              />

              <DetailItem
                label="Tanggal"
                value={`${formatDay(
                  selectedRecord.tanggalObj
                )}, ${formatDate(
                  selectedRecord.tanggalObj
                )}`}
              />

              {/* JAM */}

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Jam Masuk
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {
                      selectedRecord.jamMasuk
                    }
                  </p>

                  {selectedRecord.jadwalMasuk &&
                    selectedRecord.jadwalMasuk !== "-" && (
                      <p className="mt-1 text-xs text-slate-400">
                        Jadwal:{" "}
                        {
                          selectedRecord.jadwalMasuk
                        }
                      </p>
                    )}

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-400">
                    Jam Pulang
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {
                      selectedRecord.jamPulang
                    }
                  </p>

                  {selectedRecord.jadwalPulang &&
                    selectedRecord.jadwalPulang !== "-" && (
                      <p className="mt-1 text-xs text-slate-400">
                        Jadwal:{" "}
                        {
                          selectedRecord.jadwalPulang
                        }
                      </p>
                    )}

                </div>

              </div>

              {/* LOKASI + STATUS */}

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs text-slate-400">
                      Lokasi Kerja
                    </p>

                    <div className="mt-1">

                      <LocationBadge
                        location={
                          selectedRecord.lokasiKerja
                        }
                      />

                    </div>

                  </div>

                  <div>

                    <p className="text-right text-xs text-slate-400">
                      Status
                    </p>

                    <div className="mt-1">

                      <StatusBadge
                        status={
                          selectedRecord.status
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* LOKASI PRESENSI */}

              <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0645bd]">

                  {normalizeLocation(
                    selectedRecord.lokasiKerja
                  ) === "wfh" ? (
                    <Home size={20} />
                  ) : (
                    <MapPin size={20} />
                  )}

                </div>

                <div className="min-w-0">

                  <p className="text-xs text-slate-400">
                    Lokasi Presensi
                  </p>

                  <p className="break-words font-semibold text-slate-800">

                    {selectedRecord.lokasiPresensi ||
                      (normalizeLocation(
                        selectedRecord.lokasiKerja
                      ) === "wfh"
                        ? "Work From Home"
                        : settings?.lokasi ||
                          "Kantor PUPR, Jakarta")}

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
   SIMPLE STAT
========================================================= */

function SimpleStat({
  title,
  value,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p
        className={`mt-1 text-3xl font-extrabold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-slate-800">
        {value || "-"}
      </p>

    </div>
  );
}