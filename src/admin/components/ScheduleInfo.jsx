import { Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { getTodaySchedule } from "../data";

function minutes(value) {
  const [hours, minute] = value.split(":").map(Number);
  return hours * 60 + minute;
}

export default function ScheduleInfo({
  settings,
  showLateLink = false,
  lateCount = 0,
}) {
  const schedule = getTodaySchedule(settings);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const schedulePassed =
    schedule && currentMinutes >= minutes(schedule.masuk);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
      <div className="rounded-xl bg-white p-2 text-[#073b9e]">
        <Clock3 size={20} />
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500">Jadwal hari ini</p>
        {schedule ? (
          <p className="text-sm font-bold text-[#073b9e]">
            Jam masuk {schedule.masuk} - Jam pulang {schedule.pulang}
          </p>
        ) : (
          <p className="text-sm font-bold text-slate-600">Tidak ada jadwal</p>
        )}
      </div>
      </div>

      {showLateLink && schedulePassed && lateCount > 0 && (
        <Link
          to="/admin/kehadiran?status=terlambat"
          className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-yellow-950 transition hover:bg-yellow-300"
        >
          Lihat yang Terlambat
        </Link>
      )}

      {showLateLink && schedulePassed && lateCount === 0 && (
        <span className="text-sm font-semibold text-green-700">
          Tidak ada yang terlambat
        </span>
      )}
    </div>
  );
}