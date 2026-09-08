import { Download, FileSpreadsheet, BarChart3 } from "lucide-react";
import { useStudents } from "../data";

function exportCSV(data) {
  const header = [
    "Nama",
    "NIS",
    "Kelas",
    "Hadir",
    "Terlambat",
    "Izin",
    "Sakit",
  ];

  const rows = [
    header,
    ...data,
  ];

  const csv = rows
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "rekap-kehadiran.csv";
  link.click();

  URL.revokeObjectURL(url);
}

export default function RekapExport() {
  const [students] = useStudents();
  const data = students.map((item) => [
    item.nama,
    item.nis,
    item.kelas,
    item.status === "Hadir" ? 1 : 0,
    item.status === "Terlambat" ? 1 : 0,
    item.status === "Izin" ? 1 : 0,
    item.status === "Sakit" ? 1 : 0,
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Rekap & Export
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Lihat ringkasan dan download data kehadiran.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card
          title="Total Kehadiran"
          value={`${students.length ? Math.round((students.filter((item) => item.status === "Hadir" || item.status === "Terlambat").length / students.length) * 100) : 0}%`}
          icon={<BarChart3 />}
        />

        <Card
          title="Total Anak PKL"
          value={students.length}
          icon={<FileSpreadsheet />}
        />

        <Card
          title="Hari Kerja"
          value="22"
          icon={<BarChart3 />}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Export Data Kehadiran
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Download data rekap dalam format CSV.
            </p>
          </div>

          <button
            onClick={() => exportCSV(data)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
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