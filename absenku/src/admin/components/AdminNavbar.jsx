import {
  LayoutDashboard,
  Users,
  Camera,
  ClipboardList,
  Clock3,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import puprLogo from "../../assets/pupr.png";
import { useAdminSettings } from "../data";

const menus = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Siswa PKL",
    path: "/admin/anak-pkl",
    icon: Users,
  },
  {
    name: "Kehadiran",
    path: "/admin/kehadiran",
    icon: Camera,
  },
  {
    name: "Pengajuan",
    path: "/admin/pengajuan",
    icon: ClipboardList,
  },
  {
    name: "Riwayat",
    path: "/admin/riwayat",
    icon: Clock3,
  },
  {
    name: "Rekap",
    path: "/admin/rekap",
    icon: BarChart3,
  },
];

export default function AdminNavbar() {
  const navigate = useNavigate();
  const [settings] = useAdminSettings();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef = useRef(null);

  /*
   * =========================================================
   * TUTUP DROPDOWN JIKA KLIK DI LUAR
   * =========================================================
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */
  const handleLogout = () => {
    if (!window.confirm("Yakin logout?")) {
      return;
    }

    localStorage.removeItem(
      "absenku_logged_in"
    );

    localStorage.removeItem(
      "absenku_token"
    );

    localStorage.removeItem(
      "absenku_user"
    );

    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * =========================================================
   * TUTUP SEMUA MENU
   * =========================================================
   */
  const closeMenus = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-blue-900/20 bg-[#073b9e] text-white shadow-md">

        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 md:px-6 lg:px-8">

          <div className="flex min-h-[64px] items-center justify-between gap-2 sm:min-h-[76px] sm:gap-4">

            {/* =================================================
                LOGO
            ================================================== */}
            <NavLink
              to="/admin/dashboard"
              onClick={closeMenus}
              className="flex shrink-0 items-center gap-2.5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd51c] text-[#073b9e] shadow-sm sm:h-11 sm:w-11">

                <img
                  src={puprLogo}
                  alt="Logo PUPR"
                  className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                />

              </div>

              <div>
                <p className="text-lg font-extrabold tracking-tight sm:text-xl sm:tracking-wide">
                  ABSENKU
                </p>

                <p className="hidden text-[10px] text-blue-100 sm:block">
                  Rumah Admin
                </p>
              </div>
            </NavLink>

            {/* =================================================
                DESKTOP MENU
            ================================================== */}
            <nav className="hidden items-center gap-1 lg:flex">

              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <NavLink
                    key={menu.path}
                    to={menu.path}
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#ffd51c] text-[#073b9e] shadow-sm"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon size={17} />

                    <span>
                      {menu.name}
                    </span>
                  </NavLink>
                );
              })}

            </nav>

            {/* =================================================
                ADMINISTRATOR DROPDOWN
            ================================================== */}
            <div
              ref={profileRef}
              className="relative hidden lg:block"
            >

              {/* ADMINISTRATOR BUTTON */}
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (previous) =>
                      !previous
                  )
                }
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
                  profileOpen
                    ? "bg-white/10"
                    : "hover:bg-white/10"
                }`}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >

                {/* ICON */}
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#073b9e]">
                  <Settings size={22} />
                </div>

                {/* NAMA */}
                <div className="min-w-[100px] text-left">
                  <p className="text-sm font-bold">
                    {settings?.nama ||
                      "Administrator"}
                  </p>

                  <p className="text-xs text-blue-100">
                    Admin
                  </p>
                </div>

                {/* CHEVRON */}
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>

              {/* =================================================
                  DROPDOWN
              ================================================== */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  role="menu"
                >

                  {/* ===========================================
                      PENGATURAN
                  ============================================ */}
                  <NavLink
                    to="/admin/pengaturan"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    role="menuitem"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#073b9e]">
                      <Settings size={18} />
                    </div>

                    <div>
                      <p className="font-bold">
                        Pengaturan
                      </p>

                      <p className="text-xs font-normal text-slate-400">
                        Pengaturan akun
                      </p>
                    </div>

                  </NavLink>

                  {/* GARIS */}
                  <div className="my-2 border-t border-slate-100" />

                  {/* ===========================================
                      LOGOUT
                  ============================================ */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    role="menuitem"
                  >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <LogOut size={18} />
                    </div>

                    <div>
                      <p className="font-bold">
                        Keluar
                      </p>

                      <p className="text-xs font-normal text-red-400">
                        Keluar dari akun
                      </p>
                    </div>

                  </button>

                </div>
              )}

            </div>

            {/* =================================================
                MOBILE BUTTON
            ================================================== */}
            <div className="flex items-center gap-2 lg:hidden">

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (previous) =>
                      !previous
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffd51c] text-[#073b9e]"
                aria-label={
                  mobileMenuOpen
                    ? "Tutup menu"
                    : "Buka menu"
                }
              >

                {mobileMenuOpen ? (
                  <X size={21} />
                ) : (
                  <Menu size={21} />
                )}

              </button>

            </div>

          </div>

        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileMenuOpen
              ? "max-h-[700px] border-t border-white/10"
              : "max-h-0"
          }`}
        >

          <div className="mx-auto max-w-[1500px] px-4 py-4">

            {/* ===============================================
                ADMINISTRATOR MOBILE
            ================================================ */}
            <div className="mb-3 rounded-2xl bg-white/10 p-4">

              {/* PROFILE */}
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#073b9e]">
                  <Settings size={21} />
                </div>

                <div>
                  <p className="font-bold">
                    {settings?.nama ||
                      "Administrator"}
                  </p>

                  <p className="text-xs text-blue-100">
                    Admin
                  </p>
                </div>

              </div>

              {/* =============================================
                  PENGATURAN MOBILE
              ============================================== */}
              <NavLink
                to="/admin/pengaturan"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold transition hover:bg-white/15"
              >

                <Settings size={18} />

                <div>
                  <p>Pengaturan</p>

                  <p className="text-xs font-normal text-blue-100">
                    Pengaturan akun
                  </p>
                </div>

              </NavLink>

              {/* =============================================
                  LOGOUT MOBILE
              ============================================== */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl bg-red-500/15 px-3 py-3 text-left text-sm font-bold text-red-100 transition hover:bg-red-500/25"
              >

                <LogOut size={18} />

                <div>
                  <p>Keluar</p>

                  <p className="text-xs font-normal text-red-200">
                    Keluar dari akun
                  </p>
                </div>

              </button>

            </div>

            {/* ===============================================
                MENU MOBILE
            ================================================ */}
            <div className="space-y-1">

              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <NavLink
                    key={menu.path}
                    to={menu.path}
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#ffd51c] text-[#073b9e]"
                          : "text-white hover:bg-white/10"
                      }`
                    }
                  >
                  
                    <Icon size={18} />

                    <span>
                      {menu.name}
                    </span>

                  </NavLink>
                );
              })}

            </div>

          </div>

        </div>

      </header>
    </>
  );
}