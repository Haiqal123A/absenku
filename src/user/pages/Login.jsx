import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, LogIn, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      /*
        ==========================================
        API LOGIN NANTI DITARUH DI SINI
        ==========================================

        Contoh:

        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        localStorage.setItem(
          "token",
          data.token
        );
      */

      // Simulasi sementara
      await new Promise((resolve) =>
        setTimeout(resolve, 800)
      );

      // Demo login
      if (
        email !== "farras@absenku.com" ||
        password !== "123456"
      ) {
        setError(
          "Email atau password yang Anda masukkan salah."
        );
        return;
      }

      localStorage.setItem(
        "absenku_logged_in",
        "true"
      );

      localStorage.setItem(
        "absenku_user",
        JSON.stringify({
          name: "Farras Khairy",
          email: email,
          role: "Pegawai",
        })
      );

      navigate("/user/dashboard");

    } catch (error) {
      console.error(error);

      setError(
        "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] flex items-center justify-center px-5 py-10">

      <div className="w-full max-w-[1050px] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <div className="hidden lg:flex relative bg-[#073BBA] p-12 overflow-hidden">

            {/* Decoration */}

            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#FFD21A] opacity-20" />

            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full border-[50px] border-white/10" />

            <div className="relative z-10 flex flex-col justify-between w-full">

              {/* LOGO */}

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-[#FFD21A] flex items-center justify-center">

                  <span className="text-[#073BBA] text-xl font-black">
                    A
                  </span>

                </div>

                <div>
                  <h1 className="text-2xl font-black text-white">
                    ABSENKU
                  </h1>

                  <p className="text-xs text-blue-200 tracking-wide">
                    SISTEM PRESENSI DIGITAL
                  </p>
                </div>

              </div>

              {/* CONTENT */}

              <div className="my-auto py-16">

                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-blue-100 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-[#FFD21A] rounded-full" />
                  Portal Pegawai
                </div>

                <h2 className="text-4xl font-black text-white leading-tight">
                  Kelola kehadiran
                  <br />
                  dengan lebih mudah.
                </h2>

                <p className="text-blue-100 mt-5 leading-7 max-w-md">
                  Catat presensi masuk dan pulang,
                  pantau riwayat kehadiran, ajukan
                  izin, dan lihat laporan presensi
                  Anda dalam satu platform.
                </p>

              </div>

              {/* FOOTER */}

              <p className="text-xs text-blue-200">
                © 2025 ABSENKU. Sistem Presensi Digital.
              </p>

            </div>
          </div>

          {/* =========================
              RIGHT SIDE
          ========================= */}

          <div className="p-7 sm:p-10 lg:p-12">

            {/* MOBILE LOGO */}

            <div className="flex lg:hidden items-center gap-3 mb-10">

              <div className="w-11 h-11 rounded-xl bg-[#073BBA] flex items-center justify-center">

                <span className="text-[#FFD21A] font-black text-lg">
                  A
                </span>

              </div>

              <div>
                <h1 className="text-xl font-black text-[#073BBA]">
                  ABSENKU
                </h1>

                <p className="text-[10px] text-slate-400">
                  SISTEM PRESENSI DIGITAL
                </p>
              </div>

            </div>

            {/* HEADER */}

            <div className="mb-8">

              <p className="text-sm font-bold text-[#073BBA] mb-2">
                Selamat datang 👋
              </p>

              <h2 className="text-3xl font-black text-[#0B2875]">
                Masuk ke akun
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Silakan masuk untuk mengakses dashboard
                presensi Anda.
              </p>

            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 flex gap-3 items-start bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">

                <AlertCircle
                  size={19}
                  className="shrink-0 mt-0.5"
                />

                <p className="text-sm font-medium">
                  {error}
                </p>

              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Masukkan email"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none transition focus:bg-white focus:border-[#073BBA] focus:ring-4 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <Link
                    to="/user/forgot-password"
                    className="text-xs font-bold text-[#073BBA] hover:text-blue-800"
                  >
                    Lupa password?
                  </Link>

                </div>

                <div className="relative">

                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Masukkan password"
                    className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none transition focus:bg-white focus:border-[#073BBA] focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-[#073BBA]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* REMEMBER */}

              <div className="flex items-center gap-2">

                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 accent-[#073BBA]"
                />

                <label
                  htmlFor="remember"
                  className="text-sm text-slate-500 cursor-pointer"
                >
                  Ingat saya
                </label>

              </div>

              {/* LOGIN */}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#073BBA] text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn size={19} />
                    Masuk
                  </>
                )}

              </button>

            </form>

            {/* DEMO INFO */}

            <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-xl p-4">

              <p className="text-xs font-bold text-yellow-700">
                Akun Demo
              </p>

              <p className="text-xs text-yellow-700 mt-1">
                Email: farras@absenku.com
              </p>

              <p className="text-xs text-yellow-700">
                Password: 123456
              </p>

            </div>

            {/* BOTTOM */}

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">

              <p className="text-xs text-slate-400">
                Sistem Presensi Digital
              </p>

              <p className="text-xs font-bold text-[#073BBA] mt-1">
                ABSENKU
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;