import {
  User,
  School,
  BriefcaseBusiness,
  Mail,
  CreditCard,
  Phone,
  VenusAndMars,
  CalendarDays,
  MapPin,
  Pencil,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import UserNavbar from "../components/UserNavbar";
import { authApi } from "../../lib/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    school: "",
    major: "",
    phone: "",
    gender: "",
    birth_date: "",
    birth_place: "",
  });

  useEffect(() => {
    authApi
      .me()
      .then(({ user }) => {
        setProfile(user);
        setForm({
          full_name: user.full_name || "",
          school: user.school || "",
          major: user.major || "",
          phone: user.phone || "",
          gender: user.gender || "",
          birth_date: user.birth_date || "",
          birth_place: user.birth_place || "",
        });
        localStorage.setItem("absenku_user", JSON.stringify(user));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const startEditing = () => {
    setForm({
      full_name: profile?.full_name || "",
      school: profile?.school || "",
      major: profile?.major || "",
      phone: profile?.phone || "",
      gender: profile?.gender || "",
      birth_date: profile?.birth_date || "",
      birth_place: profile?.birth_place || "",
    });
    setEditing(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result = await authApi.updateMe(form);
      setProfile(result.user);
      localStorage.setItem("absenku_user", JSON.stringify(result.user));
      setEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const displayProfile = profile || {};
  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      <UserNavbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 lg:pb-8">
        {/* =========================
            HEADER
        ========================== */}

        <section className="mb-5 sm:mb-7">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-[#073BBA] font-medium">Profil</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B2875]">
              Profil Saya
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Informasi data diri dan identitas peserta PKL.
            </p>
          </div>
        </section>

        {/* =========================
            PROFILE HERO
        ========================== */}

        <section className="relative overflow-hidden rounded-2xl bg-[#073BBA] shadow-lg mb-5 sm:mb-6">
          {/* Decorative */}
          <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-[#FFD21A]/20" />

          <div className="absolute right-10 -bottom-28 w-64 h-64 rounded-full border-[45px] border-white/10" />

          <div className="absolute right-20 top-8 w-16 h-16 rounded-full bg-[#FFD21A]/15" />

          <div className="relative z-10 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Avatar */}

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white flex items-center justify-center shadow-md shrink-0">
                <User size={42} className="text-[#073BBA]" />
              </div>

              {/* Identity */}

              <div className="text-white flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black">
                    {loading
                      ? "Memuat profil..."
                      : displayProfile.full_name || "-"}
                  </h2>
                </div>

                <p className="text-blue-100 text-sm mt-1">
                  {displayProfile.role || "-"} · {displayProfile.major || "-"}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-blue-100">
                  <div className="flex items-center gap-1.5">
                    <School size={14} />
                    {displayProfile.school || "-"}
                  </div>
                </div>
              </div>

              {/* Edit */}

              <button
                type="button"
                onClick={startEditing}
                disabled={loading || !profile}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FFD21A] text-[#073BBA] text-sm font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition shrink-0"
              >
                <Pencil size={16} />
                Edit Profil
              </button>
            </div>
          </div>
        </section>

        {/* =========================
            PROFILE CONTENT
        ========================== */}

        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.7fr] gap-5 sm:gap-6">
          {/* DATA DIRI */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <User size={20} className="text-[#073BBA]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#0B2875]">Data Diri</h2>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Informasi identitas pribadi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
                <ProfileField
                  icon={<User size={17} />}
                  label="Nama Lengkap"
                  value={displayProfile.full_name || "-"}
                />

                <ProfileField
                  icon={<School size={17} />}
                  label="Sekolah"
                  value={displayProfile.school || "-"}
                />

                <ProfileField
                  icon={<BriefcaseBusiness size={17} />}
                  label="Jurusan"
                  value={displayProfile.major || "-"}
                />

                <ProfileField
                  icon={<CreditCard size={17} />}
                  label="NISN"
                  value={displayProfile.nisn || "-"}
                />

                <ProfileField
                  icon={<Phone size={17} />}
                  label="Nomor Telepon"
                  value={displayProfile.phone || "-"}
                />

                <ProfileField
                  icon={<VenusAndMars size={17} />}
                  label="Jenis Kelamin"
                  value={displayProfile.gender || "-"}
                />

                <ProfileField
                  icon={<CalendarDays size={17} />}
                  label="Tanggal Lahir"
                  value={displayProfile.birth_date || "-"}
                />

                <ProfileField
                  icon={<MapPin size={17} />}
                  label="Tempat Lahir"
                  value={displayProfile.birth_place || "-"}
                />

                <div className="sm:col-span-2">
                  <ProfileField
                    icon={<Mail size={17} />}
                    label="Email"
                    value={displayProfile.email || "-"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT INFO */}

          <div className="space-y-5">
            {/* ACCOUNT */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <ShieldCheck size={20} className="text-[#073BBA]" />
                </div>

                <div>
                  <h2 className="font-bold text-[#0B2875]">Status Akun</h2>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Informasi akun kamu.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <AccountRow label="Role" value={displayProfile.role || "-"} />

                <AccountRow label="NISN" value={displayProfile.nisn || "-"} />
              </div>
            </div>

            {/* SCHOOL */}

            <div className="bg-[#073BBA] rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />

              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                  <School size={20} />
                </div>

                <h2 className="font-bold text-lg">
                  {displayProfile.role || "-"}
                </h2>

                <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                  Data profil digunakan untuk kebutuhan identitas dan
                  administrasi presensi selama kegiatan PKL berlangsung.
                </p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <form
              onSubmit={saveProfile}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2875]">
                    Edit Profil
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Perubahan disimpan ke akun kamu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
                  aria-label="Tutup edit profil"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  ["full_name", "Nama Lengkap"],
                  ["school", "Sekolah"],
                  ["major", "Jurusan"],
                  ["phone", "Nomor Telepon"],
                  ["birth_place", "Tempat Lahir"],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="block text-sm font-semibold text-slate-700"
                  >
                    {label}
                    <input
                      value={form[field]}
                      onChange={(event) =>
                        setForm({ ...form, [field]: event.target.value })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#073BBA] focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                ))}

                <label className="block text-sm font-semibold text-slate-700">
                  Jenis Kelamin
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm({ ...form, gender: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#073BBA] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Tanggal Lahir
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(event) =>
                      setForm({ ...form, birth_date: event.target.value })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#073BBA] focus:ring-4 focus:ring-blue-100"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-6 w-full rounded-xl bg-[#073BBA] px-4 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        )}

        {/* =========================
            FOOTER
        ========================== */}

        <footer className="text-center py-7 sm:py-8">
          <p className="text-[11px] sm:text-xs text-slate-400">
            © 2025 ABSENKU — Sistem Presensi Digital
          </p>
        </footer>
      </main>
    </div>
  );
}

/* =========================
   PROFILE FIELD
========================= */

function ProfileField({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[#073BBA]">{icon}</span>

        <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
          {label}
        </span>
      </div>

      <p className="text-sm font-bold text-slate-700 break-words">{value}</p>
    </div>
  );
}

/* =========================
   ACCOUNT ROW
========================= */

function AccountRow({ label, value, active = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>

      {active ? (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {value}
        </span>
      ) : (
        <span className="text-xs font-semibold text-slate-600 text-right">
          {value}
        </span>
      )}
    </div>
  );
}

export default Profile;
