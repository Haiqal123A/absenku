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
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("absenku_user") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        localStorage.setItem("absenku_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        // Route protection handles expired sessions; keep cached data while loading.
      });

    return () => {
      active = false;
    };
  }, []);

  const userName = user.full_name || "Pengguna";

  const menu = [
    {
      name: "Dashboard",
      path: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Rekam Presensi",
      path: "/user/presensi",
      icon: Camera,
    },
    {
      name: "Riwayat",
      path: "/user/riwayat",
      icon: Clock3,
    },
    {
      name: "Izin",
      path: "/user/izin",
      icon: FileText,
    },
    {
      name: "Laporan",
      path: "/user/laporan",
      icon: FileText,
    },
  ];

  const handleLogout = () => {
    if (!window.confirm("Yakin ingin logout?")) return;

    localStorage.removeItem("absenku_logged_in");
    localStorage.removeItem("absenku_token");
    localStorage.removeItem("absenku_user");

    setMobileMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const handleProfile = () => {
    setMobileMenuOpen(false);
    navigate("/user/profile");
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-blue-900/20 bg-[#073b9e] text-white shadow-md">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex min-h-[64px] items-center justify-between gap-2 sm:min-h-[76px] sm:gap-4">
            {/* =================================================
                LOGO
            ================================================== */}

            <NavLink
              to="/user/dashboard"
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
                DESKTOP MENU
            ================================================== */}

            <nav className="hidden items-center gap-1 lg:flex">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#ffd51c] text-[#073b9e] shadow-sm"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon size={17} />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* =================================================
                DESKTOP PROFILE
            ================================================== */}

            <div className="hidden items-center gap-3 lg:flex">
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
                >
                  {/* AVATAR */}

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#073b9e]">
                    <User size={21} />
                  </div>

                  {/* USER INFO */}

                  <div className="text-left">
                    <p className="text-sm font-bold">{userName}</p>

                    <p className="text-xs text-blue-100">{user.role || "-"}</p>
                  </div>

                  <ChevronDown size={17} />
                </button>

                {/* =================================================
                    PROFILE DROPDOWN
                ================================================== */}

                <div className="absolute right-0 top-full hidden w-56 pt-2 group-hover:block">
                  <div className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 shadow-xl">
                    {/* PROFILE */}

                    <button
                      type="button"
                      onClick={handleProfile}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-blue-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                        <UserRound size={17} className="text-[#073b9e]" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0b2875]">
                          Profil Saya
                        </p>

                        <p className="text-[10px] text-slate-400">
                          Lihat data diri
                        </p>
                      </div>
                    </button>

                    <div className="my-1 h-px bg-slate-100" />

                    {/* LOGOUT */}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <LogOut size={17} />
                      </div>

                      <span>Keluar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((previous) => !previous)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd51c] text-[#073b9e]"
                aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              >
                {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {/* =====================================================
            MOBILE DROPDOWN
        ====================================================== */}

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileMenuOpen
              ? "max-h-[600px] border-t border-white/10"
              : "max-h-0"
          }`}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-4">
            {/* =================================================
                MOBILE PROFILE
            ================================================== */}

            <button
              type="button"
              onClick={handleProfile}
              className="mb-3 flex w-full items-center justify-between rounded-2xl bg-white/10 p-4 text-left transition hover:bg-white/15"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#073b9e]">
                  <User size={21} />
                </div>

                <div>
                  <p className="font-bold">{userName}</p>

                  <p className="text-xs text-blue-100">{user.role || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold text-emerald-100">
                  AKTIF
                </span>

                <ChevronDown size={16} className="-rotate-90" />
              </div>
            </button>

            {/* =================================================
                MOBILE MENU
            ================================================== */}

            <div className="space-y-1">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#ffd51c] text-[#073b9e]"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon size={18} />

                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* =================================================
                PROFILE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={handleProfile}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              <UserRound size={17} />
              Profil Saya
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

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-900/20 bg-[#073b9e] shadow-[0_-4px_20px_rgba(15,23,42,0.15)] lg:hidden">
        <div className="grid h-[68px] grid-cols-5">
          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-1 transition ${
                    isActive ? "text-[#ffd51c]" : "text-blue-100/70"
                  }`
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
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                        isActive ? "bg-[#ffd51c]/15" : ""
                      }`}
                    >
                      <Icon size={19} />
                    </div>

                    {/* LABEL */}

                    <span className="text-center text-[10px] font-semibold leading-none">
                      {item.name === "Rekam Presensi" ? "Presensi" : item.name}
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
