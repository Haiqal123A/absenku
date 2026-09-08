import { useEffect, useState } from "react";

const STORAGE_KEY = "absenku-students";
const DATE_KEY = "absenku-attendance-date";
const HISTORY_KEY = "absenku-attendance-history";
const SETTINGS_KEY = "absenku-settings";
export const LEAVE_REQUESTS_KEY = "absenku-leave-requests";

const defaultSchedule = {
  senin: { masuk: "08:00", pulang: "16:00" },
  selasa: { masuk: "08:00", pulang: "16:00" },
  rabu: { masuk: "08:00", pulang: "16:00" },
  kamis: { masuk: "08:00", pulang: "16:00" },
  jumat: { masuk: "08:00", pulang: "16:00" },
};

const defaultSettings = {
  nama: "Administrator",
  lokasi: "Kantor PUPR, Jakarta",
  jadwal: defaultSchedule,
};

export const initialStudents = [
  {
    id: 1,
    nama: "Andi Pratama",
    nis: "23001",
    jurusan: "Rekayasa Perangkat Lunak",
    gmail: "andi.pratama@gmail.com",
    noHp: "081234567890",
    kelas: "XI RPL 1",
    sekolah: "SMK Negeri 1",
    pembimbing: "Bapak Ahmad",
    status: "Hadir",
    statusAkun: "Aktif",
    wfhDays: [],
    jamMasuk: "07:48",
    jamPulang: "16:02",
  },
  {
    id: 2,
    nama: "Budi Santoso",
    nis: "23002",
    jurusan: "Teknik Komputer dan Jaringan",
    gmail: "budi.santoso@gmail.com",
    noHp: "081234567891",
    kelas: "XI RPL 2",
    sekolah: "SMK Negeri 2",
    pembimbing: "Ibu Sinta",
    status: "Hadir",
    statusAkun: "Aktif",
    wfhDays: [],
    jamMasuk: "07:55",
    jamPulang: "16:00",
  },
  {
    id: 3,
    nama: "Citra Lestari",
    nis: "23003",
    jurusan: "Teknik Komputer dan Jaringan",
    gmail: "citra.lestari@gmail.com",
    noHp: "081234567892",
    kelas: "XI TKJ 1",
    sekolah: "SMK Negeri 1",
    pembimbing: "Bapak Ahmad",
    status: "Terlambat",
    statusAkun: "Aktif",
    wfhDays: [],
    jamMasuk: "08:12",
    jamPulang: "16:00",
  },
  {
    id: 4,
    nama: "Dimas Saputra",
    nis: "23004",
    jurusan: "Multimedia",
    gmail: "dimas.saputra@gmail.com",
    noHp: "081234567893",
    kelas: "XI TKJ 2",
    sekolah: "SMK Negeri 3",
    pembimbing: "Ibu Sinta",
    status: "Sakit",
    statusAkun: "Aktif",
    wfhDays: [],
    jamMasuk: "-",
    jamPulang: "-",
  },
];

function readStudents() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored).map((student) => ({
          ...student,
          jurusan: student.jurusan || "",
          gmail: student.gmail || "",
          noHp: student.noHp || "",
          statusAkun: student.statusAkun || "Aktif",
          wfhDays: student.wfhDays || [],
        }))
      : initialStudents;
  } catch {
    return initialStudents;
  }
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function readHistory() {
  try {
    const stored = window.localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function readLeaveRequests() {
  try {
    const stored = window.localStorage.getItem(LEAVE_REQUESTS_KEY);
    const requests = stored ? JSON.parse(stored) : [];
    return Array.isArray(requests) ? requests : [];
  } catch {
    return [];
  }
}

function readSettings() {
  try {
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      ...defaultSettings,
      ...parsed,
      jadwal: Object.keys(defaultSchedule).reduce(
        (schedule, day) => ({
          ...schedule,
          [day]: {
            ...defaultSchedule[day],
            ...(parsed.jadwal?.[day] || {}),
          },
        }),
        {},
      ),
    };
  } catch {
    return defaultSettings;
  }
}

function readStudentsForToday() {
  const students = readStudents();
  const today = getTodayKey();
  const lastDate = window.localStorage.getItem(DATE_KEY);

  if (!lastDate) {
    window.localStorage.setItem(DATE_KEY, today);
    return students;
  }

  if (lastDate === today) return students;

  const archived = students.map((student) => ({
    ...student,
    tanggal: formatDate(lastDate),
  }));
  const history = [...archived, ...readHistory()];
  const resetStudents = students.map((student) => ({
    ...student,
    status: "Belum Absen",
    jamMasuk: "-",
    jamPulang: "-",
  }));

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resetStudents));
  window.localStorage.setItem(DATE_KEY, today);
  return resetStudents;
}

