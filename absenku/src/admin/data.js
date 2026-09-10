import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../lib/api";

/* =========================================================
   DEFAULT SCHEDULE
========================================================= */

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

/* =========================================================
   DAY
========================================================= */

export const dayKeys = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

/* =========================================================
   DATE HELPERS
========================================================= */

export function getDateKey(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateKey(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
}

export function formatDay(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
  }).format(parsed);
}

/* =========================================================
   WEEKDAY
========================================================= */

export function isWorkday(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const day = parsed.getDay();

  return day >= 1 && day <= 5;
}

/* =========================================================
   JUMLAH HARI KERJA
========================================================= */

export function countWorkdays(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return 0;
  }

  let total = 0;

  const current = new Date(start);

  while (current <= end) {
    if (isWorkday(current)) {
      total += 1;
    }

    current.setDate(current.getDate() + 1);
  }

  return total;
}

/* =========================================================
   GENERATE SEMUA HARI KERJA
========================================================= */

export function generateWorkdays(startDate, endDate) {
  const result = [];

  if (!startDate || !endDate) {
    return result;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return result;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) {
    return result;
  }

  const current = new Date(start);

  while (current <= end) {
    if (isWorkday(current)) {
      result.push(getDateKey(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return result;
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

export function normalizeAttendanceStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toUpperCase();

  if (
    value === "HADIR" ||
    value === "COMPLETED" ||
    value === "PRESENT"
  ) {
    return "Hadir";
  }

  if (
    value === "TERLAMBAT" ||
    value === "LATE"
  ) {
    return "Terlambat";
  }

  if (
    value === "IZIN" ||
    value === "LEAVE" ||
    value === "PERMISSION"
  ) {
    return "Izin";
  }

  if (
    value === "SAKIT" ||
    value === "SICK"
  ) {
    return "Sakit";
  }

  if (
    value === "TIDAK_HADIR" ||
    value === "ABSENT" ||
    value === "ALPHA" ||
    value === "TIDAK HADIR"
  ) {
    return "Tidak Hadir";
  }

  return "Belum Absen";
}

/* =========================================================
   TIME
========================================================= */

function toMinutes(value) {
  if (!value || value === "-") {
    return null;
  }

  const text = String(value);

  const parts = text.split(":");

  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

/* =========================================================
   LOCATION
========================================================= */

export function normalizeLocation(location) {
  const value = String(location ?? "")
    .toLowerCase()
    .trim();

  if (
    value === "wfh" ||
    value === "work from home" ||
    value === "rumah"
  ) {
    return "wfh";
  }

  return "kantor";
}

/* =========================================================
   STUDENT ACCOUNT START DATE
========================================================= */

export function getStudentStartDate(student) {
  if (!student) {
    return null;
  }

  const value =
    student.created_at ??
    student.createdAt ??
    student.account_created_at ??
    student.accountCreatedAt ??
    student.join_date ??
    student.joinDate ??
    student.tanggalMulai ??
    student.tanggal_mulai ??
    student.start_date ??
    student.startDate ??
    student.tanggalDaftar ??
    student.tanggal_daftar ??
    null;

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/* =========================================================
   STUDENT END DATE
   NONAKTIF -> PAKAI TANGGAL NONAKTIF
   AKTIF -> HARI INI
========================================================= */

export function getStudentEndDate(student) {
  if (!student) {
    return new Date();
  }

  const accountStatus = String(
    student.statusAkun ??
      student.account_status ??
      student.accountStatus ??
      student.status_akun ??
      student.status ??
      "",
  ).toLowerCase();

  const inactive =
    accountStatus === "nonaktif" ||
    accountStatus === "inactive" ||
    accountStatus === "disabled";

  if (inactive) {
    const inactiveDate =
      student.deactivated_at ??
      student.deactivatedAt ??
      student.tanggalNonaktif ??
      student.tanggal_nonaktif ??
      student.inactive_at ??
      student.inactiveAt ??
      null;

    if (inactiveDate) {
      const date = new Date(inactiveDate);

      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return new Date();
}

/* =========================================================
   GET TODAY SCHEDULE
========================================================= */

export function getTodaySchedule(
  settings,
  date = new Date(),
) {
  return (
    settings?.jadwal?.[
      dayKeys[date.getDay()]
    ] || null
  );
}

/* =========================================================
   WFH
========================================================= */

export function isStudentWfhDay(
  student,
  date = new Date(),
) {
  return (
    student?.wfhDays || []
  ).includes(dayKeys[date.getDay()]);
}

/* =========================================================
   DISPLAY ATTENDANCE
========================================================= */

export function getDisplayAttendance(
  student,
  settings,
  date = new Date(),
) {
  const schedule = getTodaySchedule(
    settings,
    date,
  );

  return {
    ...student,

    jamMasuk:
      student?.jamMasuk &&
      student.jamMasuk !== "-"
        ? student.jamMasuk
        : schedule?.masuk || "-",

    jamPulang:
      student?.jamPulang &&
      student.jamPulang !== "-"
        ? student.jamPulang
        : schedule?.pulang || "-",

    jadwalMasuk:
      schedule?.masuk || "-",

    jadwalPulang:
      schedule?.pulang || "-",
  };
}

/* =========================================================
   ATTENDANCE STATUS
========================================================= */

export function getAttendanceStatus(
  student,
  settings,
  date = new Date(),
) {
  if (
    ["Izin", "Sakit"].includes(
      student?.status,
    )
  ) {
    return student.status;
  }

  if (
    ["Izin", "Sakit"].includes(
      student?.statusPengajuan,
    )
  ) {
    return student.statusPengajuan;
  }

  const schedule =
    settings?.jadwal?.[
      dayKeys[date.getDay()]
    ];

  const startTime = toMinutes(
    schedule?.masuk,
  );

  const arrivalTime = toMinutes(
    student?.jamMasuk,
  );

  const arrivedLate =
    arrivalTime !== null &&
    startTime !== null &&
    arrivalTime > startTime;

  if (arrivedLate) {
    return "Terlambat";
  }

  return normalizeAttendanceStatus(
    student?.status,
  );
}

/* =========================================================
   LATE STUDENTS
========================================================= */

export function getLateStudents(
  students,
  settings,
  date = new Date(),
) {
  return (students || []).filter(
    (student) => {
      if (
        student.statusAkun ===
        "Nonaktif"
      ) {
        return false;
      }

      return (
        getAttendanceStatus(
          student,
          settings,
          date,
        ) === "Terlambat"
      );
    },
  );
}

/* =========================================================
   USE STUDENTS
   DATA UNTUK KEHADIRAN HARI INI
========================================================= */

export function useStudents() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.all([
      adminApi.students(),
      adminApi.todayAttendance(),
    ])
      .then(
        ([
          studentResult,
          todayResult,
        ]) => {
          if (!active) return;

          const todayByUser =
            new Map(
              (
                todayResult?.attendance ||
                []
              ).map((attendance) => [
                attendance.user_id,
                attendance,
              ]),
            );

          const mappedStudents =
            (
              studentResult?.students ||
              []
            ).map((student) => {
              const attendance =
                todayByUser.get(
                  student.id,
                );

              const accountStatus =
                student.statusAkun ??
                student.account_status ??
                student.accountStatus ??
                "Aktif";

              return {
                ...student,

                id: student.id,

                nama:
                  student.full_name ||
                  student.nama ||
                  "-",

                nis:
                  student.nisn ||
                  student.nis ||
                  "-",

                gmail:
                  student.email ||
                  student.gmail ||
                  "-",

                sekolah:
                  student.school ||
                  student.sekolah ||
                  "-",

                jurusan:
                  student.major ||
                  student.jurusan ||
                  "-",

                kelas:
                  student.class_name ||
                  student.kelas ||
                  "-",

                pembimbing:
                  student.pembimbing ||
                  student.supervisor_name ||
                  "-",

                noHp:
                  student.phone ||
                  student.noHp ||
                  student.nomorHp ||
                  "-",

                statusAkun:
                  accountStatus,

                status: attendance
                  ? normalizeAttendanceStatus(
                      attendance.status,
                    )
                  : "Belum Absen",

                jamMasuk:
                  attendance?.check_in_time
                    ? new Date(
                        attendance.check_in_time,
                      ).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute:
                            "2-digit",
                        },
                      )
                    : "-",

                jamPulang:
                  attendance?.check_out_time
                    ? new Date(
                        attendance.check_out_time,
                      ).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute:
                            "2-digit",
                        },
                      )
                    : "-",

                lokasi:
                  attendance
                    ?.locations?.name ||
                  "Kantor",

                foto:
                  attendance
                    ?.check_in_photo_path ||
                  "",

                wfhDays:
                  student.wfhDays ||
                  [],

                created_at:
                  student.created_at ??
                  student.createdAt ??
                  null,

                deactivated_at:
                  student.deactivated_at ??
                  student.deactivatedAt ??
                  null,
              };
            });

          setStudents(
            mappedStudents,
          );
        },
      )
      .catch(() => {
        if (active) {
          setStudents([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateStudents(
    nextStudents,
  ) {
    setStudents(nextStudents);
  }

  return [
    students,
    updateStudents,
  ];
}

/* =========================================================
   ADMIN SETTINGS
========================================================= */

export function useAdminSettings() {
  const [settings, setSettings] =
    useState(defaultSettings);

  function updateSettings(
    nextSettings,
  ) {
    setSettings(nextSettings);
  }

  return [
    settings,
    updateSettings,
  ];
}

/* =========================================================
   GET ATTENDANCE
========================================================= */

export function getAttendance(student) {
  return {
    ...student,

    lokasi:
      student.status === "Hadir" ||
      student.status === "Terlambat"
        ? "Kantor PUPR, Jakarta"
        : "Tidak hadir di lokasi",

    tanggal: formatDate(
      new Date(),
    ),

    foto: student.foto || "",
  };
}

/* =========================================================
   NORMALIZE REMOTE ATTENDANCE
========================================================= */

function normalizeRemoteAttendance(
  item,
) {
  const attendanceDate =
    item.attendance_date ??
    item.attendanceDate ??
    item.date ??
    item.tanggal ??
    item.created_at ??
    null;

  const tanggalKey =
    getDateKey(attendanceDate);

  const jamMasuk =
    item.check_in_time
      ? new Date(
          item.check_in_time,
        ).toLocaleTimeString(
          "id-ID",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : "-";

  const jamPulang =
    item.check_out_time
      ? new Date(
          item.check_out_time,
        ).toLocaleTimeString(
          "id-ID",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : "-";

  return {
    ...item,

    id: item.id,

    user_id:
      item.user_id ??
      item.userId ??
      item.profiles?.id ??
      null,

    nama:
      item.profiles?.full_name ||
      item.full_name ||
      item.nama ||
      "-",

    nis:
      item.profiles?.nisn ||
      item.nisn ||
      item.nis ||
      "-",

    kelas:
      item.profiles?.class_name ||
      item.class_name ||
      item.kelas ||
      "-",

    sekolah:
      item.profiles?.school ||
      item.school ||
      item.sekolah ||
      "-",

    jurusan:
      item.profiles?.major ||
      item.major ||
      item.jurusan ||
      "-",

    pembimbing:
      item.profiles?.pembimbing ||
      item.pembimbing ||
      "-",

    gmail:
      item.profiles?.email ||
      item.email ||
      "-",

    noHp:
      item.profiles?.phone ||
      item.phone ||
      item.noHp ||
      "-",

    tanggal:
      tanggalKey,

    tanggalObj:
      attendanceDate
        ? new Date(attendanceDate)
        : null,

    jamMasuk,

    jamPulang,

    status:
      normalizeAttendanceStatus(
        item.status,
      ),

    lokasi:
      item.locations?.name ||
      item.location_name ||
      item.lokasi ||
      "Kantor",

    lokasiKerja:
      normalizeLocation(
        item.locations?.name ||
          item.location_name ||
          item.lokasi,
      ),

    lokasiPresensi:
      item.location_address ??
      item.lokasiPresensi ??
      item.address ??
      null,

    foto:
      item.check_in_photo_path ||
      item.check_in_photo_url ||
      item.foto ||
      "",

    rawAttendance: item,
  };
}

/* =========================================================
   USE ATTENDANCE HISTORY
   SEMUA RIWAYAT ABSENSI DARI BACKEND
========================================================= */

export function useAttendanceHistory() {
  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    adminApi
      .attendanceHistory({
        limit: 10000,
      })
      .then(
        ({
          attendance = [],
        }) => {
          if (!active) return;

          const normalized =
            attendance
              .map(
                normalizeRemoteAttendance,
              )
              .filter(
                (item) =>
                  item.tanggal,
              );

          setHistory(
            normalized,
          );
        },
      )
      .catch((err) => {
        if (!active) return;

        setHistory([]);
        setError(err);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    history,
    loading,
    error,
  };
}

/* =========================================================
   BUILD COMPLETE STUDENT HISTORY
   DARI AWAL AKUN SAMPAI SEKARANG/NONAKTIF
========================================================= */

export function buildStudentHistory(
  students,
  attendanceHistory,
  settings,
  today = new Date(),
) {
  if (!Array.isArray(students)) {
    return [];
  }

  const history =
    Array.isArray(
      attendanceHistory,
    )
      ? attendanceHistory
      : [];

  const result = [];

  students.forEach(
    (student) => {
      const start =
        getStudentStartDate(
          student,
        );

      /*
       * Kalau tanggal akun tidak tersedia,
       * gunakan tanggal absensi pertama.
       */
      let firstAttendanceDate =
        null;

      const studentAttendances =
        history.filter(
          (item) =>
            String(
              item.user_id,
            ) ===
            String(student.id),
        );

      studentAttendances.forEach(
        (item) => {
          const date =
            parseDateKey(
              item.tanggal,
            );

          if (
            date &&
            (!firstAttendanceDate ||
              date <
                firstAttendanceDate)
          ) {
            firstAttendanceDate =
              date;
          }
        },
      );

      const actualStart =
        start ||
        firstAttendanceDate ||
        today;

      const end =
        getStudentEndDate(
          student,
        );

      const workdays =
        generateWorkdays(
          actualStart,
          end,
        );

      const attendanceByDate =
        new Map();

      studentAttendances.forEach(
        (attendance) => {
          if (!attendance.tanggal) {
            return;
          }

          attendanceByDate.set(
            attendance.tanggal,
            attendance,
          );
        },
      );

      workdays.forEach(
        (dateKey) => {
          const attendance =
            attendanceByDate.get(
              dateKey,
            );

          const date =
            parseDateKey(
              dateKey,
            );

          /*
           * Kalau ada absensi asli:
           * gunakan data asli.
           */
          if (attendance) {
            result.push({
              ...student,
              ...attendance,

              id:
                `${student.id}-${dateKey}`,

              user_id:
                student.id,

              nama:
                student.nama ||
                attendance.nama ||
                "-",

              nis:
                student.nis ||
                attendance.nis ||
                "-",

              kelas:
                student.kelas ||
                attendance.kelas ||
                "-",

              sekolah:
                student.sekolah ||
                attendance.sekolah ||
                "-",

              jurusan:
                student.jurusan ||
                attendance.jurusan ||
                "-",

              pembimbing:
                student.pembimbing ||
                attendance.pembimbing ||
                "-",

              gmail:
                student.gmail ||
                attendance.gmail ||
                "-",

              noHp:
                student.noHp ||
                attendance.noHp ||
                "-",

              tanggal:
                dateKey,

              tanggalObj:
                date,

              status:
                attendance.status,

              lokasiKerja:
                attendance.lokasiKerja ||
                normalizeLocation(
                  attendance.lokasi,
                ),

              lokasiPresensi:
                attendance.lokasiPresensi ||
                null,

              foto:
                attendance.foto ||
                "",

              jamMasuk:
                attendance.jamMasuk ||
                "-",

              jamPulang:
                attendance.jamPulang ||
                "-",

              hariKerjaKe:
                workdays.indexOf(
                  dateKey,
                ) + 1,

              totalHariKerja:
                workdays.length,

              tanggalMulai:
                getDateKey(
                  actualStart,
                ),

              tanggalSelesai:
                getDateKey(
                  end,
                ),

              statusAkun:
                student.statusAkun ||
                "Aktif",
            });

            return;
          }

          /*
           * Tidak ada absensi:
           * tetap dibuat sebagai TIDAK HADIR.
           */
          result.push({
            ...student,

            id:
              `${student.id}-${dateKey}`,

            user_id:
              student.id,

            nama:
              student.nama || "-",

            nis:
              student.nis || "-",

            kelas:
              student.kelas || "-",

            sekolah:
              student.sekolah || "-",

            jurusan:
              student.jurusan || "-",

            pembimbing:
              student.pembimbing || "-",

            gmail:
              student.gmail || "-",

            noHp:
              student.noHp || "-",

            tanggal:
              dateKey,

            tanggalObj:
              date,

            status:
              "Tidak Hadir",

            lokasiKerja:
              normalizeLocation(
                student.lokasi,
              ),

            lokasiPresensi:
              null,

            foto:
              "",

            jamMasuk:
              "-",

            jamPulang:
              "-",

            hariKerjaKe:
              workdays.indexOf(
                dateKey,
              ) + 1,

            totalHariKerja:
              workdays.length,

            tanggalMulai:
              getDateKey(
                actualStart,
              ),

            tanggalSelesai:
              getDateKey(
                end,
              ),

            statusAkun:
              student.statusAkun ||
              "Aktif",
          });
        },
      );
    },
  );

  return result.sort(
    (a, b) =>
      new Date(b.tanggalObj) -
      new Date(a.tanggalObj),
  );
}

/* =========================================================
   USE COMPLETE HISTORY
   INI YANG DIPAKAI HALAMAN RIWAYAT
========================================================= */

export function useCompleteAttendanceHistory() {
  const [students] =
    useStudents();

  const {
    history,
    loading,
    error,
  } =
    useAttendanceHistory();

  const [settings] =
    useAdminSettings();

  const completeHistory =
    useMemo(
      () =>
        buildStudentHistory(
          students,
          history,
          settings,
        ),
      [
        students,
        history,
        settings,
      ],
    );

  return {
    history:
      completeHistory,

    rawHistory:
      history,

    loading,

    error,
  };
}

/* =========================================================
   LEAVE REQUESTS
========================================================= */

export function useLeaveRequests() {
  const [requests, setRequests] =
    useState([]);

  useEffect(() => {
    let active = true;

    adminApi
      .leaveRequests()
      .then(
        ({
          requests:
            remoteRequests = [],
        }) => {
          if (!active) return;

          setRequests(
            remoteRequests.map(
              (request) => ({
                ...request,

                jenis:
                  request.request_type,

                tanggal:
                  request.request_date,

                alasan:
                  request.reason,

                statusPengajuan:
                  request.status,

                nama:
                  request.profiles
                    ?.full_name,

                nis:
                  request.profiles
                    ?.nisn,
              }),
            ),
          );
        },
      )
      .catch(() => {
        if (active) {
          setRequests([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function updateRequests(
    nextRequests,
  ) {
    setRequests(
      nextRequests,
    );

    nextRequests.forEach(
      (request, index) => {
        const previous =
          requests[index];

        if (
          request.id &&
          request.statusPengajuan !==
            previous?.statusPengajuan
        ) {
          adminApi
            .updateLeaveRequest(
              request.id,
              request.statusPengajuan,
            )
            .catch(() => {});
        }
      },
    );
  }

  return [
    requests,
    updateRequests,
  ];
}