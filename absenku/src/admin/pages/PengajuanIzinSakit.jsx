import { useMemo, useState } from "react";

import {
  CalendarDays,
  ClipboardList,
  FileText,
  HeartPulse,
  Search,
  UserRound,
  Users,
  GraduationCap,
  X,
  ChevronRight,
  Info,
} from "lucide-react";

import {
  useLeaveRequests,
  useStudents,
} from "../data";

const MONTHLY_LIMIT = 4;

/* =========================================================
   HELPERS
========================================================= */

function requestType(request) {
  const value = String(
    request?.jenis ||
      request?.type ||
      request?.keteranganStatus ||
      request?.status ||
      "",
  ).toLowerCase();

  return value.includes("sakit") ? "Sakit" : "Izin";
}

/* =========================================================
   DATE
========================================================= */

function requestDate(request) {
  return String(
    request?.tanggal ||
      request?.tanggalIzin ||
      request?.date ||
      request?.createdAt ||
      "",
  ).slice(0, 10);
}

function formatDate(value) {
  if (!value) {
    return "Tanggal belum tersedia";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/* =========================================================
   MONTH
========================================================= */

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;
}

/* =========================================================
   STUDENT
========================================================= */

function getStudentKey(student) {
  return String(
    student?.nis ||
      student?.id ||
      student?.studentId ||
      "",
  );
}

function getRequestStudentKey(request) {
  return String(
    request?.nis ||
      request?.studentNis ||
      request?.studentId ||
      request?.idSiswa ||
      "",
  );
}

function getStudentName(student) {
  return (
    student?.nama ||
    student?.namaSiswa ||
    student?.studentName ||
    student?.name ||
    "Siswa belum diketahui"
  );
}

function getStudentClass(student) {
  return (
    student?.kelas ||
    student?.className ||
    student?.kelasSiswa ||
    student?.rombel ||
    student?.class ||
    "-"
  );
}

function getStudentMajor(student) {
  return (
    student?.jurusan ||
    student?.jurusanSiswa ||
    student?.programKeahlian ||
    student?.programStudi ||
    student?.prodi ||
    student?.major ||
    student?.keahlian ||
    "-"
  );
}

function getRequestName(request) {
  return (
    request?.nama ||
    request?.namaSiswa ||
    request?.studentName ||
    request?.name ||
    "Siswa belum diketahui"
  );
}

/* =========================================================
   REASON
========================================================= */

function getRequestReason(request) {
  return (
    request?.alasan ||
    request?.keterangan ||
    request?.reason ||
    request?.deskripsi ||
    request?.catatan ||
    "Tidak ada keterangan."
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function PengajuanIzinSakit() {
  const [requests] = useLeaveRequests();
  const [students] = useStudents();

  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const currentMonth = getCurrentMonth();

  const safeRequests = Array.isArray(requests)
    ? requests
    : [];

  const safeStudents = Array.isArray(students)
    ? students
    : [];

  /* =========================================================
     STUDENT MAP
  ========================================================= */

  const studentMap = useMemo(() => {
    const map = new Map();

    safeStudents.forEach((student) => {
      const key = getStudentKey(student);

      if (key) {
        map.set(key, student);
      }
    });

    return map;
  }, [safeStudents]);

  /* =========================================================
     NORMALIZE
  ========================================================= */

  const normalizedRequests = useMemo(() => {
    return safeRequests.map((request, index) => {
      const studentKey =
        getRequestStudentKey(request);

      const student =
        studentMap.get(studentKey);

      const id =
        request?.id ||
        `${studentKey || "request"}-${index}`;

      return {
        ...request,

        id,
        studentKey,

        studentName: student
          ? getStudentName(student)
          : getRequestName(request),

        studentNis: String(
          request?.nis ||
            request?.studentNis ||
            student?.nis ||
            "-",
        ),

        kelas: student
          ? getStudentClass(student)
          : request?.kelas ||
            request?.className ||
            request?.rombel ||
            "-",

        jurusan: student
          ? getStudentMajor(student)
          : request?.jurusan ||
            request?.programKeahlian ||
            request?.prodi ||
            "-",

        type: requestType(request),
        date: requestDate(request),
        reason: getRequestReason(request),
      };
    });
  }, [safeRequests, studentMap]);

  /* =========================================================
     MONTHLY REQUESTS
========================================================= */

  const monthlyRequests = useMemo(() => {
    return normalizedRequests.filter((request) =>
      request.date.startsWith(currentMonth),
    );
  }, [normalizedRequests, currentMonth]);

  /* =========================================================
     UNIQUE STUDENTS
========================================================= */

  const studentsWithRequests = useMemo(() => {
    return new Set(
      monthlyRequests
        .map(
          (request) =>
            request.studentNis ||
            request.studentKey,
        )
        .filter(Boolean),
    );
  }, [monthlyRequests]);

  const izinStudents = useMemo(() => {
    return new Set(
      monthlyRequests
        .filter(
          (request) =>
            request.type === "Izin",
        )
        .map(
          (request) =>
            request.studentNis ||
            request.studentKey,
        )
        .filter(Boolean),
    );
  }, [monthlyRequests]);

  const sakitStudents = useMemo(() => {
    return new Set(
      monthlyRequests
        .filter(
          (request) =>
            request.type === "Sakit",
        )
        .map(
          (request) =>
            request.studentNis ||
            request.studentKey,
        )
        .filter(Boolean),
    );
  }, [monthlyRequests]);

  /* =========================================================
     FILTER + SEARCH
  ========================================================= */

  const visibleRequests = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return normalizedRequests
      .filter((request) => {
        if (filter === "Semua") {
          return true;
        }

        return request.type === filter;
      })
      .filter((request) => {
        if (!keyword) {
          return true;
        }

        return [
          request.studentName,
          request.studentNis,
          request.kelas,
          request.jurusan,
          request.type,
          request.reason,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      })
      .sort((a, b) =>
        String(b.date).localeCompare(
          String(a.date),
        ),
      );
  }, [
    normalizedRequests,
    filter,
    search,
  ]);

  /* =========================================================
     QUOTA
     Izin + sakit memakai kuota yang sama
  ========================================================= */

  function getQuota(request) {
    const studentKey =
      request.studentNis ||
      request.studentKey;

    return monthlyRequests.filter(
      (item) => {
        const itemKey =
          item.studentNis ||
          item.studentKey;

        return itemKey === studentKey;
      },
    ).length;
  }

  /* =========================================================
     MONTH LABEL
  ========================================================= */

  const monthLabel = new Intl.DateTimeFormat(
    "id-ID",
    {
      month: "long",
      year: "numeric",
    },
  ).format(new Date());

  /* =========================================================
     STATISTICS
  ========================================================= */

  const stats = [
    {
      title: "Siswa Izin",
      value: izinStudents.size,
      icon: HeartPulse,
      iconClass:
        "bg-blue-50 text-[#073b9e]",
    },
    {
      title: "Siswa Sakit",
      value: sakitStudents.size,
      icon: HeartPulse,
      iconClass:
        "bg-orange-50 text-orange-500",
    },
    {
      title: "Total Siswa PKL",
      value: safeStudents.length,
      icon: Users,
      iconClass:
        "bg-slate-100 text-slate-600",
    },
  ];

  /* =========================================================
     DETAIL
  ========================================================= */

  function openDetail(request) {
    setSelectedRequest(request);
  }

  function closeDetail() {
    setSelectedRequest(null);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f8fd] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">

          <div className="px-6 py-6 sm:px-8 sm:py-7">

            <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">

              {/* LEFT */}

              <div className="flex min-w-0 items-start gap-4">

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-extrabold tracking-tight text-[#071b3a] sm:text-3xl">
                      Pengajuan Izin & Sakit
                    </h1>

                  </div>

                  <p className="mt-2 text-sm text-slate-500 sm:text-base">
                    Daftar pengajuan izin dan sakit
                    siswa PKL.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">

                    <span className="inline-flex items-center gap-1.5">
                      <Info size={14} />
                      Maksimal 4 kali per siswa
                      setiap bulan
                    </span>
                  </div>

                </div>
              </div>

              {/* RIGHT SUMMARY */}

              <div className="flex shrink-0 items-center gap-7 xl:pr-2">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#073b9e]">
                    <FileText size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Pengajuan bulan ini
                    </p>

                    <p className="mt-0.5 text-xl font-extrabold text-[#071b3a]">
                      {monthlyRequests.length}
                    </p>
                  </div>

                </div>

                <div className="h-11 w-px bg-slate-200" />

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#073b9e]">
                    <UserRound size={19} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Siswa mengajukan
                    </p>

                    <p className="mt-0.5 text-xl font-extrabold text-[#071b3a]">
                      {studentsWithRequests.size}
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* HEADER FOOTER */}

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <div className="flex items-center gap-2">
              <HeartPulse
                size={15}
                className="text-[#073b9e]"
              />

              <span>
                Data pengajuan bulan{" "}
                <strong className="font-semibold text-slate-700">
                  {monthLabel}
                </strong>
              </span>
            </div>

          </div>
        </section>

        {/* =================================================
            STATISTICS
            ICON DIHAPUS DARI BAGIAN STATISTIK
        ================================================= */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            {stats.map((item) => {

              return (
                <div
                  key={item.title}
                  className="px-7 py-6 sm:px-8"
                >

                  <p className="text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">

                    <span className="text-3xl font-extrabold tracking-tight text-[#071b3a]">
                      {item.value}
                    </span>

                    <span className="text-xs text-slate-400">
                      siswa
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.subtitle}
                  </p>

                </div>
              );

            })}

          </div>
        </section>

        {/* =================================================
            FILTER
        ================================================= */}

        <section className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap items-center gap-2">

              {[
                "Semua",
                "Izin",
                "Sakit",
              ].map((item) => (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                    filter === item
                      ? "bg-[#073b9e] text-white shadow-[0_4px_12px_rgba(7,59,158,0.18)]"
                      : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#073b9e]"
                  }`}
                >
                  {item}
                </button>

              ))}

            </div>

            <div className="relative w-full lg:max-w-[380px]">

              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari nama, NIS, kelas, jurusan..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

            </div>

          </div>
        </section>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

          <div className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">

            <div>

              <h2 className="text-lg font-extrabold text-[#073b9e]">
                Daftar Pengajuan
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Menampilkan{" "}
                <strong className="font-semibold text-slate-700">
                  {visibleRequests.length}
                </strong>{" "}
                pengajuan
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">

              <CalendarDays size={15} />

              <span>
                Data berdasarkan tanggal
                pengajuan
              </span>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead>

                <tr className="border-y border-slate-100 bg-[#f2f7ff] text-xs font-bold text-[#073b9e]">

                  <th className="px-6 py-4">
                    Siswa
                  </th>

                  <th className="px-5 py-4">
                    Kelas
                  </th>

                  <th className="px-5 py-4">
                    Jurusan
                  </th>

                  <th className="px-5 py-4">
                    Jenis
                  </th>

                  <th className="px-5 py-4">
                    Tanggal
                  </th>

                  <th className="px-5 py-4">
                    Kuota
                  </th>

                  <th className="px-5 py-4">
                    Alasan
                  </th>

                  <th className="px-6 py-4 text-center">
                    Detail
                  </th>

                </tr>

              </thead>

              <tbody>

                {visibleRequests.map(
                  (request, index) => {

                    const quota =
                      getQuota(request);

                    const quotaFull =
                      quota >= MONTHLY_LIMIT;

                    return (
                      <tr
                        key={`${request.id}-${index}`}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >

                        {/* SISWA */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#073b9e]">
                              <UserRound size={18} />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate font-bold text-slate-800">
                                {request.studentName}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                NIS:{" "}
                                {request.studentNis}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* KELAS */}

                        <td className="px-5 py-5">

                          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">

                            <GraduationCap
                              size={16}
                              className="text-slate-400"
                            />

                            {request.kelas}

                          </div>

                        </td>

                        {/* JURUSAN */}

                        <td className="px-5 py-5">

                          <span className="text-sm font-medium text-slate-600">
                            {request.jurusan}
                          </span>

                        </td>

                        {/* JENIS */}

                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                              request.type ===
                              "Sakit"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-blue-50 text-[#073b9e]"
                            }`}
                          >

                            <HeartPulse size={13} />

                            {request.type}

                          </span>

                        </td>

                        {/* TANGGAL */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">

                            <CalendarDays
                              size={16}
                              className="text-slate-400"
                            />

                            <span className="whitespace-nowrap">
                              {formatDate(
                                request.date,
                              )}
                            </span>

                          </div>

                        </td>

                        {/* KUOTA */}

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2">

                            <span
                              className={`text-sm font-extrabold ${
                                quotaFull
                                  ? "text-red-600"
                                  : "text-[#073b9e]"
                              }`}
                            >
                              {quota}/{MONTHLY_LIMIT}
                            </span>

                            {quotaFull && (
                              <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">
                                Penuh
                              </span>
                            )}

                          </div>

                        </td>

                        {/* ALASAN */}

                        <td className="max-w-[260px] px-5 py-5">

                          <p
                            title={request.reason}
                            className="truncate text-sm text-slate-500"
                          >
                            {request.reason}
                          </p>

                        </td>

                        {/* DETAIL */}

                        <td className="px-6 py-5 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              openDetail(request)
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-[#073b9e] transition hover:bg-blue-100 hover:shadow-sm"
                          >
                            Lihat

                            <ChevronRight
                              size={14}
                            />
                          </button>

                        </td>

                      </tr>
                    );
                  },
                )}

                {/* EMPTY */}

                {visibleRequests.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan="8"
                      className="px-6 py-16 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">

                        <FileText
                          size={27}
                          className="text-slate-300"
                        />

                      </div>

                      <p className="mt-4 font-bold text-slate-600">
                        Belum ada pengajuan
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {search
                          ? "Tidak ditemukan data yang sesuai dengan pencarian."
                          : filter === "Semua"
                            ? "Belum ada pengajuan izin atau sakit."
                            : `Belum ada pengajuan ${filter.toLowerCase()}.`}
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {visibleRequests.length > 0 && (

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

              <span>
                Menampilkan{" "}
                <strong className="text-slate-600">
                  {visibleRequests.length}
                </strong>{" "}
                pengajuan
              </span>

              <span>
                Kuota izin + sakit:
                maksimal{" "}
                <strong className="text-slate-600">
                  4 kali
                </strong>{" "}
                per siswa / bulan
              </span>

            </div>

          )}

        </section>

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedRequest && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeDetail();
            }
          }}
        >

          <div className="w-full max-w-lg overflow-hidden rounded-[26px] bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">

              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    selectedRequest.type ===
                    "Sakit"
                      ? "bg-orange-50 text-orange-500"
                      : "bg-blue-50 text-[#073b9e]"
                  }`}
                >
                  <HeartPulse size={21} />
                </div>

                <div>

                  <h3 className="font-extrabold text-slate-900">
                    Detail Pengajuan
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Informasi pengajuan siswa
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={closeDetail}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>

            </div>

            {/* CONTENT */}

            <div className="space-y-5 px-6 py-6">

              {/* STUDENT */}

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#073b9e] shadow-sm">
                  <UserRound size={20} />
                </div>

                <div className="min-w-0">

                  <p className="font-bold text-slate-800">
                    {selectedRequest.studentName}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    NIS:{" "}
                    {selectedRequest.studentNis}
                  </p>

                </div>

              </div>

              {/* INFO GRID */}

              <div className="grid grid-cols-2 gap-3">

                <DetailItem
                  label="Kelas"
                  value={selectedRequest.kelas}
                  icon={
                    <GraduationCap size={17} />
                  }
                />

                <DetailItem
                  label="Jurusan"
                  value={selectedRequest.jurusan}
                  icon={
                    <GraduationCap size={17} />
                  }
                />

                <DetailItem
                  label="Jenis"
                  value={selectedRequest.type}
                  icon={
                    <HeartPulse size={17} />
                  }
                />

                <DetailItem
                  label="Tanggal"
                  value={formatDate(
                    selectedRequest.date,
                  )}
                  icon={
                    <CalendarDays size={17} />
                  }
                />

              </div>

              {/* QUOTA */}

              <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#073b9e]">
                    <ClipboardList size={17} />
                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Kuota bulan ini
                    </p>

                    <p className="font-bold text-slate-700">
                      {getQuota(
                        selectedRequest,
                      )}{" "}
                      / {MONTHLY_LIMIT} kali
                    </p>

                  </div>

                </div>

                {getQuota(
                  selectedRequest,
                ) >= MONTHLY_LIMIT && (

                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                    Kuota penuh
                  </span>

                )}

              </div>

              {/* REASON */}

              <div>

                <div className="mb-2 flex items-center gap-2">

                  <FileText
                    size={17}
                    className="text-[#073b9e]"
                  />

                  <p className="text-sm font-bold text-slate-700">
                    Alasan / Keterangan
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {selectedRequest.reason}
                  </p>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">

              <button
                type="button"
                onClick={closeDetail}
                className="w-full rounded-xl bg-[#073b9e] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#06348b]"
              >
                Tutup
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-xs">
          {label}
        </span>

      </div>

      <p className="mt-2 truncate text-sm font-bold text-slate-700">
        {value || "-"}
      </p>

    </div>
  );
}