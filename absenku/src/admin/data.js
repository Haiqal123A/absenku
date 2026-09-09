import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";

const defaultSchedule = {
  senin: { masuk: "08:00", pulang: "16:00" },
  selasa: { masuk: "08:00", pulang: "16:00" },
  rabu: { masuk: "08:00", pulang: "16:00" },
  kamis: { masuk: "08:00", pulang: "16:00" },
  jumat: { masuk: "08:00", pulang: "16:00" },
};

export const defaultSettings = {
  nama: "Administrator",
  lokasi: "Kantor PUPR, Jakarta",
  jadwal: defaultSchedule,
};

function formatDate(dateKey) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

export function useStudents() {
  const [students, setStudents] = useState([]);

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
      })
      .catch(() => {
        if (active) setStudents([]);
      });

    return () => {
      active = false;
    };
  }, []);

  function updateStudents(nextStudents) {
    setStudents(nextStudents);
  }

  return [students, updateStudents];
}

export function useAdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);

  function updateSettings(nextSettings) {
    setSettings(nextSettings);
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
    tanggal: formatDate(new Date().toISOString().slice(0, 10)),
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

    return () => {
      active = false;
    };
  }, []);

  return history;
}

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
