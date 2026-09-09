import { useState } from "react";
import { ArrowLeft, Mail, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../../lib/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (!email) {
      setError("Silakan masukkan email Anda.");
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword(email);

      setSuccess(true);
      setEmail("");
    } catch (error) {
      console.error(error);

      setError(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        {/* LOGO */}

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#073BBA] flex items-center justify-center">
              <span className="text-[#FFD21A] text-xl font-black">A</span>
            </div>

            <div>
              <h1 className="text-2xl font-black text-[#073BBA]">ABSENKU</h1>

              <p className="text-[10px] text-slate-400 tracking-wide">
                SISTEM PRESENSI DIGITAL
              </p>
            </div>
          </div>
        </div>

        {/* CARD */}

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-7 sm:p-9">
          {/* BACK */}

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#073BBA] transition"
          >
            <ArrowLeft size={17} />
            Kembali ke Login
          </Link>

          {/* HEADER */}

          <div className="mt-7 mb-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
              <Mail size={26} className="text-[#073BBA]" />
            </div>

            <h2 className="text-2xl font-black text-[#0B2875]">
              Lupa Password?
            </h2>

            <p className="text-sm text-slate-500 mt-2 leading-6">
              Masukkan email akun Anda. Jika email terdaftar, instruksi untuk
              mengatur ulang password akan dikirimkan.
            </p>
          </div>

          {/* SUCCESS */}

          {success && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
              <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />

              <p className="text-sm text-emerald-700">
                Permintaan reset password berhasil dikirim. Silakan cek email
                Anda.
              </p>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-500 shrink-0" />

              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-[#073BBA] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#073BBA] text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Kirim Instruksi
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 ABSENKU · Sistem Presensi Digital
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
