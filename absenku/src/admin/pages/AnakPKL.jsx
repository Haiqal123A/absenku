import { useState } from "react";
import {
  Search,
  Plus,
  Users,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";

import { useStudents, useAdminSettings } from "../data";
import ScheduleInfo from "../components/ScheduleInfo";

const wfhOptions = [
  ["senin", "Senin"],
  ["selasa", "Selasa"],
  ["rabu", "Rabu"],
  ["kamis", "Kamis"],
  ["jumat", "Jumat"],
];

const emptyForm = {
  nama: "",
  nis: "",
  password: "",
  kelas: "",
  sekolah: "",
  jurusan: "",
  email: "",
  noHp: "",
  pembimbing: "",
  status: "Belum Absen",
  statusAkun: "Aktif",
  wfhDays: [],
};

export default function AnakPKL() {
  const [data, setData] = useStudents();
  const [settings] = useAdminSettings();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((item) =>
    `
      ${item.nama || ""}
      ${item.nis || ""}
      ${item.kelas || ""}
      ${item.sekolah || ""}
      ${item.jurusan || ""}
      ${item.email || ""}
      ${item.noHp || ""}
      ${item.pembimbing || ""}
    `
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setForm({ ...emptyForm });
  }

  function bukaTambah() {
    setEditingStudent(null);
    resetForm();
    setShowForm(true);
  }

  function tutupTambah() {
    setShowForm(false);
    resetForm();
  }

  function hapus() {
    if (!pendingDelete) return;

    setData(
      data.filter((item) => item.id !== pendingDelete.id)
    );

    setPendingDelete(null);
  }

  function tambahSiswa(event) {
    event.preventDefault();

    if (
      !form.nama.trim() ||
      !form.nis.trim() ||
      !form.kelas.trim() ||
      !form.password.trim()
    ) {
      return;
    }

    const newStudent = {
      ...form,
      id: Date.now(),
      jamMasuk: "-",
      jamPulang: "-",
    };

    setData([...data, newStudent]);

    resetForm();
    setShowForm(false);
  }

  function bukaEdit(student) {
    setEditingStudent(student);
    setShowForm(false);

    setForm({
      nama: student.nama || "",
      nis: student.nis || "",
      password: student.password || "",
      kelas: student.kelas || "",
      sekolah: student.sekolah || "",
      jurusan: student.jurusan || "",
      email: student.email || "",
      noHp: student.noHp || "",
      pembimbing: student.pembimbing || "",
      status: student.status || "Belum Absen",
      statusAkun: student.statusAkun || "Aktif",
      wfhDays: student.wfhDays || [],
    });
  }

  function simpanEdit(event) {
    event.preventDefault();

    if (
      !editingStudent ||
      !form.nama.trim() ||
      !form.nis.trim() ||
      !form.kelas.trim() ||
      !form.password.trim()
    ) {
      return;
    }

    setData(
      data.map((student) =>
        student.id === editingStudent.id
          ? {
              ...student,
              ...form,
            }
          : student
      )
    );

    setEditingStudent(null);
    resetForm();
  }

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Siswa PKL
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Kelola data siswa yang sedang mengikuti PKL.
          </p>
        </div>

        <button
          onClick={bukaTambah}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <Plus size={18} />
          Tambah Siswa PKL
        </button>
      </div>

      {/* JADWAL */}
      <ScheduleInfo settings={settings} />

      {/* FORM TAMBAH */}
      {showForm && (
        <form
          onSubmit={tambahSiswa}
          className="rounded-2xl border border-blue-100 bg-blue-50 p-5"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Tambah Siswa PKL
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Masukkan data lengkap siswa PKL.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">

            {/* NAMA */}
            <input
              required
              value={form.nama}
              onChange={(event) =>
                setForm({
                  ...form,
                  nama: event.target.value,
                })
              }
              placeholder="Nama siswa"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* NIS */}
            <input
              required
              value={form.nis}
              onChange={(event) =>
                setForm({
                  ...form,
                  nis: event.target.value,
                })
              }
              placeholder="NIS"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* KELAS */}
            <input
              required
              value={form.kelas}
              onChange={(event) =>
                setForm({
                  ...form,
                  kelas: event.target.value,
                })
              }
              placeholder="Kelas"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* SEKOLAH */}
            <input
              value={form.sekolah}
              onChange={(event) =>
                setForm({
                  ...form,
                  sekolah: event.target.value,
                })
              }
              placeholder="Sekolah"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* JURUSAN */}
            <input
              value={form.jurusan}
              onChange={(event) =>
                setForm({
                  ...form,
                  jurusan: event.target.value,
                })
              }
              placeholder="Jurusan"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* PEMBIMBING */}
            <input
              value={form.pembimbing}
              onChange={(event) =>
                setForm({
                  ...form,
                  pembimbing: event.target.value,
                })
              }
              placeholder="Pembimbing"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* EMAIL */}
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value,
                })
              }
              placeholder="Email"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* NO HP */}
            <input
              type="tel"
              value={form.noHp}
              onChange={(event) =>
                setForm({
                  ...form,
                  noHp: event.target.value,
                })
              }
              placeholder="No. HP"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />

            {/* PASSWORD */}
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value,
                })
              }
              placeholder="Password"
              autoComplete="new-password"
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* WFH */}
          <WfhDayPicker
            value={form.wfhDays}
            onChange={(wfhDays) =>
              setForm({
                ...form,
                wfhDays,
              })
            }
          />

          {/* BUTTON */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-[#073b9e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Simpan Siswa
            </button>

            <button
              type="button"
              onClick={tutupTambah}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* DATA SISWA */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        {/* TOP */}
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-[#073b9e]">
              <Users size={22} />
            </div>

            <div>
              <p className="font-bold text-slate-800">
                {data.length} Siswa
              </p>

              <p className="text-xs text-slate-500">
                Data Siswa PKL aktif
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Cari nama, NIS, jurusan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">

            <thead>
              <tr className="bg-blue-50 text-xs text-[#073b9e]">

                <th className="rounded-l-lg px-4 py-3">
                  Nama
                </th>

                <th className="px-4 py-3">
                  NIS
                </th>

                <th className="px-4 py-3">
                  Kelas
                </th>

                <th className="px-4 py-3">
                  Sekolah
                </th>

                <th className="px-4 py-3">
                  Jurusan
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  No. HP
                </th>

                <th className="px-4 py-3">
                  Pembimbing
                </th>

                <th className="px-4 py-3">
                  Status Akun
                </th>

                <th className="rounded-r-lg px-4 py-3">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50"
                >

                  {/* NAMA */}
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {item.nama}
                  </td>

                  {/* NIS */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.nis}
                  </td>

                  {/* KELAS */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.kelas}
                  </td>

                  {/* SEKOLAH */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.sekolah || "-"}
                  </td>

                  {/* JURUSAN */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.jurusan || "-"}
                  </td>

                  {/* EMAIL */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.email || "-"}
                  </td>

                  {/* NO HP */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.noHp || "-"}
                  </td>

                  {/* PEMBIMBING */}
                  <td className="px-4 py-4 text-slate-500">
                    {item.pembimbing || "-"}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        (item.statusAkun || "Aktif") === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.statusAkun || "Aktif"}
                    </span>
                  </td>

                  {/* AKSI */}
                  <td className="px-4 py-4">
                    <div className="flex gap-2">

                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => bukaEdit(item)}
                        aria-label={`Edit ${item.nama}`}
                        title="Edit siswa"
                        className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* HAPUS */}
                      <button
                        type="button"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Hapus ${item.nama}`}
                        title="Hapus siswa"
                        className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              Data siswa tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* ========================= */}
      {/* MODAL EDIT */}
      {/* ========================= */}

      {editingStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => {
            setEditingStudent(null);
            resetForm();
          }}
        >
          <form
            onSubmit={simpanEdit}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Data Siswa
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ubah data siswa PKL.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStudent(null);
                  resetForm();
                }}
                aria-label="Tutup form edit"
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM EDIT */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              {/* NAMA */}
              <input
                required
                value={form.nama}
                onChange={(event) =>
                  setForm({
                    ...form,
                    nama: event.target.value,
                  })
                }
                placeholder="Nama siswa"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* NIS */}
              <input
                required
                value={form.nis}
                onChange={(event) =>
                  setForm({
                    ...form,
                    nis: event.target.value,
                  })
                }
                placeholder="NIS"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* KELAS */}
              <input
                required
                value={form.kelas}
                onChange={(event) =>
                  setForm({
                    ...form,
                    kelas: event.target.value,
                  })
                }
                placeholder="Kelas"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* SEKOLAH */}
              <input
                value={form.sekolah}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sekolah: event.target.value,
                  })
                }
                placeholder="Sekolah"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* JURUSAN */}
              <input
                value={form.jurusan}
                onChange={(event) =>
                  setForm({
                    ...form,
                    jurusan: event.target.value,
                  })
                }
                placeholder="Jurusan"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* PEMBIMBING */}
              <input
                value={form.pembimbing}
                onChange={(event) =>
                  setForm({
                    ...form,
                    pembimbing: event.target.value,
                  })
                }
                placeholder="Pembimbing"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* EMAIL */}
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
                placeholder="Email"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* NO HP */}
              <input
                type="tel"
                value={form.noHp}
                onChange={(event) =>
                  setForm({
                    ...form,
                    noHp: event.target.value,
                  })
                }
                placeholder="No. HP"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
              />

              {/* PASSWORD */}
              <input
                required
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password: event.target.value,
                  })
                }
                placeholder="Password"
                autoComplete="new-password"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 sm:col-span-2"
              />

              {/* STATUS AKUN */}
              <select
                value={form.statusAkun}
                onChange={(event) =>
                  setForm({
                    ...form,
                    statusAkun: event.target.value,
                  })
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                <option value="Aktif">
                  Aktif
                </option>

                <option value="Nonaktif">
                  Nonaktif
                </option>
              </select>

            </div>

            {/* WFH */}
            <WfhDayPicker
              value={form.wfhDays}
              onChange={(wfhDays) =>
                setForm({
                  ...form,
                  wfhDays,
                })
              }
            />

            {/* BUTTON */}
            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setEditingStudent(null);
                  resetForm();
                }}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Batal
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#073b9e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Simpan Perubahan
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ========================= */}
      {/* MODAL HAPUS */}
      {/* ========================= */}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setPendingDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* ICON + CLOSE */}
            <div className="flex items-start justify-between">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle size={25} />
              </div>

              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                aria-label="Tutup dialog"
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            <h2
              id="delete-title"
              className="mt-5 text-xl font-bold text-slate-900"
            >
              Hapus data siswa?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Data{" "}
              <strong className="text-slate-700">
                {pendingDelete.nama}
              </strong>{" "}
              akan dihapus dari daftar Siswa PKL.
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={hapus}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Trash2 size={16} />
                Hapus Siswa
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/* ================================= */
/* WFH DAY PICKER */
/* ================================= */

function WfhDayPicker({ value = [], onChange }) {
  function toggleDay(day) {
    onChange(
      value.includes(day)
        ? value.filter(
            (selectedDay) => selectedDay !== day
          )
        : [...value, day]
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
      <p className="text-sm font-bold text-slate-700">
        Jadwal WFH siswa
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Pilih hari saat siswa ini bekerja dari rumah.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">

        {wfhOptions.map(([day, label]) => {
          const selected = value.includes(day);

          return (
            <label
              key={day}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                selected
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-400"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleDay(day)}
                className="sr-only"
              />

              {label}
            </label>
          );
        })}

      </div>
    </div>
  );
}