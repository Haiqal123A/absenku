import { useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  FileText,
  CheckCircle2,
  Clock3,
  CircleAlert,
  BriefcaseBusiness,
  ChevronDown,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";

const laporanData = [
  {
    tanggal: "09 Sep 2026",
    hari: "Selasa",
    masuk: "07:43",
    pulang: "16:07",
    durasi: "8j 24m",
    status: "Hadir",
  },
  {
    tanggal: "08 Sep 2026",
    hari: "Senin",
    masuk: "07:51",
    pulang: "16:02",
    durasi: "8j 11m",
    status: "Hadir",
  },
  {
    tanggal: "05 Sep 2026",
    hari: "Jumat",
    masuk: "07:45",
    pulang: "15:55",
    durasi: "8j 10m",
    status: "Hadir",
  },
  {
    tanggal: "04 Sep 2026",
    hari: "Kamis",
    masuk: "07:39",
    pulang: "16:08",
    durasi: "8j 29m",
    status: "Hadir",
  },
  {
    tanggal: "03 Sep 2026",
    hari: "Rabu",
    masuk: "08:06",
    pulang: "16:03",
    durasi: "7j 57m",
    status: "Terlambat",
  },
  {
    tanggal: "02 Sep 2026",
    hari: "Selasa",
    masuk: "07:48",
    pulang: "16:10",
    durasi: "8j 22m",
    status: "Hadir",
  },
  {
    tanggal: "01 Sep 2026",
    hari: "Senin",
    masuk: "07:42",
    pulang: "16:05",
    durasi: "8j 23m",
    status: "Hadir",
  },
];

const periodeOptions = [
  "September 2026",
  "Agustus 2026",
  "Juli 2026",
];

function Laporan() {
  const [periode, setPeriode] = useState("September 2026");

  const summary = useMemo(() => {
    const hadir = laporanData.filter(
      (item) => item.status === "Hadir"
    ).length;

    const terlambat = laporanData.filter(
      (item) => item.status === "Terlambat"
    ).length;

    return {
      hariKerja: 22,
      hadir: 18,
      terlambat,
      izin: 1,
      persentase: 82,
    };
  }, []);

  const handleDownload = () => {
    const headers = [
      "Tanggal",
      "Hari",
      "Jam Masuk",
      "Jam Pulang",
      "Durasi",
      "Status",
    ];

    const rows = laporanData.map((item) => [
      item.tanggal,
      item.hari,
      item.masuk,
      item.pulang,
      item.durasi,
      item.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-kehadiran-${periode
      .toLowerCase()
      .replace(/\s+/g, "-")}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Total Hari Kerja",
      value: summary.hariKerja,
      description: "Hari kerja",
      icon: BriefcaseBusiness,
      iconWrapper: "bg-blue-50 text-[#073BBA]",
    },
    {
      label: "Hadir",
      value: summary.hadir,
      description: "Hari hadir",
      icon: CheckCircle2,
      iconWrapper: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Terlambat",
      value: summary.terlambat,
      description: "Hari terlambat",
      icon: Clock3,
      iconWrapper: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Izin",
      value: summary.izin,
      description: "Hari izin",
      icon: CircleAlert,
      iconWrapper: "bg-red-50 text-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      <UserNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-7 sm:px-6 lg:px-8 lg:pb-10 lg:pt-9">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <FileText
                  size={16}
                  className="text-[#073BBA]"
                />
              </div>

              <span className="text-sm font-semibold text-[#073BBA]">
                Laporan
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0B2875] sm:text-3xl">
              Laporan Kehadiran
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Pantau rekapitulasi dan riwayat kehadiran kamu
              selama periode yang dipilih.
            </p>
          </div>

          {/* FILTER + DOWNLOAD */}
          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#073BBA]"
              />

              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#073BBA] focus:ring-2 focus:ring-blue-100 sm:w-[190px]"
              >
                {periodeOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              onClick={handleDownload}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#073BBA] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f94] active:scale-[0.98]"
            >
              <Download size={16} />
              Download Laporan
            </button>

          </div>
        </section>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">

                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      {item.label}
                    </p>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0B2875] sm:text-3xl">
                        {item.value}
                      </span>

                      <span className="text-[11px] text-slate-400">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconWrapper}`}
                  >
                    <Icon size={18} />
                  </div>

                </div>
              </div>
            );
          })}

        </section>

        {/* =====================================================
            ATTENDANCE OVERVIEW
        ===================================================== */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Ringkasan Kehadiran
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#0B2875]">
                Tingkat kehadiran kamu
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Rekap kehadiran untuk periode {periode}.
              </p>
            </div>

            <div className="flex items-center gap-4">

              <div className="relative h-16 w-16 shrink-0">
                <svg
                  className="h-16 w-16 -rotate-90"
                  viewBox="0 0 64 64"
                >
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    className="text-slate-100"
                  />

                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="163.36"
                    strokeDashoffset={
                      163.36 -
                      (163.36 * summary.persentase) / 100
                    }
                    className="text-[#073BBA]"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#0B2875]">
                    {summary.persentase}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {summary.hadir} dari {summary.hariKerja} hari
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Kehadiran tercatat dengan baik
                </p>
              </div>

            </div>

          </div>

          {/* PROGRESS */}
          <div className="mt-6">

            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Progress kehadiran
              </span>

              <span className="text-xs font-semibold text-[#073BBA]">
                {summary.persentase}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#073BBA] transition-all duration-500"
                style={{
                  width: `${summary.persentase}%`,
                }}
              />
            </div>

          </div>

        </section>

        {/* =====================================================
            DETAIL PRESENSI
        ===================================================== */}
        <section className="mt-8">

          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-[#0B2875]">
                Riwayat Presensi
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Detail waktu kehadiran yang tercatat pada sistem.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-400">
              {laporanData.length} data ditampilkan
            </span>

          </div>

          {/* =====================================================
              DESKTOP TABLE
          ===================================================== */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jam Masuk
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jam Pulang
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Durasi Kerja
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {laporanData.map((item, index) => (

                    <tr
                      key={`${item.tanggal}-${index}`}
                      className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/60"
                    >

                      {/* TANGGAL */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            <CalendarDays
                              size={16}
                              className="text-[#073BBA]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {item.tanggal}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {item.hari}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* MASUK */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-[#073BBA]" />

                          <span className="text-sm font-semibold text-slate-700">
                            {item.masuk}
                          </span>

                        </div>

                      </td>

                      {/* PULANG */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-slate-300" />

                          <span className="text-sm font-semibold text-slate-700">
                            {item.pulang}
                          </span>

                        </div>

                      </td>

                      {/* DURASI */}
                      <td className="px-6 py-5">

                        <span className="text-sm font-medium text-slate-500">
                          {item.durasi}
                        </span>

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5 text-right">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                            item.status === "Hadir"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-yellow-50 text-yellow-600"
                          }`}
                        >

                          {item.status === "Hadir" ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <Clock3 size={12} />
                          )}

                          {item.status}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* =====================================================
              MOBILE LIST
          ===================================================== */}
          <div className="space-y-3 md:hidden">

            {laporanData.map((item, index) => (

              <div
                key={`${item.tanggal}-mobile-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <CalendarDays
                        size={17}
                        className="text-[#073BBA]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#0B2875]">
                        {item.tanggal}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.hari}
                      </p>
                    </div>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      item.status === "Hadir"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {item.status}
                  </span>

                </div>

                <div className="mt-5 grid grid-cols-3 border-t border-slate-100 pt-4">

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Masuk
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.masuk}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Pulang
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.pulang}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Durasi
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {item.durasi}
                    </p>
                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* =====================================================
            FOOTER INFO
        ===================================================== */}
        <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">

          <div className="flex items-start gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
              <FileText
                size={16}
                className="text-[#073BBA]"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0B2875]">
                Informasi Laporan
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Data yang ditampilkan saat ini merupakan data
                sementara untuk kebutuhan pengembangan sistem.
                Setelah API terhubung, laporan akan otomatis
                menggunakan data presensi yang tersimpan di
                database.
              </p>
            </div>

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5">

          <p className="text-xs text-slate-400">
            Absenku · Laporan Kehadiran
          </p>

          <p className="hidden text-xs text-slate-400 sm:block">
            Data diperbarui secara berkala
          </p>

        </div>

      </main>
    </div>
  );
}

export default Laporan;