import { BarChart3 } from "lucide-react";

const data = [
  { day: "Sen", date: "1 Sep", hadir: 17, terlambat: 1 },
  { day: "Sel", date: "2 Sep", hadir: 17, terlambat: 1 },
  { day: "Rab", date: "3 Sep", hadir: 17, terlambat: 1 },
  { day: "Kam", date: "4 Sep", hadir: 17, terlambat: 2 },
  { day: "Jum", date: "5 Sep", hadir: 18, terlambat: 2 },
  { day: "Sab", date: "6 Sep", hadir: 18, terlambat: 2 },
  { day: "Min", date: "7 Sep", hadir: 18, terlambat: 2 },
];

function AttendanceChart() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <BarChart3
            size={22}
            className="text-[#073BBA]"
          />

          <h2 className="font-bold text-[#073BBA]">
            Grafik Kehadiran
          </h2>

        </div>


        {/* PERIODE */}
        <div className="flex items-center bg-blue-50 rounded-full p-1 text-xs">

          <button className="px-4 py-2 rounded-full bg-[#073BBA] text-white font-medium">
            7 Hari
          </button>

          <button className="px-4 py-2 text-[#073BBA]">
            30 Hari
          </button>

          <button className="px-4 py-2 text-[#073BBA]">
            1 Tahun
          </button>

        </div>

      </div>


      {/* LEGEND */}
      <div className="flex justify-end gap-5 mt-5 text-xs text-slate-500">

        <div className="flex items-center gap-2">

          <span className="w-2.5 h-2.5 rounded-full bg-[#073BBA]" />

          Hadir

        </div>

        <div className="flex items-center gap-2">

          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD21A]" />

          Terlambat

        </div>

      </div>


      {/* CHART */}
      <div className="mt-5 h-[250px] flex items-end gap-4 border-b border-slate-200 px-4">

        {data.map((item) => (

          <div
            key={item.day}
            className="flex-1 h-full flex flex-col justify-end items-center"
          >

            {/* BATANG */}
            <div className="flex items-end justify-center gap-1 h-[200px]">

              <div
                className="w-7 bg-[#073BBA] rounded-t-md"
                style={{
                  height: `${item.hadir * 9}px`,
                }}
              />

              <div
                className="w-5 bg-[#FFD21A] rounded-t-md"
                style={{
                  height: `${item.terlambat * 9}px`,
                }}
              />

            </div>


            {/* LABEL */}
            <p className="text-xs text-slate-600 font-medium mt-2">
              {item.day}
            </p>

            <p className="text-[10px] text-slate-400">
              {item.date}
            </p>

          </div>

        ))}

      </div>

    </div>
  );
}

export default AttendanceChart;