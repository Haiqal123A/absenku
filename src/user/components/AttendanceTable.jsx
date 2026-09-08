import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  MapPin,
} from "lucide-react";

const attendanceData = [
  {
    date: "Senin, 8 Sep 2025",
    time: "08:12 WIB",
    location: "Kantor PUPR Jakarta",
    status: "Hadir",
  },
  {
    date: "Jumat, 5 Sep 2025",
    time: "08:24 WIB",
    location: "Kantor PUPR Jakarta",
    status: "Hadir",
  },
  {
    date: "Kamis, 4 Sep 2025",
    time: "08:47 WIB",
    location: "Kantor PUPR Jakarta",
    status: "Terlambat",
  },
  {
    date: "Rabu, 3 Sep 2025",
    time: "08:16 WIB",
    location: "Kantor PUPR Jakarta",
    status: "Hadir",
  },
  {
    date: "Selasa, 2 Sep 2025",
    time: "08:10 WIB",
    location: "Kantor PUPR Jakarta",
    status: "Hadir",
  },
];

function AttendanceTable() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#073BBA]">
            Riwayat Presensi Terbaru
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Aktivitas presensi terakhir kamu
          </p>
        </div>

        <Link
          to="/user/riwayat"
          className="text-sm font-semibold text-[#073BBA] hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Tanggal
              </th>

              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Waktu
              </th>

              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Lokasi
              </th>

              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {attendanceData.map((item, index) => (
              <tr
                key={index}
                className="border-t border-slate-100 hover:bg-slate-50 transition"
              >
                {/* DATE */}
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-700">
                    {item.date}
                  </p>
                </td>

                {/* TIME */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock3 size={15} />
                    {item.time}
                  </div>
                </td>

                {/* LOCATION */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin
                      size={15}
                      className="text-[#073BBA]"
                    />

                    {item.location}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  {item.status === "Hadir" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                      <CheckCircle2 size={14} />
                      Hadir
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold">
                      <Clock3 size={14} />
                      Terlambat
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceTable;