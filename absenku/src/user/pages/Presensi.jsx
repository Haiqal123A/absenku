import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Send,
  ShieldCheck,
  AlertCircle,
  Navigation,
  X,
  Info,
  Building2,
  Home,
} from "lucide-react";

import UserNavbar from "../components/UserNavbar";
import { attendanceApi } from "../../lib/api";

/*
|--------------------------------------------------------------------------
| KONFIGURASI LOKASI KANTOR
|--------------------------------------------------------------------------
|
| Ganti latitude dan longitude di bawah dengan koordinat kantor PUPR.
|
| radius: jarak maksimal dari titik kantor agar dianggap WFO.
| Contoh 100 berarti radius 100 meter.
|
*/

const OFFICE_LOCATION = {
  latitude: -6.2,
  longitude: 106.816666,
  radius: 100,
};

/*
|--------------------------------------------------------------------------
| UTILITIES
|--------------------------------------------------------------------------
*/

function getAttendanceType(date = new Date()) {
  return date.getHours() < 12 ? "masuk" : "pulang";
}

function getAttendanceLabel(date = new Date()) {
  return getAttendanceType(date) === "masuk"
    ? "Presensi Masuk"
    : "Presensi Pulang";
}

function getAttendanceStatus(date = new Date()) {
  const type = getAttendanceType(date);

  if (type === "pulang") {
    return {
      key: "pulang",
      label: "Presensi Pulang",
    };
  }

  const hour = date.getHours();
  const minute = date.getMinutes();

  /*
   * Batas tepat waktu:
   * sebelum atau sampai 07:30 = tepat waktu
   * setelah 07:30 = terlambat
   */

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
}

function getFormattedDate(date = new Date()) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getFormattedTime(date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| HITUNG JARAK DARI KANTOR
|--------------------------------------------------------------------------
|
| Haversine formula.
| Hasil dalam meter.
|
*/

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;

  const latitude1 = (lat1 * Math.PI) / 180;
  const latitude2 = (lat2 * Math.PI) / 180;

  const deltaLatitude = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLongitude = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

/*
|--------------------------------------------------------------------------
| TENTUKAN MODE OTOMATIS
|--------------------------------------------------------------------------
*/

function determineWorkMode(location) {
  if (!location) return null;

  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude,
  );

  return {
    mode: distance <= OFFICE_LOCATION.radius ? "WFO" : "WFH",
    distance,
  };
}

/*
|--------------------------------------------------------------------------
| KOMPONEN UTAMA
|--------------------------------------------------------------------------
*/

