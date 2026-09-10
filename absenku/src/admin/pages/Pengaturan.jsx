import {
  Save,
  User,
  MapPin,
  Clock3,
  CheckCircle,
  RotateCcw,
  Building2,
  CalendarDays,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useAdminSettings } from "../data";

const defaultSchedule = {
  senin: { masuk: "08:00", pulang: "16:00" },
  selasa: { masuk: "08:00", pulang: "16:00" },
  rabu: { masuk: "08:00", pulang: "16:00" },
  kamis: { masuk: "08:00", pulang: "16:00" },
  jumat: { masuk: "08:00", pulang: "16:00" },
};

const days = [
  ["senin", "Senin"],
  ["selasa", "Selasa"],
  ["rabu", "Rabu"],
  ["kamis", "Kamis"],
  ["jumat", "Jumat"],
];

function getMinutes(time) {
  if (!time) return 0;

  const [hour, minute] = time.split(":").map(Number);

  return hour * 60 + minute;
}

function getDuration(masuk, pulang) {
  if (!masuk || !pulang) return "-";

  const start = getMinutes(masuk);
  const end = getMinutes(pulang);

  let duration = end - start;

  if (duration < 0) {
    duration += 24 * 60;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (minutes === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${minutes} menit`;
}

export default function Pengaturan() {
  const [settings, setSettings] = useAdminSettings();

  const [nama, setNama] = useState(
    settings?.nama || "Administrator",
  );

  const [lokasi, setLokasi] = useState(
    settings?.lokasi || "Kantor PUPR, Jakarta",
  );

  const [jadwal, setJadwal] = useState(
    settings?.jadwal || defaultSchedule,
  );

  const [showSuccess, setShowSuccess] = useState(false);

  function updateSchedule(day, field, value) {
    setJadwal((current) => ({
      ...current,
      [day]: {
        ...(current[day] || {}),
        [field]: value,
      },
    }));
  }

  function gunakanPreset(masuk, pulang) {
    const nextSchedule = {};

    days.forEach(([key]) => {
      nextSchedule[key] = {
        masuk,
        pulang,
      };
    });

    setJadwal(nextSchedule);
  }

  function resetJadwal() {
    setJadwal({
      senin: { ...defaultSchedule.senin },
      selasa: { ...defaultSchedule.selasa },
      rabu: { ...defaultSchedule.rabu },
      kamis: { ...defaultSchedule.kamis },
      jumat: { ...defaultSchedule.jumat },
    });
  }

  function simpan() {
    const nextSettings = {
      ...settings,
      nama: nama.trim() || "Administrator",
      lokasi: lokasi.trim() || "Kantor PUPR, Jakarta",
      jadwal,
    };

    setNama(nextSettings.nama);
    setLokasi(nextSettings.lokasi);
    setSettings(nextSettings);

    setShowSuccess(true);

    window.setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  }

  const totalHariKerja = days.length;

  const jamPertama = jadwal?.senin?.masuk || "-";
  const jamPulangPertama = jadwal?.senin?.pulang || "-";

  return (
    <div className="min-h-screen bg-[#f5f8ff] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#073b9e]">
              <ShieldCheck size={17} />
              Sistem ABSENKU
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Pengaturan Admin
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Kelola profil administrator, lokasi presensi, dan
              jadwal kerja siswa dalam satu tempat.
            </p>
          </div>

          <button
            type="button"
            onClick={simpan}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md"
          >
            <Save size={18} />
            Simpan Pengaturan
          </button>
        </div>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <SummaryCard
            icon={<User size={20} />}
            title="Administrator"
            value={nama || "Administrator"}
            description="Profil pengelola sistem"
          />

          <SummaryCard
            icon={<Building2 size={20} />}
            title="Lokasi Presensi"
            value={lokasi || "Belum diatur"}
            description="Lokasi utama presensi"
          />

          <SummaryCard
            icon={<CalendarDays size={20} />}
            title="Hari Kerja"
            value={`${totalHariKerja} Hari / Minggu`}
            description={`Senin - Jumat • ${jamPertama} - ${jamPulangPertama}`}
          />

        </div>

        {/* =====================================================
            PROFILE + LOCATION
        ===================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* PROFILE */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#073b9e]">
                  <User size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Profil Administrator
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Informasi pengelola dashboard
                  </p>
                </div>

              </div>
            </div>

            <div className="space-y-4 p-6">

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Nama Administrator
                </label>

                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama administrator"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">

                <div className="mt-0.5 text-[#073b9e]">
                  <Info size={17} />
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Nama administrator digunakan sebagai identitas
                  pengelola sistem dan dapat ditampilkan pada
                  bagian dashboard.
                </p>

              </div>

            </div>

          </section>

          {/* LOCATION */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#073b9e]">
                  <MapPin size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Lokasi Presensi
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Lokasi utama tempat siswa melakukan presensi
                  </p>
                </div>

              </div>
            </div>

            <div className="space-y-4 p-6">

              <div>
                <label className="text-sm font-bold text-slate-700">
                  Nama Lokasi
                </label>

                <input
                  type="text"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Kantor PUPR, Jakarta"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#073b9e] shadow-sm">
                  <MapPin size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-600">
                    Lokasi aktif
                  </p>

                  <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                    {lokasi || "Belum diatur"}
                  </p>
                </div>

              </div>

            </div>

          </section>

        </div>

        {/* =====================================================
            SCHEDULE
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          {/* HEADER */}

          <div className="border-b border-slate-100 px-6 py-5 sm:px-7">

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#073b9e]">
                  <Clock3 size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Jadwal Presensi
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Jam masuk digunakan sebagai batas penentuan
                    keterlambatan.
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    gunakanPreset("08:00", "16:00")
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#073b9e]"
                >
                  08:00 - 16:00
                </button>

                <button
                  type="button"
                  onClick={() =>
                    gunakanPreset("07:30", "16:00")
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#073b9e]"
                >
                  07:30 - 16:00
                </button>

                <button
                  type="button"
                  onClick={resetJadwal}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>

              </div>

            </div>

          </div>

          {/* DAYS */}

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-5">

            {days.map(([key, label]) => {
              const current = jadwal?.[key] || {
                masuk: "08:00",
                pulang: "16:00",
              };

              return (
                <div
                  key={key}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >

                  {/* DAY */}

                  <div className="mb-4 flex items-center justify-between">

                    <div>
                      <p className="text-sm font-extrabold text-slate-800">
                        {label}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Hari kerja
                      </p>
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#073b9e] shadow-sm">
                      <CalendarDays size={15} />
                    </div>

                  </div>

                  {/* MASUK */}

                  <label className="block">
                    <span className="text-xs font-bold text-slate-500">
                      Jam masuk
                    </span>

                    <div className="relative mt-1.5">

                      <Clock3
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="time"
                        value={current.masuk || ""}
                        onChange={(event) =>
                          updateSchedule(
                            key,
                            "masuk",
                            event.target.value,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />

                    </div>
                  </label>

                  {/* PULANG */}

                  <label className="mt-3 block">
                    <span className="text-xs font-bold text-slate-500">
                      Jam pulang
                    </span>

                    <div className="relative mt-1.5">

                      <Clock3
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="time"
                        value={current.pulang || ""}
                        onChange={(event) =>
                          updateSchedule(
                            key,
                            "pulang",
                            event.target.value,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      />

                    </div>
                  </label>

                  {/* DURATION */}

                  <div className="mt-3 rounded-xl bg-white px-3 py-2.5">

                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Durasi kerja
                    </p>

                    <p className="mt-0.5 text-xs font-bold text-[#073b9e]">
                      {getDuration(
                        current.masuk,
                        current.pulang,
                      )}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

          {/* INFO */}

          <div className="border-t border-slate-100 px-6 py-5 sm:px-7">

            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#073b9e]">
                <Info size={17} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  Cara kerja jadwal
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Siswa yang melakukan presensi setelah jam masuk
                  akan otomatis dikategorikan sebagai{" "}
                  <span className="font-bold text-yellow-600">
                    Terlambat
                  </span>
                  . Jadwal ini digunakan sebagai acuan sistem
                  presensi.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            SAVE PANEL
        ===================================================== */}

        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 sm:flex-row sm:items-center sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm">
              <CheckCircle size={21} />
            </div>

            <div>
              <p className="font-bold text-slate-800">
                Semua pengaturan siap disimpan
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Pastikan jadwal dan lokasi sudah sesuai sebelum
                menyimpan.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={simpan}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md"
          >
            <Save size={18} />
            Simpan Perubahan
          </button>

        </div>

      </div>

      {/* =====================================================
          SUCCESS TOAST
      ===================================================== */}

      {showSuccess && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-40px)] max-w-sm">

          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-4 shadow-2xl">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <CheckCircle size={21} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Pengaturan berhasil disimpan
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Konfigurasi ABSENKU sudah diperbarui.
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-2 truncate text-lg font-extrabold text-slate-900">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#073b9e]">
          {icon}
        </div>

      </div>

    </div>
  );
}