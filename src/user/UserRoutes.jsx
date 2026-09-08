import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { CheckCircle, Upload, User } from "lucide-react";
import { useAdminSettings, useStudents } from "../admin/data";
import ScheduleInfo from "../admin/components/ScheduleInfo";

function UserProfile() {
  const [students, setStudents] = useStudents();
  const [settings] = useAdminSettings();
  const [nis, setNis] = useState(students[0]?.nis || "");
  const student = students.find((item) => item.nis === nis);
  const [photo, setPhoto] = useState(student?.foto || "");
  const [saved, setSaved] = useState(false);

  function pilihFoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function simpanProfil(event) {
    event.preventDefault();
    if (!student) return;

    setStudents(
      students.map((item) =>
        item.id === student.id ? { ...item, foto: photo } : item
      )
    );
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3000);
  }

  function gantiSiswa(event) {
    const nextNis = event.target.value;
    setNis(nextNis);
    setPhoto(students.find((item) => item.nis === nextNis)?.foto || "");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-3 text-[#073b9e]">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Profil User
            </h1>
            <p className="text-sm text-slate-500">
              Foto yang disimpan akan tampil di halaman admin.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ScheduleInfo settings={settings} />
        </div>

        <form onSubmit={simpanProfil} className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-slate-700">
            Pilih siswa berdasarkan NIS
            <select
              value={nis}
              onChange={gantiSiswa}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-blue-500"
            >
              {students.map((item) => (
                <option key={item.id} value={item.nis}>
                  {item.nama} - {item.nis}
                </option>
              ))}
            </select>
          </label>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center transition hover:border-blue-400">
            {photo ? (
              <img
                src={photo}
                alt={student?.nama || "Foto profil"}
                className="h-28 w-28 rounded-full object-cover"
              />
            ) : (
              <Upload className="text-slate-400" size={30} />
            )}
            <span className="mt-3 text-sm font-semibold text-slate-700">
              {photo ? "Ganti foto profil" : "Tambah foto profil"}
            </span>
            <span className="mt-1 text-xs text-slate-400">
              Kosongkan jika tidak ingin menggunakan foto
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={pilihFoto}
              className="sr-only"
            />
          </label>

          <button
            type="submit"
            disabled={!student}
            className="w-full rounded-xl bg-[#073b9e] px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Simpan Profil
          </button>
        </form>

        {saved && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">
            <CheckCircle size={18} />
            Foto profil berhasil disimpan dan disinkronkan.
          </div>
        )}
      </div>
    </div>
  );
}

function UserRoutes() {
  return (
    <Routes>
      <Route path="/user" element={<UserProfile />} />
      <Route path="/user/profile" element={<UserProfile />} />
    </Routes>
  );
}

export default UserRoutes;