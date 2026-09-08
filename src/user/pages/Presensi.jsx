import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  Home,
  Building2,
  AlertCircle,
  Navigation,
  BriefcaseBusiness,
  FileText,
  X,
  Info,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";

const STORAGE_KEY = "absenku_attendance_records";

// ======================================================
// KONFIGURASI JAM MASUK
// ======================================================

const START_HOUR = 7;
const START_MINUTE = 30;

// ======================================================
// HELPER
// ======================================================

function getAttendanceStatus(type, date = new Date()) {
  if (type === "pulang") {
    return {
      status: "selesai",
      status_label: "Presensi Pulang",
    };
  }

  const currentMinutes =
    date.getHours() * 60 + date.getMinutes();

  const startMinutes =
    START_HOUR * 60 + START_MINUTE;

  if (currentMinutes <= startMinutes) {
    return {
      status: "tepat_waktu",
      status_label: "Tepat Waktu",
    };
  }

  return {
    status: "terlambat",
    status_label: "Terlambat",
  };
}

function formatDate(date) {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ======================================================
// COMPONENT
// ======================================================

function Presensi() {
  const [mode, setMode] = useState("WFO");
  const [attendanceType, setAttendanceType] =
    useState("masuk");

  const [currentTime, setCurrentTime] =
    useState(new Date());

  const [photo, setPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] =
    useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] =
    useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [note, setNote] = useState("");

  const [wfhActivity, setWfhActivity] = useState({
    pekerjaan: "",
    hasil: "",
    progress: 0,
    kendala: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ======================================================
  // CLOCK
  // ======================================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ======================================================
  // CAMERA CLEANUP
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  };

  // ======================================================
  // CAMERA CLEANUP
  // ======================================================

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ======================================================
  // CAMERA
  // ======================================================

  const startCamera = async () => {
    setMessage({
      type: "",
      text: "",
    });

    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage({
        type: "error",
        text: "Browser kamu tidak mendukung akses kamera.",
      });

      return;
    }

    try {
      setCameraLoading(true);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan.",
      });
    } finally {
      setCameraLoading(false);
    }
  };

  // ======================================================
  // CAPTURE PHOTO
  // ======================================================

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      setMessage({
        type: "error",
        text: "Kamera belum siap. Silakan tunggu sebentar.",
      });

      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    /*
     * Preview kamera menggunakan scaleX(-1)
     * supaya tidak mirror.
     *
     * Canvas juga dibalik horizontal agar
     * hasil foto yang tersimpan tetap normal.
     */

    context.save();

    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    context.restore();

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.85
    );

    setPhoto(imageData);

    stopCamera();

    setMessage({
      type: "success",
      text: "Foto berhasil diambil.",
    });
  };

  const removePhoto = () => {
    setPhoto(null);

    setMessage({
      type: "",
      text: "",
    });
  };

  // ======================================================
  // LOCATION
  // ======================================================

  const getLocation = () => {
    if (mode !== "WFO") return;

    if (!navigator.geolocation) {
      setMessage({
        type: "error",
        text: "Browser kamu tidak mendukung GPS.",
      });

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        setLocation({
          latitude,
          longitude,
          accuracy,
        });

        setLocationLoading(false);

        setMessage({
          type: "success",
          text: "Lokasi berhasil didapatkan.",
        });
      },
      (error) => {
        console.error(error);

        setLocationLoading(false);

        let errorMessage =
          "Lokasi tidak dapat didapatkan. Pastikan GPS aktif.";

        if (error.code === 1) {
          errorMessage =
            "Izin lokasi ditolak. Silakan izinkan akses lokasi pada browser.";
        }

        if (error.code === 2) {
          errorMessage =
            "Lokasi tidak tersedia. Pastikan GPS atau koneksi internet aktif.";
        }

        if (error.code === 3) {
          errorMessage =
            "Permintaan lokasi terlalu lama. Silakan coba lagi.";
        }

        setMessage({
          type: "error",
          text: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // ======================================================
  // MODE
  // ======================================================

  const handleModeChange = (newMode) => {
    setMode(newMode);

    setPhoto(null);
    setLocation(null);
    setLocationLoading(false);
    setNote("");

    if (newMode === "WFH") {
      setWfhActivity({
        pekerjaan: "",
        hasil: "",
        progress: 0,
        kendala: "",
      });
    }

    setMessage({
      type: "",
      text: "",
    });
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async () => {
    setMessage({
      type: "",
      text: "",
    });

    if (!photo) {
      setMessage({
        type: "error",
        text: "Silakan ambil foto terlebih dahulu.",
      });

      return;
    }

    if (mode === "WFO" && !location) {
      setMessage({
        type: "error",
        text: "Silakan ambil lokasi terlebih dahulu.",
      });

      return;
    }

    if (mode === "WFH") {
      if (!wfhActivity.pekerjaan.trim()) {
        setMessage({
          type: "error",
          text: "Pekerjaan yang dilakukan wajib diisi.",
        });

        return;
      }

      if (!wfhActivity.hasil.trim()) {
        setMessage({
          type: "error",
          text: "Hasil pekerjaan wajib diisi.",
        });

        return;
      }
    }

    const now = new Date();

    const attendanceStatus =
      getAttendanceStatus(
        mode === "WFH"
          ? "wfh"
          : attendanceType,
        now
      );

    const record = {
      id: `ATT-${Date.now()}`,

      user_id: "USR-001",

      mode,

      type:
        mode === "WFH"
          ? "wfh"
          : attendanceType,

      date: now
        .toISOString()
        .split("T")[0],

      time: now.toLocaleTimeString(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      ),

      status: attendanceStatus.status,

      status_label:
        attendanceStatus.status_label,

      photo,

      foto: photo,

      latitude:
        mode === "WFO" && location
          ? location.latitude
          : null,

      longitude:
        mode === "WFO" && location
          ? location.longitude
          : null,

      accuracy:
        mode === "WFO" && location
          ? location.accuracy
          : null,

      lokasi:
        mode === "WFO" && location
          ? {
              latitude:
                location.latitude,
              longitude:
                location.longitude,
              accuracy:
                location.accuracy,
            }
          : null,

      note,

      keterangan: note,

      wfh_activity:
        mode === "WFH"
          ? {
              pekerjaan:
                wfhActivity.pekerjaan,

              hasil:
                wfhActivity.hasil,

              progress:
                Number(
                  wfhActivity.progress
                ),

              kendala:
                wfhActivity.kendala,
            }
          : null,

      created_at:
        now.toISOString(),
    };

    try {
      setSubmitLoading(true);

      const existingRecords =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          ) || "[]"
        );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          record,
          ...existingRecords,
        ])
      );

      // ==================================================
      // API BACKEND
      // ==================================================

      /*
      const response = await fetch(
        "http://localhost:3000/api/attendance",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(record),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Gagal mengirim presensi"
        );
      }

      const result =
        await response.json();

      console.log(result);
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setMessage({
        type: "success",
        text:
          attendanceStatus.status ===
          "terlambat"
            ? "Presensi berhasil dikirim. Status kamu: Terlambat."
            : "Presensi berhasil dikirim. Status kamu: Tepat Waktu.",
      });

      setPhoto(null);
      setLocation(null);
      setNote("");

      setWfhActivity({
        pekerjaan: "",
        hasil: "",
        progress: 0,
        kendala: "",
      });
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Terjadi kesalahan saat mengirim presensi.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ======================================================
  // STATUS
  // ======================================================

  const previewStatus =
    getAttendanceStatus(
      mode === "WFH"
        ? "wfh"
        : attendanceType,
      currentTime
    );

  const isLate =
    previewStatus.status ===
    "terlambat";

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      {/* ==================================================
          NAVBAR
      ================================================== */}

      <UserNavbar />

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Dashboard</span>

                <span>/</span>

                <span className="font-semibold text-blue-600">
                  Rekam Presensi
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Rekam Presensi
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                Catat kehadiran PKL kamu dengan
                mudah dan aman.
              </p>
            </div>

            {/* CLOCK */}
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3.5 shadow-sm">
              <div className="rounded-xl bg-blue-600 p-2.5 text-white shadow-sm">
                <Clock3 size={20} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Waktu Sekarang
                </p>

                <p className="text-xl font-bold tracking-tight text-slate-900">
                  {formatTime(
                    currentTime
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">
        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message.text && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
              message.type ===
              "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.type ===
            "success" ? (
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />
            )}

            <p className="flex-1 text-sm font-medium">
              {message.text}
            </p>

            <button
              type="button"
              onClick={() =>
                setMessage({
                  type: "",
                  text: "",
                })
              }
              className="shrink-0 rounded-lg p-1 hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* ==================================================
            MODE KERJA
        ================================================== */}

        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Mode Kerja
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pilih sesuai dengan lokasi
              pelaksanaan PKL kamu.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* WFO */}
            <button
              type="button"
              onClick={() =>
                handleModeChange("WFO")
              }
              className={`group rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                mode === "WFO"
                  ? "border-blue-500 bg-blue-50/60"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-2xl p-3.5 transition ${
                    mode === "WFO"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Building2
                    size={25}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900">
                      WFO
                    </h3>

                    {mode === "WFO" && (
                      <CheckCircle2
                        size={21}
                        className="text-blue-600"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Work From Office
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Membutuhkan foto dan
                    verifikasi lokasi GPS.
                  </p>
                </div>
              </div>
            </button>

            {/* WFH */}
            <button
              type="button"
              onClick={() =>
                handleModeChange("WFH")
              }
              className={`group rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                mode === "WFH"
                  ? "border-amber-500 bg-amber-50/60"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`rounded-2xl p-3.5 transition ${
                    mode === "WFH"
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Home size={25} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-900">
                      WFH
                    </h3>

                    {mode === "WFH" && (
                      <CheckCircle2
                        size={21}
                        className="text-amber-500"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Work From Home
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Foto dan aktivitas
                    pekerjaan tanpa GPS.
                  </p>
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ==================================================
            STATUS JAM
        ================================================== */}

        {attendanceType ===
          "masuk" && (
          <div
            className={`mb-6 overflow-hidden rounded-2xl border shadow-sm ${
              isLate
                ? "border-red-200 bg-red-50"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <div
                className={`rounded-xl p-3 ${
                  isLate
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Clock3 size={21} />
              </div>

              <div className="flex-1">
                <p
                  className={`text-sm font-bold ${
                    isLate
                      ? "text-red-700"
                      : "text-emerald-700"
                  }`}
                >
                  {previewStatus.status_label}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Batas presensi masuk
                  adalah{" "}
                  <strong>
                    07.30
                  </strong>
                  .{" "}
                  {isLate &&
                    "Kamu melakukan presensi setelah batas waktu."}
                </p>
              </div>

              <div
                className={`hidden rounded-xl px-3 py-2 text-xs font-bold sm:block ${
                  isLate
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {formatTime(
                  currentTime
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="grid gap-6 xl:grid-cols-12">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="space-y-6 xl:col-span-7">
            {/* JENIS PRESENSI */}
            {mode === "WFO" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="font-bold text-slate-900">
                    Jenis Presensi
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tentukan jenis presensi
                    yang ingin direkam.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setAttendanceType(
                        "masuk"
                      )
                    }
                    className={`rounded-xl border-2 px-4 py-4 text-left transition ${
                      attendanceType ===
                      "masuk"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-blue-200"
                    }`}
                  >
                    <div className="font-bold">
                      Jam Masuk
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Batas 07.30
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setAttendanceType(
                        "pulang"
                      )
                    }
                    className={`rounded-xl border-2 px-4 py-4 text-left transition ${
                      attendanceType ===
                      "pulang"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:border-blue-200"
                    }`}
                  >
                    <div className="font-bold">
                      Jam Pulang
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Rekam kepulangan
                    </div>
                  </button>
                </div>
              </section>
            )}

            {/* CAMERA */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <Camera
                        size={19}
                      />
                    </div>

                    <h2 className="font-bold text-slate-900">
                      Foto Presensi
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Ambil foto sebagai bukti
                    kehadiran.
                  </p>
                </div>

                {photo && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2
                      size={14}
                    />
                    Siap
                  </span>
                )}
              </div>

              {!photo &&
                !cameraOpen && (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/40 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Camera
                        size={29}
                      />
                    </div>

                    <h3 className="font-bold text-slate-800">
                      Belum ada foto
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      Pastikan wajah terlihat
                      jelas sebelum mengambil
                      foto.
                    </p>

                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={
                        cameraLoading
                      }
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cameraLoading ? (
                        <>
                          <RefreshCw
                            size={18}
                            className="animate-spin"
                          />
                          Membuka Kamera...
                        </>
                      ) : (
                        <>
                          <Camera
                            size={18}
                          />
                          Buka Kamera
                        </>
                      )}
                    </button>
                  </div>
                )}

              {cameraOpen && (
                <div>
                  <div className="overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="aspect-video w-full object-cover"
                      style={{
                        transform:
                          "scaleX(-1)",
                      }}
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={
                        capturePhoto
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                    >
                      <Camera
                        size={18}
                      />
                      Ambil Foto
                    </button>

                    <button
                      type="button"
                      onClick={
                        stopCamera
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {photo && (
                <div>
                  <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={photo}
                      alt="Preview presensi"
                      className="aspect-video w-full object-cover"
                    />

                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                      <CheckCircle2
                        size={14}
                      />
                      Foto siap
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={
                        startCamera
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100"
                    >
                      <RefreshCw
                        size={17}
                      />
                      Ambil Ulang
                    </button>

                    <button
                      type="button"
                      onClick={
                        removePhoto
                      }
                      className="rounded-xl border border-red-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </section>

            {/* KETERANGAN WFH */}
            {mode === "WFH" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-amber-50 p-2 text-amber-500">
                      <FileText
                        size={19}
                      />
                    </div>

                    <h2 className="font-bold text-slate-900">
                      Keterangan
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Tambahkan keterangan
                    tambahan jika diperlukan.
                  </p>
                </div>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value.slice(
                        0,
                        500
                      )
                    )
                  }
                  rows={4}
                  placeholder="Tulis keterangan..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                />

                <div className="mt-2 text-right text-xs text-slate-400">
                  {note.length}/500
                </div>
              </section>
            )}
          </div>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <div className="space-y-6 xl:col-span-5">
            {/* VERIFIKASI */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                    <ShieldCheck
                      size={19}
                    />
                  </div>

                  <h2 className="font-bold text-slate-900">
                    Verifikasi
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Pastikan seluruh data sudah
                  lengkap.
                </p>
              </div>

              <div className="space-y-3">
                {/* FOTO */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        photo
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <Camera
                        size={17}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Foto
                      </p>

                      <p className="text-xs text-slate-500">
                        {photo
                          ? "Sudah tersedia"
                          : "Belum diambil"}
                      </p>
                    </div>
                  </div>

                  {photo ? (
                    <CheckCircle2
                      size={19}
                      className="text-emerald-500"
                    />
                  ) : (
                    <AlertCircle
                      size={19}
                      className="text-amber-500"
                    />
                  )}
                </div>

                {/* LOCATION */}
                {mode === "WFO" && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          location
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        <MapPin
                          size={17}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Lokasi
                        </p>

                        <p className="text-xs text-slate-500">
                          {location
                            ? "Berhasil diverifikasi"
                            : "Belum diverifikasi"}
                        </p>
                      </div>
                    </div>

                    {location ? (
                      <CheckCircle2
                        size={19}
                        className="text-emerald-500"
                      />
                    ) : (
                      <AlertCircle
                        size={19}
                        className="text-amber-500"
                      />
                    )}
                  </div>
                )}

                {/* WFH */}
                {mode === "WFH" && (
                  <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                        <Home
                          size={17}
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Mode WFH
                        </p>

                        <p className="text-xs text-slate-500">
                          Tidak membutuhkan GPS
                        </p>
                      </div>
                    </div>

                    <CheckCircle2
                      size={19}
                      className="text-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="button"
                onClick={
                  handleSubmit
                }
                disabled={
                  submitLoading
                }
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  mode === "WFH"
                    ? "bg-amber-500 shadow-amber-500/20 hover:bg-amber-600"
                    : "bg-blue-600 shadow-blue-600/20 hover:bg-blue-700"
                }`}
              >
                {submitLoading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={18} />

                    {mode === "WFH"
                      ? "Kirim Presensi & Aktivitas WFH"
                      : "Kirim Presensi"}
                  </>
                )}
              </button>
            </section>

            {/* ==================================================
                WFH ACTIVITY
            ================================================== */}

            {mode === "WFH" && (
              <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-amber-50 p-2 text-amber-500">
                      <BriefcaseBusiness
                        size={19}
                      />
                    </div>

                    <h2 className="font-bold text-slate-900">
                      Aktivitas WFH
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Isi aktivitas pekerjaan
                    yang dilakukan hari ini.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* PEKERJAAN */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Pekerjaan yang Dilakukan{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <textarea
                      value={
                        wfhActivity.pekerjaan
                      }
                      onChange={(
                        event
                      ) =>
                        setWfhActivity(
                          (prev) => ({
                            ...prev,
                            pekerjaan:
                              event.target
                                .value,
                          })
                        )
                      }
                      rows={3}
                      placeholder="Contoh: Membuat desain halaman dashboard..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                    />
                  </div>

                  {/* HASIL */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Hasil Pekerjaan{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <textarea
                      value={
                        wfhActivity.hasil
                      }
                      onChange={(
                        event
                      ) =>
                        setWfhActivity(
                          (prev) => ({
                            ...prev,
                            hasil:
                              event.target
                                .value,
                          })
                        )
                      }
                      rows={3}
                      placeholder="Contoh: Dashboard selesai dibuat..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                    />
                  </div>

                  {/* PROGRESS */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">
                        Progress
                      </label>

                      <span className="rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-amber-600">
                        {
                          wfhActivity.progress
                        }
                        %
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={
                        wfhActivity.progress
                      }
                      onChange={(
                        event
                      ) =>
                        setWfhActivity(
                          (prev) => ({
                            ...prev,
                            progress:
                              Number(
                                event
                                  .target
                                  .value
                              ),
                          })
                        )
                      }
                      className="w-full accent-amber-500"
                    />

                    <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                      <span>
                        0%
                      </span>

                      <span>
                        50%
                      </span>

                      <span>
                        100%
                      </span>
                    </div>
                  </div>

                  {/* KENDALA */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Kendala{" "}
                      <span className="text-xs font-normal text-slate-400">
                        (Opsional)
                      </span>
                    </label>

                    <textarea
                      value={
                        wfhActivity.kendala
                      }
                      onChange={(
                        event
                      ) =>
                        setWfhActivity(
                          (prev) => ({
                            ...prev,
                            kendala:
                              event.target
                                .value,
                          })
                        )
                      }
                      rows={3}
                      placeholder="Tulis kendala jika ada..."
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                KETERANGAN WFO
            ================================================== */}

            {mode === "WFO" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <FileText
                        size={19}
                      />
                    </div>

                    <h2 className="font-bold text-slate-900">
                      Keterangan
                    </h2>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    Tambahkan keterangan
                    tambahan jika diperlukan.
                  </p>
                </div>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value.slice(
                        0,
                        500
                      )
                    )
                  }
                  rows={4}
                  placeholder="Tulis keterangan..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-2 text-right text-xs text-slate-400">
                  {note.length}/500
                </div>
              </section>
            )}
          </div>
        </div>

        {/* ==================================================
            BOTTOM INFORMATION AREA
        ================================================== */}

        <div className="mt-6">
          {/* WFO: LOKASI + INFORMASI SEJAJAR */}
          {mode === "WFO" && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* LOCATION */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                      <Navigation
                        size={19}
                      />
                    </div>

                    <h2 className="font-bold text-slate-900">
                      Lokasi
                    </h2>
                  </div>

                  <p className="mt-2 text-sm leading-5 text-slate-500">
                    Lokasi digunakan untuk
                    memverifikasi kehadiran di
                    kantor.
                  </p>
                </div>

                {location ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
                        <MapPin
                          size={19}
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-bold text-emerald-800">
                          Lokasi berhasil
                          didapatkan
                        </p>

                        <div className="mt-2 space-y-1 text-xs leading-5 text-emerald-700">
                          <p>
                            Latitude:{" "}
                            <span className="font-semibold">
                              {location.latitude.toFixed(
                                6
                              )}
                            </span>
                          </p>

                          <p>
                            Longitude:{" "}
                            <span className="font-semibold">
                              {location.longitude.toFixed(
                                6
                              )}
                            </span>
                          </p>

                          <p>
                            Akurasi:{" "}
                            <span className="font-semibold">
                              ±
                              {Math.round(
                                location.accuracy
                              )}
                              m
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        getLocation
                      }
                      disabled={
                        locationLoading
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <>
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                          Memperbarui...
                        </>
                      ) : (
                        <>
                          <RefreshCw
                            size={16}
                          />
                          Perbarui Lokasi
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <MapPin
                        size={25}
                      />
                    </div>

                    <h3 className="font-bold text-slate-800">
                      Lokasi belum didapatkan
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
                      Klik tombol di bawah
                      untuk mengambil
                      lokasi perangkat kamu.
                    </p>

                    <button
                      type="button"
                      onClick={
                        getLocation
                      }
                      disabled={
                        locationLoading
                      }
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {locationLoading ? (
                        <>
                          <RefreshCw
                            size={17}
                            className="animate-spin"
                          />
                          Mengambil Lokasi...
                        </>
                      ) : (
                        <>
                          <Navigation
                            size={17}
                          />
                          Ambil Lokasi
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>

              {/* INFORMATION */}
              <AttendanceInfo />
            </div>
          )}

          {/* WFH: ACTIVITY + INFORMATION */}
          {mode === "WFH" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-100 p-2.5 text-amber-600">
                    <BriefcaseBusiness
                      size={19}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Aktivitas WFH Terintegrasi
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Aktivitas pekerjaan,
                      hasil, progress, dan
                      kendala akan dikirim
                      bersama data presensi
                      dalam satu pengiriman.
                    </p>
                  </div>
                </div>
              </div>

              <AttendanceInfo />
            </div>
          )}
        </div>

        {/* ==================================================
            FOOTER DATE
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Clock3
                  size={18}
                />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Tanggal Presensi
                </p>

                <p className="text-sm font-bold text-slate-800">
                  {formatDate(
                    currentTime
                  )}
                </p>
              </div>
            </div>

            {attendanceType ===
              "masuk" && (
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
                  isLate
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isLate ? (
                  <AlertCircle
                    size={17}
                  />
                ) : (
                  <CheckCircle2
                    size={17}
                  />
                )}

                {previewStatus.status_label}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ======================================================
// INFORMATION CARD
// ======================================================

function AttendanceInfo() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
          <Info size={19} />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-bold text-blue-900">
            Informasi Presensi
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex gap-2 text-xs leading-5 text-blue-800">
              <span className="font-bold text-blue-500">
                •
              </span>

              <span>
                Jam masuk resmi adalah{" "}
                <strong>
                  07.30
                </strong>
                .
              </span>
            </div>

            <div className="flex gap-2 text-xs leading-5 text-blue-800">
              <span className="font-bold text-blue-500">
                •
              </span>

              <span>
                Presensi ≤ 07.30
                tercatat{" "}
                <strong>
                  Tepat Waktu
                </strong>
                .
              </span>
            </div>

            <div className="flex gap-2 text-xs leading-5 text-blue-800">
              <span className="font-bold text-blue-500">
                •
              </span>

              <span>
                Presensi setelah 07.30
                tercatat{" "}
                <strong>
                  Terlambat
                </strong>
                .
              </span>
            </div>

            <div className="flex gap-2 text-xs leading-5 text-blue-800">
              <span className="font-bold text-blue-500">
                •
              </span>

              <span>
                WFO membutuhkan
                verifikasi lokasi GPS.
              </span>
            </div>

            <div className="flex gap-2 text-xs leading-5 text-blue-800">
              <span className="font-bold text-blue-500">
                •
              </span>

              <span>
                WFH tidak menggunakan
                GPS.
              </span>
            </div>

            <div className="flex gap-2 text-xs leading-5 text-blue-800">
              <span className="font-bold text-blue-500">
                •
              </span>

              <span>
                WFH wajib mengisi
                aktivitas pekerjaan.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Presensi;