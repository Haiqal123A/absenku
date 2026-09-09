import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";
import { leaveApi } from "../../lib/api";

const MAX_IZIN_PER_MONTH = 4;

function getCurrentMonthKey() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function Izin() {
  const [jenis, setJenis] = useState("Izin");
  const [tanggal, setTanggal] = useState("");
  const [alasan, setAlasan] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [history, setHistory] = useState([]);

  useEffect(() => {
    leaveApi
      .mine()
      .then(({ requests = [] }) => setHistory(requests.map(normalizeRequest)))
      .catch((requestError) =>
        setMessage({
          type: "error",
          text: requestError.details
            ? `${requestError.message} (${requestError.details})`
            : requestError.message,
        }),
      );
  }, []);

  const currentMonth = getCurrentMonthKey();

  const izinUsed = useMemo(() => {
    return history.filter((item) => {
      if (item.jenis !== "Izin") return false;

      if (!item.monthKey) {
        return true;
      }

      return item.monthKey === currentMonth;
    }).length;
  }, [history, currentMonth]);

  const izinRemaining = Math.max(MAX_IZIN_PER_MONTH - izinUsed, 0);

  const izinLimitReached = izinRemaining <= 0;

  const progressWidth = Math.min((izinUsed / MAX_IZIN_PER_MONTH) * 100, 100);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage({
        type: "error",
        text: "Format file harus PDF, JPG, atau PNG.",
      });

      event.target.value = "";
      return;
    }

    if (selectedFile.size > maxSize) {
      setMessage({
        type: "error",
        text: "Ukuran file maksimal 5 MB.",
      });

      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setMessage(null);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage(null);

    if (izinLimitReached) {
      setMessage({
        type: "limit",
        text: "Batas izin kamu sudah habis.",
      });

      return;
    }

    if (!tanggal) {
      setMessage({
        type: "error",
        text: "Silakan pilih tanggal izin.",
      });

      return;
    }

    if (!alasan.trim()) {
      setMessage({
        type: "error",
        text: "Silakan isi alasan izin.",
      });

      return;
    }

    if (alasan.trim().length < 5) {
      setMessage({
        type: "error",
        text: "Alasan izin terlalu singkat.",
      });

      return;
    }

    setSubmitLoading(true);

    try {
      const { request } = await leaveApi.create({
        request_type: jenis,
        request_date: tanggal,
        reason: alasan.trim(),
      });
      setHistory((current) => [normalizeRequest(request), ...current]);

      setTanggal("");
      setAlasan("");
      setFile(null);

      setMessage({
        type: "success",
        text:
          jenis === "Izin"
            ? "Pengajuan izin berhasil dicatat."
            : "Pengajuan sakit berhasil dicatat.",
      });
    } catch (requestError) {
      setMessage({
        type: "error",
        text: requestError.details
          ? `${requestError.message} (${requestError.details})`
          : requestError.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC]">
      <UserNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-7 sm:px-6 lg:px-8 lg:pb-10 lg:pt-9">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FileText size={16} className="text-[#073BBA]" />
            </div>

            <span className="text-sm font-semibold text-[#073BBA]">
              Pengajuan
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0B2875] sm:text-3xl">
            Izin & Sakit
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Ajukan izin atau sakit untuk mencatat ketidakhadiran kamu pada
            sistem.
          </p>
        </section>

        {/* =====================================================
            IZIN QUOTA
        ===================================================== */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <ShieldCheck size={20} className="text-[#073BBA]" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Kuota Izin Bulanan
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#0B2875]">
                    {izinRemaining}
                  </span>

                  <span className="text-sm text-slate-500">
                    dari {MAX_IZIN_PER_MONTH} izin tersisa
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Periode{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-[240px]">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  Pemakaian izin
                </span>

                <span className="text-[11px] font-semibold text-[#073BBA]">
                  {izinUsed}/{MAX_IZIN_PER_MONTH}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    izinLimitReached ? "bg-red-500" : "bg-[#073BBA]"
                  }`}
                  style={{
                    width: `${progressWidth}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* LIMIT WARNING */}
          {izinLimitReached && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Batas izin kamu sudah habis
                </p>

                <p className="mt-1 text-xs leading-5 text-red-600/80">
                  Kamu sudah menggunakan seluruh kuota izin bulan ini. Pengajuan
                  izin baru dapat dilakukan kembali pada bulan berikutnya.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =====================================================
            CONTENT
        ===================================================== */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* ===================================================
              FORM
          =================================================== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-lg font-bold text-[#0B2875]">
                Buat Pengajuan
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Isi data berikut dengan benar.
              </p>
            </div>

            {/* MESSAGE */}
            {message && (
              <div
                className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
                  message.type === "success"
                    ? "border-emerald-100 bg-emerald-50"
                    : message.type === "limit"
                      ? "border-red-100 bg-red-50"
                      : "border-yellow-100 bg-yellow-50"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className={`mt-0.5 shrink-0 ${
                      message.type === "limit"
                        ? "text-red-500"
                        : "text-yellow-600"
                    }`}
                  />
                )}

                <p
                  className={`text-xs font-medium ${
                    message.type === "success"
                      ? "text-emerald-700"
                      : message.type === "limit"
                        ? "text-red-700"
                        : "text-yellow-700"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* JENIS */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Jenis Pengajuan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setJenis("Izin")}
                    disabled={izinLimitReached}
                    className={`rounded-xl border p-4 text-left transition ${
                      jenis === "Izin"
                        ? "border-[#073BBA] bg-blue-50 ring-1 ring-[#073BBA]"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    } ${
                      izinLimitReached ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#0B2875]">Izin</p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Maks. 4 kali per bulan
                        </p>
                      </div>

                      {jenis === "Izin" && (
                        <CheckCircle2 size={18} className="text-[#073BBA]" />
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setJenis("Sakit")}
                    className={`rounded-xl border p-4 text-left transition ${
                      jenis === "Sakit"
                        ? "border-[#073BBA] bg-blue-50 ring-1 ring-[#073BBA]"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#0B2875]">
                          Sakit
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Tidak menggunakan kuota izin
                        </p>
                      </div>

                      {jenis === "Sakit" && (
                        <CheckCircle2 size={18} className="text-[#073BBA]" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* TANGGAL */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Tanggal
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    disabled={jenis === "Izin" && izinLimitReached}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#073BBA] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* ALASAN */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600">
                    Alasan
                  </label>

                  <span className="text-[10px] text-slate-400">
                    {alasan.length}/500
                  </span>
                </div>

                <textarea
                  value={alasan}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setAlasan(e.target.value);
                    }
                  }}
                  disabled={jenis === "Izin" && izinLimitReached}
                  rows={5}
                  placeholder={
                    jenis === "Izin"
                      ? "Jelaskan alasan izin kamu..."
                      : "Jelaskan kondisi atau alasan sakit..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#073BBA] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              {/* FILE */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Lampiran{" "}
                  <span className="font-normal text-slate-400">(Opsional)</span>
                </label>

                {!file ? (
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-5 py-7 text-center transition hover:border-[#073BBA] hover:bg-blue-50/30 ${
                      jenis === "Izin" && izinLimitReached
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Upload size={18} className="text-[#073BBA]" />
                    </div>

                    <p className="mt-3 text-xs font-semibold text-slate-600">
                      Klik untuk upload lampiran
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      PDF, JPG, PNG · Maks. 5 MB
                    </p>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                        <FileText size={17} className="text-[#073BBA]" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {file.name}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={
                  submitLoading || (jenis === "Izin" && izinLimitReached)
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#073BBA] text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f94] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Mengirim...
                  </>
                ) : jenis === "Izin" && izinLimitReached ? (
                  <>
                    <AlertCircle size={17} />
                    Batas Izin Sudah Habis
                  </>
                ) : (
                  <>
                    <FileText size={17} />
                    Kirim Pengajuan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ===================================================
              INFORMATION
          =================================================== */}
          <div className="space-y-6">
            {/* KUOTA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <ShieldCheck size={18} className="text-[#073BBA]" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0B2875]">
                    Aturan Izin
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Ketentuan penggunaan izin
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#073BBA]" />

                  <p className="text-xs leading-5 text-slate-500">
                    Setiap user mendapatkan maksimal{" "}
                    <span className="font-semibold text-slate-700">
                      4 kali izin
                    </span>{" "}
                    dalam satu bulan.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#073BBA]" />

                  <p className="text-xs leading-5 text-slate-500">
                    Kuota akan otomatis kembali pada awal bulan berikutnya.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#073BBA]" />

                  <p className="text-xs leading-5 text-slate-500">
                    Pengajuan sakit tidak mengurangi kuota izin.
                  </p>
                </div>
              </div>
            </div>

            {/* HISTORY */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0B2875]">
                    Riwayat Pengajuan
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Pengajuan yang telah kamu catat.
                  </p>
                </div>

                <Clock3 size={17} className="text-slate-300" />
              </div>

              <div className="mt-5 space-y-3">
                {history.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                    <p className="text-xs text-slate-400">
                      Belum ada riwayat pengajuan.
                    </p>
                  </div>
                ) : (
                  history.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.jenis === "Izin"
                                  ? "bg-[#073BBA]"
                                  : "bg-red-400"
                              }`}
                            />

                            <p className="text-xs font-bold text-slate-700">
                              {item.jenis}
                            </p>
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {item.tanggal}
                          </p>
                        </div>

                        <span className="text-[10px] font-medium text-slate-400">
                          {item.waktu}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.alasan}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5">
          <p className="text-xs text-slate-400">Absenku · Izin & Sakit</p>

          <p className="hidden text-xs text-slate-400 sm:block">
            Data pengajuan tersimpan secara otomatis
          </p>
        </div>
      </main>
    </div>
  );
}

function normalizeRequest(request) {
  return {
    ...request,
    id: request.id,
    tanggal: request.request_date,
    jenis: request.request_type,
    alasan: request.reason,
    waktu: request.created_at,
    monthKey: request.request_date?.slice(0, 7),
  };
}

export default Izin;
