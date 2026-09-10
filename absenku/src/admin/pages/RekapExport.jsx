import {
  Download,
  FileSpreadsheet,
  BarChart3,
  CalendarDays,
  Users,
} from "lucide-react";

import {
  useStudents,
  useAttendanceHistory,
  useAdminSettings,
  buildStudentHistory,
  countWorkdays,
  getStudentStartDate,
  getStudentEndDate,
} from "../data";

function escapeCSV(value) {
  const text = String(
    value ?? "",
  );

  return `"${text.replace(
    /"/g,
    '""',
  )}"`;
}

function exportCSV(data) {
  const header = [
    "Nama",
    "NIS",
    "Kelas",
    "Tanggal Mulai",
    "Tanggal",
    "Hari Kerja Ke",
    "Total Hari Kerja",
    "Status",
    "Jam Masuk",
    "Jam Pulang",
    "Lokasi",
  ];

  const rows = [
    header,
    ...data.map((item) => [
      item.nama,
      item.nis,
      item.kelas,
      item.tanggalMulai,
      item.tanggal,
      item.hariKerjaKe,
      item.totalHariKerja,
      item.status,
      item.jamMasuk,
      item.jamPulang,
      item.lokasiKerja,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map(escapeCSV)
        .join(","),
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type:
        "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download =
    "rekap-kehadiran-lengkap.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function RekapExport() {
  const [students] =
    useStudents();

  const {
    history: attendanceHistory =
      [],
    loading,
  } =
    useAttendanceHistory();

  const [settings] =
    useAdminSettings();

  /*
   * Buat seluruh hari kerja
   * dari awal akun sampai sekarang.
   */
  const completeHistory =
    buildStudentHistory(
      students,
      attendanceHistory,
      settings,
    );

  /*
   * TOTAL DATA HARI KERJA
   */
  const totalHariKerja =
    completeHistory.length;

  /*
   * HADIR
   */
  const hadir =
    completeHistory.filter(
      (item) =>
        item.status === "Hadir",
    ).length;

  /*
   * TERLAMBAT
   */
  const terlambat =
    completeHistory.filter(
      (item) =>
        item.status ===
        "Terlambat",
    ).length;

  /*
   * IZIN
   */
  const izin =
    completeHistory.filter(
      (item) =>
        item.status === "Izin",
    ).length;

  /*
   * SAKIT
   */
  const sakit =
    completeHistory.filter(
      (item) =>
        item.status === "Sakit",
    ).length;

  /*
   * TIDAK HADIR
   */
  const tidakHadir =
    completeHistory.filter(
      (item) =>
        item.status ===
        "Tidak Hadir",
    ).length;

  /*
   * PERSENTASE KEHADIRAN
   */
  const attendancePercentage =
    totalHariKerja
      ? Math.round(
          ((hadir +
            terlambat) /
            totalHariKerja) *
            100,
        )
      : 0;

  /*
   * HARI KERJA PER SISWA
   */
  const studentSummary =
    students.map(
      (student) => {
        const start =
          getStudentStartDate(
            student,
          );

        const end =
          getStudentEndDate(
            student,
          );

        const days =
          countWorkdays(
            start,
            end,
          );

        const records =
          completeHistory.filter(
            (item) =>
              String(
                item.user_id,
              ) ===
              String(student.id),
          );

        const hadirStudent =
          records.filter(
            (item) =>
              item.status ===
                "Hadir" ||
              item.status ===
                "Terlambat",
          ).length;

        return {
          ...student,

          totalHariKerja:
            days,

          totalHadir:
            hadirStudent,

          totalIzin:
            records.filter(
              (item) =>
                item.status ===
                "Izin",
            ).length,

          totalSakit:
            records.filter(
              (item) =>
                item.status ===
                "Sakit",
            ).length,

          totalTidakHadir:
            records.filter(
              (item) =>
                item.status ===
                "Tidak Hadir",
            ).length,
        };
      },
    );

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Rekap & Export
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Rekap seluruh hari kerja siswa
          sejak awal akun sampai akun
          dinonaktifkan.
        </p>
      </div>

      {/* STATISTIK */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card
          title="Kehadiran"
          value={`${attendancePercentage}%`}
          icon={<BarChart3 />}
        />

        <Card
          title="Hari Kerja"
          value={totalHariKerja}
          icon={<CalendarDays />}
        />

        <Card
          title="Hadir"
          value={hadir}
          icon={<Users />}
        />

        <Card
          title="Terlambat"
          value={terlambat}
          icon={<BarChart3 />}
        />

        <Card
          title="Tidak Hadir"
          value={tidakHadir}
          icon={<CalendarDays />}
        />
      </div>

      {/* STATUS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniCard
          title="Hadir"
          value={hadir}
          className="text-green-600"
        />

        <MiniCard
          title="Terlambat"
          value={terlambat}
          className="text-yellow-600"
        />

        <MiniCard
          title="Izin"
          value={izin}
          className="text-blue-600"
        />

        <MiniCard
          title="Sakit"
          value={sakit}
          className="text-orange-600"
        />
      </div>

      {/* RINGKASAN SISWA */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-bold text-slate-800">
            Hari Kerja Setiap Siswa
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Dihitung dari awal akun dibuat
            sampai tanggal akun dinonaktifkan
            atau sampai hari ini.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-blue-50 text-left text-sm font-bold text-[#0645bd]">
                <th className="px-6 py-4">
                  Siswa
                </th>

                <th className="px-5 py-4">
                  Kelas
                </th>

                <th className="px-5 py-4">
                  Hari Kerja
                </th>

                <th className="px-5 py-4">
                  Hadir
                </th>

                <th className="px-5 py-4">
                  Izin
                </th>

                <th className="px-5 py-4">
                  Sakit
                </th>

                <th className="px-5 py-4">
                  Tidak Hadir
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {studentSummary.map(
                (student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">
                        {student.nama ||
                          "-"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        NIS:{" "}
                        {student.nis ||
                          "-"}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {student.kelas ||
                        "-"}
                    </td>

                    <td className="px-5 py-5">
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-[#0645bd]">
                        {
                          student.totalHariKerja
                        }{" "}
                        hari
                      </span>
                    </td>

                    <td className="px-5 py-5 font-bold text-green-600">
                      {
                        student.totalHadir
                      }
                    </td>

                    <td className="px-5 py-5 font-bold text-blue-600">
                      {
                        student.totalIzin
                      }
                    </td>

                    <td className="px-5 py-5 font-bold text-orange-600">
                      {
                        student.totalSakit
                      }
                    </td>

                    <td className="px-5 py-5 font-bold text-red-600">
                      {
                        student.totalTidakHadir
                      }
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPORT */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Export Data Kehadiran
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Download seluruh riwayat hari
              kerja siswa dalam format CSV.
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {completeHistory.length} data
              hari kerja akan diexport.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              exportCSV(
                completeHistory,
              )
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} />

            {loading
              ? "Memuat..."
              : "Download CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function Card({
  title,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-[#073b9e]">
            {value}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-[#073b9e]">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MINI CARD
========================================================= */

function MiniCard({
  title,
  value,
  className,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p
        className={`mt-1 text-2xl font-extrabold ${className}`}
      >
        {value}
      </p>
    </div>
  );
}