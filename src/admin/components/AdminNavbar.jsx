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
import { useEffect, useRef, useState } from "react";
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  /*
   * Tutup dropdown profile ketika klik di luar
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /*
   * Logout
   */
  const handleLogout = () => {
    const yakin = window.confirm("Yakin ingin keluar dari akun admin?");

    if (!yakin) return;

    localStorage.removeItem("absenku_logged_in");
    localStorage.removeItem("absenku_user");

    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  /*
   * Buka pengaturan
   */
  const handleSettings = () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/admin/pengaturan");
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-blue-900/20 bg-[#073b9e] text-white shadow-md">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 md:px-6 lg:px-8">

          <div className="flex min-h-[64px] items-center justify-between gap-2 sm:min-h-[76px] sm:gap-4">

            {/* ================================= */}
            {/* LOGO */}
            {/* ================================= */}

            <NavLink
              to="/admin/dashboard"
              className="flex shrink-0 items-center gap-2.5"
            >
              <div className="rounded-xl bg-[#ffd51c] p-1.5 shadow-sm">
  <img
    src={puprLogo}
    alt="Logo PUPR"
    className="block h-auto w-auto max-h-9 max-w-9 object-contain"
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

            {/* ================================= */}
            {/* DESKTOP MENU */}
            {/* ================================= */}

            <nav className="hidden items-center gap-1 lg:flex">
              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <NavLink
                    key={menu.path}
                    to={menu.path}
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

            {/* ================================= */}
            {/* DESKTOP PROFILE */}
            {/* ================================= */}

            <div
              ref={profileRef}
              className="relative hidden lg:block"
            >
              {/* PROFILE BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setProfileOpen((previous) => !previous)
                }
                className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition ${
                  profileOpen
                    ? "bg-white/10"
                    : "hover:bg-white/10"
                }`}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                {/* ICON PROFILE */}

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#073b9e]">
                  <Settings size={21} />
                </div>

                {/* NAMA */}

                <div className="min-w-0 text-left">
                  <p className="max-w-[150px] truncate text-sm font-bold">
                    {settings.nama || "Administrator"}
                  </p>

                  <p className="text-xs text-blue-100">
                    Admin
                  </p>
                </div>

                {/* CHEVRON */}

                <ChevronDown
                  size={17}
                  className={`transition-transform duration-200 ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* ================================= */}
              {/* PROFILE DROPDOWN */}
              {/* ================================= */}

              {profileOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                  role="menu"
                >
                  {/* PROFILE INFO */}

                  <div className="mb-1 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#073b9e] text-white">
                      <Settings size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {settings.nama || "Administrator"}
                      </p>

                      <p className="text-xs text-slate-500">
                        Administrator
                      </p>
                    </div>
                  </div>

                  <div className="my-2 border-t border-slate-100" />

                  {/* PENGATURAN */}

                  <button
                    type="button"
                    onClick={handleSettings}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#073b9e]"
                    role="menuitem"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#073b9e]">
                      <Settings size={18} />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Pengaturan
                      </p>

                      <p className="text-xs font-normal text-slate-400">
                        Pengaturan akun admin
                      </p>
                    </div>
                  </button>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    role="menuitem"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <LogOut size={18} />
                    </div>

                    <div>
                      <p className="font-semibold">
                        Keluar
                      </p>

                      <p className="text-xs font-normal text-red-300">
                        Keluar dari akun admin
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* ================================= */}
            {/* MOBILE MENU BUTTON */}
            {/* ================================= */}

            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
                    (previous) => !previous
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

        {/* ================================= */}
        {/* MOBILE DROPDOWN */}
        {/* ================================= */}

        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileMenuOpen
              ? "max-h-[650px] border-t border-white/10"
              : "max-h-0"
          }`}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-4">

            {/* MOBILE PROFILE */}

            <div className="mb-3 rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#073b9e]">
                  <Settings size={21} />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold">
                    {settings.nama || "Administrator"}
                  </p>

                  <p className="text-xs text-blue-100">
                    Admin
                  </p>
                </div>
              </div>

              {/* MOBILE SETTINGS */}

              <button
                type="button"
                onClick={handleSettings}
                className="mt-3 flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/15"
              >
                <Settings size={18} />

                <div>
                  <p>
                    Pengaturan
                  </p>

                  <p className="text-[11px] font-normal text-blue-100">
                    Pengaturan akun admin
                  </p>
                </div>
              </button>
            </div>

            {/* MOBILE NAVIGATION */}

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

            {/* MOBILE LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-500/25"
            >
              <LogOut size={17} />

              Keluar
            </button>
          </div>
        </div>
      </header>
    </>
  );
}