import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

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
  const [students, setStudents] = useState([]);
  const [loadedFromBackend, setLoadedFromBackend] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([adminApi.students(), adminApi.todayAttendance()])
      .then(([studentResult, todayResult]) => {
        if (!active) return;

        const todayByUser = new Map(
          (todayResult.attendance || []).map((attendance) => [
            attendance.user_id,
            attendance,
          ]),
        );

        setStudents(
          (studentResult.students || []).map((student) => {
            const attendance = todayByUser.get(student.id);
            return {
              ...student,
              id: student.id,
              nama: student.full_name || "-",
              nis: student.nisn || "-",
              gmail: student.email || "-",
              sekolah: student.school || "-",
              jurusan: student.major || "-",
              statusAkun: "Aktif",
              status: attendance
                ? attendance.status === "COMPLETED"
                  ? "Hadir"
                  : "Hadir"
                : "Belum Absen",
              jamMasuk: attendance?.check_in_time
                ? new Date(attendance.check_in_time).toLocaleTimeString(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "-",
              jamPulang: attendance?.check_out_time
                ? new Date(attendance.check_out_time).toLocaleTimeString(
                    "id-ID",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "-",
              lokasi: attendance?.locations?.name || "Kantor",
              foto: attendance?.check_in_photo_path || "",
              wfhDays: [],
            };
          }),
        );
        setLoadedFromBackend(true);
      })
      .catch(() => {
        if (active) setStudents([]);
      });

    const syncStudents = () => setStudents(readStudentsForToday());
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) syncStudents();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("absenku-students-updated", syncStudents);
    window.addEventListener("absenku-history-updated", syncStudents);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("absenku-students-updated", syncStudents);
      window.removeEventListener("absenku-history-updated", syncStudents);
    };
  }, [loadedFromBackend]);

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

const dayKeys = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

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

  return arrivedLate ? "Terlambat" : student.status;
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
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;

    adminApi
      .attendanceHistory({ limit: 500 })
      .then(({ attendance = [] }) => {
        if (!active) return;

        setHistory(
          attendance.map((item) => ({
            ...item,
            id: item.id,
            nama: item.profiles?.full_name || "-",
            nis: item.profiles?.nisn || "-",
            sekolah: item.profiles?.school || "-",
            jurusan: item.profiles?.major || "-",
            tanggal: item.attendance_date,
            jamMasuk: item.check_in_time
              ? new Date(item.check_in_time).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
            jamPulang: item.check_out_time
              ? new Date(item.check_out_time).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
            status: item.status === "COMPLETED" ? "Hadir" : "Hadir",
            lokasi: item.locations?.name || "Kantor",
            foto: item.check_in_photo_path || "",
          })),
        );
      })
      .catch(() => {
        if (active) setHistory([]);
      });

    const syncHistory = () => setHistory(readHistory());
    window.addEventListener("storage", syncHistory);
    window.addEventListener("absenku-history-updated", syncHistory);

    return () => {
      active = false;
      window.removeEventListener("storage", syncHistory);
      window.removeEventListener("absenku-history-updated", syncHistory);
    };
  }, []);

  return history;
}

// Dipakai bersama halaman user dan admin. Pengajuan baru disimpan sebagai array
// pada localStorage `absenku-leave-requests` lalu event ini dikirimkan.
export function useLeaveRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    let active = true;
    adminApi
      .leaveRequests()
      .then(({ requests: remoteRequests = [] }) => {
        if (!active) return;
        setRequests(
          remoteRequests.map((request) => ({
            ...request,
            jenis: request.request_type,
            tanggal: request.request_date,
            alasan: request.reason,
            statusPengajuan: request.status,
            nama: request.profiles?.full_name,
            nis: request.profiles?.nisn,
          })),
        );
      })
      .catch(() => {
        if (active) setRequests([]);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateRequests(nextRequests) {
    setRequests(nextRequests);

    nextRequests.forEach((request, index) => {
      const previous = requests[index];
      if (request.id && request.statusPengajuan !== previous?.statusPengajuan) {
        adminApi
          .updateLeaveRequest(request.id, request.statusPengajuan)
          .catch(() => {});
      }
    });
  }

  return [requests, updateRequests];
}
