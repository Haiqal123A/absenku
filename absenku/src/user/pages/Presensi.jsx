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
  X,
  Info,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";
import { attendanceApi } from "../../lib/api";

const getAttendanceType = () => {
  const now = new Date();

  return now.getHours() < 12 ? "masuk" : "pulang";
};

const getAttendanceLabel = () => {
  return getAttendanceType() === "masuk" ? "Presensi Masuk" : "Presensi Pulang";
};

const getAttendanceStatus = () => {
  const type = getAttendanceType();

  if (type === "pulang") {
    return {
      key: "selesai",
      label: "Presensi Pulang",
    };
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (hour < 7 || (hour === 7 && minute <= 30)) {
    return {
      key: "tepat_waktu",
      label: "Tepat Waktu",
    };
  }

  return {
    key: "terlambat",
    label: "Terlambat",
  };
};

const getFormattedDate = () => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

const getFormattedTime = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
};

function Presensi() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [mode, setMode] = useState("WFO");
  const [currentTime, setCurrentTime] = useState(new Date());

  const [photo, setPhoto] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const attendanceType = currentTime.getHours() < 12 ? "masuk" : "pulang";

  const attendanceStatus = getAttendanceStatus();

  /* =========================
     JAM REALTIME
  ========================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* =========================
     LOKASI OTOMATIS
  ========================= */

  useEffect(() => {
    if (mode === "WFO") {
      getLocation();
    }
  }, [mode]);

  /* =========================
     PASANG STREAM KE VIDEO
  ========================= */

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    video.srcObject = streamRef.current;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("Video play error:", error);
      }
    };

    playVideo();
  }, [cameraOpen]);

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  /* =========================
     GET LOCATION
  ========================= */

  function getLocation() {
    if (!navigator.geolocation) {
      setLocationError("Browser kamu tidak mendukung akses lokasi.");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationLoading(false);
      },
      (error) => {
        let errorMessage =
          "Lokasi tidak dapat diperoleh. Pastikan izin lokasi sudah diberikan.";

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Akses lokasi ditolak. Silakan izinkan lokasi pada browser.";
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Lokasi sedang tidak tersedia.";
        }

        if (error.code === error.TIMEOUT) {
          errorMessage = "Waktu pengambilan lokasi habis. Silakan coba lagi.";
        }

        setLocationError(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  /* =========================
     START CAMERA
  ========================= */

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      setMessage(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage({
          type: "error",
          text: "Browser kamu tidak mendukung akses kamera.",
        });

        setCameraLoading(false);
        return;
      }

      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      /*
       * Penting:
       * cameraOpen dibuat true terlebih dahulu.
       * Setelah <video> dirender, useEffect di atas
       * akan memasangkan stream ke video.
       */
      setCameraOpen(true);
      setCameraLoading(false);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraLoading(false);

      let errorMessage =
        "Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan.";

      if (error?.name === "NotAllowedError") {
        errorMessage =
          "Akses kamera ditolak. Silakan izinkan kamera pada browser.";
      }

      if (error?.name === "NotFoundError") {
        errorMessage = "Kamera tidak ditemukan pada perangkat ini.";
      }

      if (error?.name === "NotReadableError") {
        errorMessage = "Kamera sedang digunakan oleh aplikasi lain.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  };

  /* =========================
     STOP CAMERA
  ========================= */

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  }

  /* =========================
     CAPTURE PHOTO
  ========================= */

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setMessage({
        type: "error",
        text: "Kamera belum siap. Silakan coba lagi.",
      });

      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setMessage({
        type: "error",
        text: "Kamera belum siap. Tunggu sebentar lalu coba lagi.",
      });

      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setMessage({
        type: "error",
        text: "Gagal memproses foto.",
      });

      return;
    }

    /*
     * Tidak menggunakan transform scaleX(-1).
     * Hasil foto TIDAK mirror.
     */
    context.drawImage(video, 0, 0, width, height);

    const imageData = canvas.toDataURL("image/jpeg", 0.85);

    setPhoto(imageData);

    stopCamera();

    setMessage({
      type: "success",
      text: "Foto berhasil diambil. Silakan kirim presensi.",
    });
  };

  /* =========================
     RETAKE
  ========================= */

  const retakePhoto = () => {
    setPhoto("");
    setMessage(null);
    startCamera();
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async () => {
    setMessage(null);

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
        text: "Lokasi belum tersedia. Tunggu sampai lokasi terdeteksi.",
      });

      getLocation();
      return;
    }

    try {
      setSubmitLoading(true);

      const today = await attendanceApi.today();
      const payload = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        photo_base64: photo,
      };

      const result = today.has_checked_in
        ? await attendanceApi.checkOut(payload)
        : await attendanceApi.checkIn(payload);

      setMessage({
        type: "success",
        text: result.check_out_time
          ? "Presensi pulang berhasil disimpan ke database."
          : "Presensi masuk berhasil disimpan ke database.",
      });

      setPhoto("");

      if (mode === "WFO") {
        getLocation();
      }
    } catch (error) {
      console.error(error);

      setMessage({
        type: "error",
        text: "Presensi gagal dikirim. Silakan coba lagi.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <UserNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <span>Dashboard</span>
                <span>/</span>

                <span className="font-medium text-blue-600">
                  Rekam Presensi
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Rekam Presensi
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Ambil foto untuk mencatat kehadiran kamu.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={20} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Waktu Sekarang
                </p>

                <p className="text-lg font-bold text-slate-900">
                  {getFormattedTime(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            MESSAGE
        ========================= */}

        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
            )}

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {message.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}
              </p>

              <p className="mt-0.5 text-sm">{message.text}</p>
            </div>

            <button
              type="button"
              onClick={() => setMessage(null)}
              className="rounded-lg p-1 transition hover:bg-black/5"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* =========================
            MODE WFO / WFH
        ========================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {/* WFO */}

          <button
            type="button"
            onClick={() => setMode("WFO")}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === "WFO"
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-slate-200 bg-white hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  mode === "WFO"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">WFO</h2>

                <p className="mt-1 text-sm text-slate-500">Work From Office</p>
              </div>
            </div>
          </button>

          {/* WFH */}

          <button
            type="button"
            onClick={() => setMode("WFH")}
            className={`rounded-2xl border p-5 text-left transition ${
              mode === "WFH"
                ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-100"
                : "border-slate-200 bg-white hover:border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  mode === "WFH"
                    ? "bg-yellow-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <Home size={24} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">WFH</h2>

                <p className="mt-1 text-sm text-slate-500">Work From Home</p>
              </div>
            </div>
          </button>
        </div>

        {/* =========================
            STATUS
        ========================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Jenis Presensi Otomatis
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  {getAttendanceLabel()}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {attendanceType === "masuk"
                    ? "Sebelum pukul 12:00"
                    : "Pukul 12:00 atau setelahnya"}
                </p>
              </div>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                attendanceStatus.key === "terlambat"
                  ? "bg-yellow-50 text-yellow-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />

              {attendanceStatus.label}
            </div>
          </div>
        </div>

        {/* =========================
            CAMERA
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Camera size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Foto Presensi</h2>

                <p className="text-sm text-slate-500">
                  Pastikan wajah terlihat jelas pada kamera.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* BELUM ADA FOTO */}

            {!photo && !cameraOpen && (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Camera size={38} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  Kamera Belum Aktif
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Aktifkan kamera untuk mengambil foto sebagai bukti presensi.
                </p>

                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cameraLoading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Membuka Kamera...
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Aktifkan Kamera
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CAMERA LIVE */}

            {cameraOpen && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-video w-full object-cover"
                    style={{
                      transform: "scaleX(1)",
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[65%] w-[55%] rounded-[50%] border-2 border-white/70" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Camera size={19} />
                    Ambil Foto
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <X size={18} />
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* FOTO SUDAH DIAMBIL */}

            {photo && !cameraOpen && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                  <img
                    src={photo}
                    alt="Foto presensi"
                    className="aspect-video w-full object-cover"
                  />

                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-lg">
                    <CheckCircle2 size={15} />
                    Foto Siap
                  </div>
                </div>

                {/* BUTTON */}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    disabled={submitLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw size={18} />
                    Ambil Ulang
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitLoading || (mode === "WFO" && !location)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Kirim Presensi
                      </>
                    )}
                  </button>
                </div>

                {/* INFO SEBELUM KIRIM */}

                {mode === "WFO" && !location && (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-center text-sm text-yellow-700">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      Menunggu lokasi terdeteksi...
                    </div>
                  </div>
                )}
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* =========================
            VERIFICATION + LOCATION
        ========================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* VERIFICATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Verifikasi Presensi
                </h2>

                <p className="text-sm text-slate-500">
                  Pastikan data sudah siap sebelum dikirim.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <VerificationItem
                icon={<Camera size={18} />}
                label="Foto"
                value={photo ? "Sudah diambil" : "Belum diambil"}
                active={Boolean(photo)}
              />

              <VerificationItem
                icon={
                  mode === "WFO" ? <Building2 size={18} /> : <Home size={18} />
                }
                label="Mode"
                value={mode}
                active
              />

              <VerificationItem
                icon={<Clock3 size={18} />}
                label="Jenis Presensi"
                value={getAttendanceLabel()}
                active
              />

              {mode === "WFO" && (
                <VerificationItem
                  icon={<MapPin size={18} />}
                  label="Lokasi"
                  value={
                    locationLoading
                      ? "Mengambil lokasi..."
                      : location
                        ? "Terdeteksi otomatis"
                        : "Belum tersedia"
                  }
                  active={Boolean(location)}
                />
              )}

              {mode === "WFH" && (
                <VerificationItem
                  icon={<Home size={18} />}
                  label="Lokasi"
                  value="Tidak diperlukan untuk WFH"
                  active
                />
              )}
            </div>
          </div>

          {/* LOCATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Lokasi Presensi</h2>

                <p className="text-sm text-slate-500">
                  Lokasi terdeteksi secara otomatis.
                </p>
              </div>
            </div>

            {mode === "WFO" ? (
              <>
                {locationLoading && (
                  <div className="flex min-h-[150px] items-center justify-center rounded-2xl bg-slate-50">
                    <div className="text-center">
                      <RefreshCw
                        size={28}
                        className="mx-auto mb-3 animate-spin text-blue-600"
                      />

                      <p className="text-sm font-semibold text-slate-700">
                        Mengambil lokasi...
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Mohon tunggu sebentar
                      </p>
                    </div>
                  </div>
                )}

                {!locationLoading && location && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                        <Navigation size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-emerald-800">
                          Lokasi berhasil terdeteksi
                        </p>

                        <div className="mt-3 space-y-1 text-xs text-emerald-700">
                          <p>
                            Latitude:{" "}
                            <span className="font-semibold">
                              {location.latitude.toFixed(6)}
                            </span>
                          </p>

                          <p>
                            Longitude:{" "}
                            <span className="font-semibold">
                              {location.longitude.toFixed(6)}
                            </span>
                          </p>

                          <p>
                            Akurasi:{" "}
                            <span className="font-semibold">
                              ±{Math.round(location.accuracy)} meter
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!locationLoading && !location && locationError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <div>
                        <p className="font-semibold text-red-800">
                          Lokasi belum tersedia
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                          {locationError}
                        </p>

                        <button
                          type="button"
                          onClick={getLocation}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                        >
                          <RefreshCw size={14} />
                          Coba Lagi
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-[150px] items-center rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500 text-white">
                    <Home size={19} />
                  </div>

                  <div>
                    <p className="font-semibold text-yellow-800">
                      Presensi WFH
                    </p>

                    <p className="mt-1 text-sm leading-6 text-yellow-700">
                      Lokasi tidak diperlukan untuk presensi WFH. Cukup ambil
                      foto dan kirim presensi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================
            INFO
        ========================= */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Info size={19} />
            </div>

            <div>
              <h3 className="font-bold text-blue-900">Informasi Presensi</h3>

              <ul className="mt-2 space-y-1 text-sm leading-6 text-blue-800">
                <li>
                  • Presensi sebelum pukul <b>12:00</b> otomatis tercatat
                  sebagai <b>Presensi Masuk</b>.
                </li>

                <li>
                  • Presensi pukul <b>12:00</b> atau setelahnya otomatis
                  tercatat sebagai <b>Presensi Pulang</b>.
                </li>

                <li>
                  • Untuk WFO, lokasi akan diperoleh otomatis saat halaman Rekam
                  Presensi dibuka.
                </li>

                <li>• Untuk WFH, lokasi tidak diperlukan.</li>

                <li>
                  • Pastikan foto terlihat jelas sebelum menekan tombol{" "}
                  <b>Kirim Presensi</b>.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =========================
            FOOTER DATE
        ========================= */}

        <div className="mt-6 pb-6 text-center text-sm text-slate-500">
          {getFormattedDate()}
        </div>
      </main>
    </div>
  );
}

/* =========================
   VERIFICATION ITEM
========================= */

function VerificationItem({ icon, label, value, active = false }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active
            ? "bg-emerald-100 text-emerald-600"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>

        <p
          className={`mt-0.5 truncate text-sm font-semibold ${
            active ? "text-slate-900" : "text-slate-400"
          }`}
        >
          {value}
        </p>
      </div>

      {active && (
        <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
      )}
    </div>
  );
}

export default Presensi;
