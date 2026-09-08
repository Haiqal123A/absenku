import { Save, User, MapPin, Clock3, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useAdminSettings } from "../data";

const days = [
  ["senin", "Senin"],
  ["selasa", "Selasa"],
  ["rabu", "Rabu"],
  ["kamis", "Kamis"],
  ["jumat", "Jumat"],
];

export default function Pengaturan() {
  const [settings, setSettings] = useAdminSettings();
  const [nama, setNama] = useState(settings.nama);
  const [lokasi, setLokasi] = useState(settings.lokasi);
  const [jadwal, setJadwal] = useState(settings.jadwal);
  const [showSuccess, setShowSuccess] = useState(false);

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
    window.setTimeout(() => setShowSuccess(false), 3000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Pengaturan
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Atur konfigurasi sistem ABSENKU.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[#073b9e]">
              <User size={21} />
            </div>

            <h2 className="font-bold">
              Profil Administrator
            </h2>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Nama
          </label>

          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[#073b9e]">
              <MapPin size={21} />
            </div>

            <h2 className="font-bold">
              Lokasi Presensi
            </h2>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Nama Lokasi
          </label>

          <input
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[#073b9e]">
              <Clock3 size={21} />
            </div>

            <div>
              <h2 className="font-bold">Jadwal Presensi</h2>
              <p className="text-xs text-slate-500">
                Jam masuk menjadi batas penentuan keterlambatan.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {days.map(([key, label]) => (
              <div key={key} className="rounded-xl bg-slate-50 p-3">
                <p className="mb-3 text-sm font-bold text-slate-700">{label}</p>

                <label className="block text-xs font-semibold text-slate-500">
                  Jam masuk
                  <input
                    type="time"
                    value={jadwal[key].masuk}
                    onChange={(event) =>
                      setJadwal({
                        ...jadwal,
                        [key]: { ...jadwal[key], masuk: event.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="mt-3 block text-xs font-semibold text-slate-500">
                  Jam pulang
                  <input
                    type="time"
                    value={jadwal[key].pulang}
                    onChange={(event) =>
                      setJadwal({
                        ...jadwal,
                        [key]: { ...jadwal[key], pulang: event.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={simpan}
        className="flex items-center gap-2 rounded-xl bg-[#073b9e] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
      >
        <Save size={18} />
        Simpan Pengaturan
      </button>

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-4 text-sm font-semibold text-green-700 shadow-xl">
          <CheckCircle size={21} />
          Pengaturan berhasil disimpan
        </div>
      )}
    </div>
  );
}