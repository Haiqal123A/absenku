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
import { useState } from "react";
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

  const handleLogout = () => {
    if (!window.confirm("Yakin logout?")) return;

    localStorage.removeItem("absenku_logged_in");
    localStorage.removeItem("absenku_token");
    localStorage.removeItem("absenku_user");
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-blue-900/20 bg-[#073b9e] text-white shadow-md">
        <div className="mx-auto max-w-[1500px] px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex min-h-[64px] items-center justify-between gap-2 sm:min-h-[76px] sm:gap-4">
            {/* LOGO */}
            <NavLink
              to="/admin/dashboard"
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

            {/* DESKTOP MENU */}
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
                    <span>{menu.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* DESKTOP PROFILE */}
            <div className="hidden items-center gap-3 lg:flex">
              <NavLink
                to="/admin/pengaturan"
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#073b9e]">
                  <Settings size={21} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-bold">{settings.nama}</p>
                  <p className="text-xs text-blue-100">Admin</p>
                </div>

                <ChevronDown size={17} />
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Keluar"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-red-200 transition hover:bg-red-500/20 hover:text-white"
              >
                <LogOut size={19} />
              </button>
            </div>

            {/* MOBILE MENU BUTTON */}
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

        {/* MOBILE DROPDOWN */}
        <div
          className={`overflow-hidden transition-all duration-300 lg:hidden ${
            mobileMenuOpen
              ? "max-h-[520px] border-t border-white/10"
              : "max-h-0"
          }`}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-4">
            <NavLink
              to="/admin/pengaturan"
              onClick={() => setMobileMenuOpen(false)}
              className="mb-3 flex w-full items-center justify-between rounded-2xl bg-white/10 p-4 text-left transition hover:bg-white/15"
            >
              <div>
                <p className="font-bold">{settings.nama}</p>
                <p className="text-xs text-blue-100">Admin</p>
              </div>
              <Settings size={21} />
            </NavLink>

            <div className="space-y-1">
              {menus.map((menu) => {
                const Icon = menu.icon;

                return (
                  <NavLink
                    key={menu.path}
                    to={menu.path}
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
                    <span>{menu.name}</span>
                  </NavLink>
                );
              })}
            </div>

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