function Presensi() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [photo, setPhoto] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [workMode, setWorkMode] = useState(null);
  const [distanceFromOffice, setDistanceFromOffice] = useState(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const attendanceType = getAttendanceType(currentTime);
  const attendanceStatus = getAttendanceStatus(currentTime);

  /*
  |--------------------------------------------------------------------------
  | JAM REALTIME
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AMBIL LOKASI SAAT HALAMAN DIBUKA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    getLocation();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | PASANG CAMERA STREAM
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | CLEANUP CAMERA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | GET LOCATION
  |--------------------------------------------------------------------------
  */

  function getLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        "Browser kamu tidak mendukung akses lokasi.",
      );

      return;
    }

    setLocationLoading(true);
    setLocationError("");
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        const workLocation = determineWorkMode(nextLocation);

        setLocation(nextLocation);
        setWorkMode(workLocation?.mode || null);
        setDistanceFromOffice(workLocation?.distance || null);

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
          errorMessage =
            "Lokasi sedang tidak tersedia.";
        }

        if (error.code === error.TIMEOUT) {
          errorMessage =
            "Waktu pengambilan lokasi habis. Silakan coba lagi.";
        }

        setLocation(null);
        setWorkMode(null);
        setDistanceFromOffice(null);
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

  /*
  |--------------------------------------------------------------------------
  | START CAMERA
  |--------------------------------------------------------------------------
  */

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

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

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
        errorMessage =
          "Kamera tidak ditemukan pada perangkat ini.";
      }

      if (error?.name === "NotReadableError") {
        errorMessage =
          "Kamera sedang digunakan oleh aplikasi lain.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STOP CAMERA
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | CAPTURE PHOTO
  |--------------------------------------------------------------------------
  */

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

    context.drawImage(
      video,
      0,
      0,
      width,
      height,
    );

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.85,
    );

    setPhoto(imageData);

    stopCamera();

    setMessage({
      type: "success",
      text: "Foto berhasil diambil. Silakan kirim presensi.",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | RETAKE
  |--------------------------------------------------------------------------
  */

  const retakePhoto = () => {
    setPhoto("");
    setMessage(null);
    startCamera();
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT PRESENSI
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {
    setMessage(null);

    if (!photo) {
      setMessage({
        type: "error",
        text: "Silakan buka kamera dan ambil foto terlebih dahulu.",
      });

      return;
    }

    if (!location) {
      setMessage({
        type: "error",
        text: "Lokasi belum tersedia. Silakan refresh lokasi terlebih dahulu.",
      });

      getLocation();
      return;
    }

    if (!workMode) {
      setMessage({
        type: "error",
        text: "Mode lokasi belum dapat ditentukan. Silakan refresh lokasi.",
      });

      return;
    }

    try {
      setSubmitLoading(true);

      /*
       * Ambil status terbaru dari server.
       * Jadi tidak hanya mengandalkan jam di frontend.
       */

      const today = await attendanceApi.today();

      const payload = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        photo_base64: photo,

        /*
         * Mode otomatis.
         *
         * Pastikan backend mengabaikan field ini jika
         * belum mendukungnya.
         */
        work_mode: workMode,

        /*
         * Jarak dari kantor untuk informasi/verifikasi.
         */
        distance_from_office: Math.round(
          distanceFromOffice || 0,
        ),
      };

      /*
       * Sebelum 12:00 = check in
       * 12:00 atau setelahnya = check out
       *
       * Tetapi tetap mempertimbangkan status server:
       * kalau belum check-in -> checkIn
       * kalau sudah check-in -> checkOut
       */

      let result;

      if (attendanceType === "masuk") {
        if (today.has_checked_in) {
          setMessage({
            type: "error",
            text: "Presensi masuk hari ini sudah tercatat.",
          });

          return;
        }

        result = await attendanceApi.checkIn(payload);
      } else {
        if (!today.has_checked_in) {
          setMessage({
            type: "error",
            text: "Presensi masuk belum tercatat. Presensi pulang belum dapat dilakukan.",
          });

          return;
        }

        if (today.check_out_time) {
          setMessage({
            type: "error",
            text: "Presensi pulang hari ini sudah tercatat.",
          });

          return;
        }

        result = await attendanceApi.checkOut(payload);
      }

      setMessage({
        type: "success",
        text:
          result?.check_out_time ||
          attendanceType === "pulang"
            ? `Presensi pulang ${workMode} berhasil disimpan.`
            : `Presensi masuk ${workMode} berhasil disimpan.`,
      });

      setPhoto("");

      /*
       * Refresh lokasi setelah presensi.
       */

      getLocation();
    } catch (error) {
      console.error("Submit attendance error:", error);

      setMessage({
        type: "error",
        text:
          error?.message ||
          "Presensi gagal dikirim. Silakan coba lagi.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <UserNavbar />

      <main className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

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
                Sistem otomatis menentukan WFO/WFH dan jenis presensi.
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

        {/* =====================================================
            MESSAGE
        ====================================================== */}

        {message && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.type === "success" ? (
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

            <div className="flex-1">
              <p className="text-sm font-semibold">
                {message.type === "success"
                  ? "Berhasil"
                  : "Terjadi Kesalahan"}
              </p>

              <p className="mt-0.5 text-sm">
                {message.text}
              </p>
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

        {/* =====================================================
            STATUS PRESENSI
        ====================================================== */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {/* JENIS PRESENSI */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={24} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Jenis Presensi
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  {getAttendanceLabel(currentTime)}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {attendanceType === "masuk"
                    ? "Sebelum pukul 12:00"
                    : "Pukul 12:00 atau setelahnya"}
                </p>
              </div>
            </div>
          </div>

          {/* MODE OTOMATIS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  workMode === "WFO"
                    ? "bg-blue-50 text-blue-600"
                    : workMode === "WFH"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {workMode === "WFO" ? (
                  <Building2 size={24} />
                ) : (
                  <Home size={24} />
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Mode Presensi
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  {workMode || "Menentukan..."}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {workMode === "WFO"
                    ? "Di dalam radius kantor"
                    : workMode === "WFH"
                      ? "Di luar radius kantor"
                      : "Menunggu lokasi"}
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  attendanceStatus.key === "terlambat"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <CheckCircle2 size={24} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Status Waktu
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  {attendanceStatus.label}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Status ditentukan otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            LOCATION
        ====================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  location
                    ? workMode === "WFO"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <MapPin size={24} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Lokasi Presensi
                </p>

                <h2 className="mt-1 font-bold text-slate-900">
                  {locationLoading
                    ? "Mengambil lokasi..."
                    : location
                      ? workMode === "WFO"
                        ? "WFO — Dalam Radius Kantor"
                        : "WFH — Di Luar Radius Kantor"
                      : "Lokasi belum tersedia"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {location
                    ? distanceFromOffice !== null
                      ? `${Math.round(
                          distanceFromOffice,
                        )} meter dari titik kantor`
                      : "Lokasi berhasil terdeteksi"
                    : "Lokasi diperlukan untuk menentukan mode presensi"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={getLocation}
              disabled={locationLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  locationLoading
                    ? "animate-spin"
                    : ""
                }
              />

              {locationLoading
                ? "Mengambil..."
                : "Refresh Lokasi"}
            </button>
          </div>

          {/* LOCATION DETAIL */}

          {location && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <LocationItem
                label="Latitude"
                value={location.latitude.toFixed(6)}
              />

              <LocationItem
                label="Longitude"
                value={location.longitude.toFixed(6)}
              />

              <LocationItem
                label="Akurasi"
                value={`±${Math.round(
                  location.accuracy,
                )} meter`}
              />
            </div>
          )}

          {/* LOCATION ERROR */}

          {!location && !locationLoading && locationError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="font-semibold text-red-800">
                    Lokasi belum tersedia
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {locationError}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            CAMERA / PHOTO
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* HEADER */}

          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Camera size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Foto Presensi
                </h2>

                <p className="text-sm text-slate-500">
                  Ambil foto sebagai bukti presensi.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* =================================================
                BELUM FOTO & CAMERA BELUM OPEN
            ================================================== */}

            {!photo && !cameraOpen && (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Camera size={38} />
                </div>

                <h3 className="text-lg font-bold text-slate-900">
                  Siap Melakukan Presensi?
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Pastikan lokasi sudah terdeteksi, kemudian buka kamera
                  untuk mengambil foto.
                </p>

                <button
                  type="button"
                  onClick={startCamera}
                  disabled={cameraLoading}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                      <Camera size={18} />

                      Buka Kamera
                    </>
                  )}
                </button>
              </div>
            )}

            {/* =================================================
                CAMERA LIVE
            ================================================== */}

            {cameraOpen && (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="aspect-video w-full object-cover"
                  />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[65%] w-[55%] rounded-[50%] border-2 border-white/70" />
                  </div>

                  <div className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                    Posisikan wajah di dalam frame
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#073b9e] px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
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

            {/* =================================================
                FOTO SIAP
            ================================================== */}

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

                {/* ACTION BUTTON */}

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
                    disabled={
                      submitLoading ||
                      !location ||
                      !workMode
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#ffd51c] px-5 py-3 font-bold text-[#073b9e] shadow-sm transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
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
                        Kirim Presensi
                      </>
                    )}
                  </button>
                </div>

                {!location && (
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-sm font-medium text-yellow-700">
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />

                    Menunggu lokasi terdeteksi...
                  </div>
                )}
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
        </div>

        {/* =====================================================
            VERIFICATION
        ====================================================== */}

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
                  Data yang akan dikirim ke server.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <VerificationItem
                icon={<Camera size={18} />}
                label="Foto"
                value={
                  photo
                    ? "Sudah diambil"
                    : "Belum diambil"
                }
                active={Boolean(photo)}
              />

              <VerificationItem
                icon={
                  workMode === "WFO" ? (
                    <Building2 size={18} />
                  ) : (
                    <Home size={18} />
                  )
                }
                label="Mode"
                value={
                  workMode === "WFO"
                    ? "WFO — Kantor"
                    : workMode === "WFH"
                      ? "WFH — Di luar kantor"
                      : "Menentukan..."
                }
                active={Boolean(workMode)}
              />

              <VerificationItem
                icon={<Clock3 size={18} />}
                label="Jenis Presensi"
                value={getAttendanceLabel(
                  currentTime,
                )}
                active
              />

              <VerificationItem
                icon={<MapPin size={18} />}
                label="Lokasi"
                value={
                  locationLoading
                    ? "Mengambil lokasi..."
                    : location
                      ? `${Math.round(
                          distanceFromOffice || 0,
                        )} meter dari kantor`
                      : "Belum tersedia"
                }
                active={Boolean(location)}
              />
            </div>
          </div>

          {/* LOCATION EXPLANATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Navigation size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Penentuan Lokasi
                </h2>

                <p className="text-sm text-slate-500">
                  Sistem menentukan mode secara otomatis.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className={`rounded-2xl border p-4 ${
                  workMode === "WFO"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      WFO
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Otomatis jika posisi berada di dalam radius kantor.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  workMode === "WFH"
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white">
                    <Home size={19} />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      WFH
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Otomatis jika posisi berada di luar radius kantor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            INFO
        ====================================================== */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Info size={19} />
            </div>

            <div>
              <h3 className="font-bold text-blue-900">
                Informasi Presensi
              </h3>

              <ul className="mt-2 space-y-1 text-sm leading-6 text-blue-800">
                <li>
                  • Lokasi otomatis diambil saat halaman presensi dibuka.
                </li>

                <li>
                  • Gunakan tombol <b>Refresh Lokasi</b> jika posisi belum
                  akurat.
                </li>

                <li>
                  • Di dalam radius kantor otomatis tercatat sebagai{" "}
                  <b>WFO</b>.
                </li>

                <li>
                  • Di luar radius kantor otomatis tercatat sebagai{" "}
                  <b>WFH</b>.
                </li>

                <li>
                  • Sebelum pukul <b>12:00</b> otomatis menjadi{" "}
                  <b>Presensi Masuk</b>.
                </li>

                <li>
                  • Pukul <b>12:00</b> atau setelahnya otomatis menjadi{" "}
                  <b>Presensi Pulang</b>.
                </li>

                <li>
                  • Foto wajib diambil sebelum presensi dikirim.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER DATE
        ====================================================== */}

        <div className="mt-6 pb-6 text-center text-sm text-slate-500">
          {getFormattedDate(currentTime)}
        </div>
      </main>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOCATION ITEM
|--------------------------------------------------------------------------
*/

function LocationItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| VERIFICATION ITEM
|--------------------------------------------------------------------------
*/

function VerificationItem({
  icon,
  label,
  value,
  active = false,
}) {
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
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p
          className={`mt-0.5 truncate text-sm font-semibold ${
            active
              ? "text-slate-900"
              : "text-slate-400"
          }`}
        >
          {value}
        </p>
      </div>

      {active && (
        <CheckCircle2
          size={18}
          className="shrink-0 text-emerald-500"
        />
      )}
    </div>
  );
}

export default Presensi;