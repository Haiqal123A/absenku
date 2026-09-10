import {
  LayoutDashboard,
  Camera,
  Clock3,
  FileText,
  User,
  ChevronDown,
  LogOut,
  Menu,
  X,
  UserRound,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { authApi } from "../../lib/api";

function UserNavbar() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then(({ user: currentUser }) => {
        if (!active) return;

        setUser(currentUser || {});
      })
      .catch(() => {
        if (active) {
          setUser({});
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const userName = user?.full_name || "Pengguna";

  const userRole =
    user?.role === "student"
      ? "Siswa / Peserta PKL"
      : user?.role || "Pengguna";

  const menu = [
    {
      name: "Dashboard",
      shortName: "Dashboard",
      path: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Rekam Presensi",
      shortName: "Presensi",
      path: "/user/presensi",
      icon: Camera,
    },
    {
      name: "Riwayat",
      shortName: "Riwayat",
      path: "/user/riwayat",
      icon: Clock3,
    },
    {
      name: "Izin",
      shortName: "Izin",
      path: "/user/izin",
      icon: FileText,
    },
    {
      name: "Laporan",
      shortName: "Laporan",
      path: "/user/laporan",
      icon: FileText,
    },
  ];

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    const confirmed = window.confirm(
      "Yakin ingin keluar dari akun ABSENKU?",
    );

    if (!confirmed) return;

    localStorage.removeItem("absenku_token");

    closeMobileMenu();

    navigate("/login", {
      replace: true,
    });
  }

  function handleProfile() {
    closeMobileMenu();

    navigate("/user/profile");
  }

  return (
    <>
      {/* =====================================================
          TOP NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-blue-900/20 bg-[#073b9e] text-white shadow-md">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex min-h-[64px] items-center justify-between gap-3 sm:min-h-[76px]">
            {/* =================================================
                LOGO
            ================================================== */}

            <NavLink
              to="/user/dashboard"
              onClick={closeMobileMenu}
              className="flex shrink-0 items-center gap-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd51c] text-[#073b9e] shadow-sm sm:h-11 sm:w-11">
                <span className="text-lg font-black">PU</span>
              </div>

              <div>
                <p className="text-lg font-extrabold tracking-tight sm:text-xl sm:tracking-wide">
                  ABSENKU
                </p>

                <p className="hidden text-[10px] text-blue-100 sm:block">
                  Sistem Presensi Digital
                </p>
              </div>
            </NavLink>

            {/* =================================================
                DESKTOP NAVIGATION
            ================================================== */}

            <nav className="hidden items-center gap-1 lg:flex">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-2 rounded-xl px-4 py-2.5",
                        "text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-[#ffd51c] text-[#073b9e] shadow-sm"
                          : "text-white hover:bg-white/10",
                      ].join(" ")
                    }
                  >
                    <Icon size={17} strokeWidth={2.2} />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* =================================================
                DESKTOP PROFILE
            ================================================== */}

            <div className="hidden lg:block">
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
                >
                  {/* AVATAR */}

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#073b9e] shadow-sm">
                    <User size={21} strokeWidth={2.2} />
                  </div>

                  {/* USER INFO */}

                  <div className="min-w-0 text-left">
                    <p className="max-w-[150px] truncate text-sm font-bold">
                      {userName}
                    </p>

                    <p className="max-w-[150px] truncate text-xs text-blue-100">
                      {userRole}
                    </p>
                  </div>

                  <ChevronDown
                    size={17}
                    className="transition-transform duration-200 group-hover:rotate-180"
                  />
                </button>

                {/* =================================================
                    DROPDOWN
                ================================================== */}

                <div className="absolute right-0 top-full hidden w-60 pt-2 group-hover:block">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-2xl">
                    {/* USER HEADER */}

                    <div className="mb-1 rounded-xl bg-slate-50 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#073b9e]">
                          <User size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">
                            {userName}
                          </p>

                          <p className="truncate text-xs text-slate-400">
                            {userRole}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PROFILE */}

                    <button
                      type="button"
                      onClick={handleProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-blue-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <UserRound
                          size={17}
                          className="text-[#073b9e]"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0b2875]">
                          Profil Saya
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Lihat dan kelola data diri
                        </p>
                      </div>
                    </button>

                    <div className="my-1 h-px bg-slate-100" />

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                        <LogOut size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-red-500">
                          Keluar
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Keluar dari akun
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd51c] text-[#073b9e] shadow-sm transition hover:bg-yellow-300 lg:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Tutup menu"
                  : "Buka menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        <div
          className={[
            "overflow-hidden transition-all duration-300 lg:hidden",
            mobileMenuOpen
              ? "max-h-[700px] border-t border-white/10"
              : "max-h-0",
          ].join(" ")}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-4">
            {/* =================================================
                MOBILE USER CARD
            ================================================== */}

            <div className="mb-3 rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#073b9e] shadow-sm">
                  <User size={21} />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {userName}
                  </p>

                  <p className="truncate text-xs text-blue-100">
                    {userRole}
                  </p>
                </div>

                <span className="ml-auto shrink-0 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-100">
                  AKTIF
                </span>
              </div>
            </div>

            {/* =================================================
                MOBILE NAVIGATION
            ================================================== */}

            <div className="space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      [
                        "flex items-center gap-3 rounded-xl px-4 py-3",
                        "text-sm font-semibold transition-all duration-200",
                        isActive
                          ? "bg-[#ffd51c] text-[#073b9e] shadow-sm"
                          : "text-white hover:bg-white/10",
                      ].join(" ")
                    }
                  >
                    <Icon size={18} strokeWidth={2.2} />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* =================================================
                PROFILE
            ================================================== */}

            <button
              type="button"
              onClick={handleProfile}
              className="mt-3 flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/15"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <UserRound size={17} />
              </div>

              <div>
                <p>Profil Saya</p>

                <p className="text-[10px] font-normal text-blue-100">
                  Lihat data diri
                </p>
              </div>
            </button>

            {/* =================================================
                LOGOUT
            ================================================== */}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/25"
            >
              <LogOut size={17} />

              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-blue-900/20 bg-[#073b9e] shadow-[0_-4px_20px_rgba(15,23,42,0.15)] lg:hidden">
        <div className="mx-auto grid h-[68px] max-w-[700px] grid-cols-5">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    "relative flex flex-col items-center justify-center",
                    "gap-1 transition-all duration-200",
                    isActive
                      ? "text-[#ffd51c]"
                      : "text-blue-100/70 hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {/* ACTIVE INDICATOR */}

                    {isActive && (
                      <span className="absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 rounded-b-full bg-[#ffd51c]" />
                    )}

                    {/* ICON */}

                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-xl",
                        "transition-all duration-200",
                        isActive
                          ? "bg-[#ffd51c]/15"
                          : "",
                      ].join(" ")}
                    >
                      <Icon
                        size={19}
                        strokeWidth={
                          isActive ? 2.5 : 2
                        }
                      />
                    </div>

                    {/* LABEL */}

                    <span className="text-center text-[10px] font-semibold leading-none">
                      {item.shortName}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default UserNavbar;