import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#f4f8ff]">
      <AdminNavbar />

      <main className="mx-auto max-w-[1500px] overflow-hidden px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}