export function useStudents() {
  const [students, setStudents] = useState(readStudentsForToday);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === null) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }

    const syncStudents = () => setStudents(readStudentsForToday());
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) syncStudents();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("absenku-students-updated", syncStudents);
    window.addEventListener("absenku-history-updated", syncStudents);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("absenku-students-updated", syncStudents);
      window.removeEventListener("absenku-history-updated", syncStudents);
    };
  }, [students]);

  function updateStudents(nextStudents) {
    setStudents(nextStudents);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents));
    window.localStorage.setItem(DATE_KEY, getTodayKey());
    window.dispatchEvent(new Event("absenku-students-updated"));
    window.dispatchEvent(new Event("absenku-history-updated"));
  }

  return [students, updateStudents];
}

export function useAdminSettings() {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    const syncSettings = () => setSettings(readSettings());
    window.addEventListener("storage", syncSettings);
    window.addEventListener("absenku-settings-updated", syncSettings);

    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("absenku-settings-updated", syncSettings);
    };
  }, []);

  function updateSettings(nextSettings) {
    setSettings(nextSettings);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
    window.dispatchEvent(new Event("absenku-settings-updated"));
  }

  return [settings, updateSettings];
}

export function getAttendance(student) {
  return {
    ...student,
    lokasi:
      student.status === "Hadir" || student.status === "Terlambat"
        ? "Kantor PUPR, Jakarta"
        : "Tidak hadir di lokasi",
    tanggal: formatDate(getTodayKey()),
    foto: student.foto || "",
  };
}

const dayKeys = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];

function toMinutes(value) {
  if (!value || value === "-") return null;
  const [hours, minutes] = value.split(":").map(Number);
  return Number.isNaN(hours) || Number.isNaN(minutes)
    ? null
    : hours * 60 + minutes;
}

export function getAttendanceStatus(student, settings, date = new Date()) {
  if (["Izin", "Sakit"].includes(student.status)) return student.status;

  const schedule = settings.jadwal?.[dayKeys[date.getDay()]];
  const startTime = toMinutes(schedule?.masuk);
  const arrivalTime = toMinutes(student.jamMasuk);

  const arrivedLate =
    arrivalTime !== null && startTime !== null && arrivalTime > startTime;

  return arrivedLate
    ? "Terlambat"
    : student.status;
}

export function getTodaySchedule(settings, date = new Date()) {
  return settings.jadwal?.[dayKeys[date.getDay()]] || null;
}

export function isStudentWfhDay(student, date = new Date()) {
  return (student.wfhDays || []).includes(dayKeys[date.getDay()]);
}

export function getDisplayAttendance(student, settings, date = new Date()) {
  const schedule = getTodaySchedule(settings, date);

  return {
    ...student,
    jamMasuk:
      student.jamMasuk && student.jamMasuk !== "-"
        ? student.jamMasuk
        : schedule?.masuk || "-",
    jamPulang:
      student.jamPulang && student.jamPulang !== "-"
        ? student.jamPulang
        : schedule?.pulang || "-",
  };
}

export function getLateStudents(students, settings, date = new Date()) {
  return students.filter((student) => {
    if (student.statusAkun === "Nonaktif") return false;
    return getAttendanceStatus(student, settings, date) === "Terlambat";
  });
}

export function useAttendanceHistory() {
  const [history, setHistory] = useState(readHistory);

  useEffect(() => {
    const syncHistory = () => setHistory(readHistory());
    window.addEventListener("storage", syncHistory);
    window.addEventListener("absenku-history-updated", syncHistory);

    return () => {
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener("absenku-history-updated", syncHistory);
    };
  }, []);

  return history;
}

// Dipakai bersama halaman user dan admin. Pengajuan baru disimpan sebagai array
// pada localStorage `absenku-leave-requests` lalu event ini dikirimkan.
export function useLeaveRequests() {
  const [requests, setRequests] = useState(readLeaveRequests);

  useEffect(() => {
    const syncRequests = () => setRequests(readLeaveRequests());
    const handleStorage = (event) => {
      if (event.key === LEAVE_REQUESTS_KEY) syncRequests();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("absenku-leave-requests-updated", syncRequests);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("absenku-leave-requests-updated", syncRequests);
    };
  }, []);

  function updateRequests(nextRequests) {
    setRequests(nextRequests);
    window.localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(nextRequests));
    window.dispatchEvent(new Event("absenku-leave-requests-updated"));
  }

  return [requests, updateRequests];
}
