const API_URL = (
  import.meta.env.VITE_API_URL || "https://presensi-be.vercel.app/"
).replace(/\/$/, "");

export function getToken() {
  return localStorage.getItem("absenku_token");
}

export function clearSession() {
  localStorage.removeItem("absenku_token");
  localStorage.removeItem("absenku_user");
  localStorage.removeItem("absenku_logged_in");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || "Permintaan ke server gagal.");
    error.status = response.status;
    error.code = payload.error?.code;
    error.details = payload.error?.details;

    if (response.status === 401) {
      clearSession();
    }

    throw error;
  }

  return payload.data;
}

export const authApi = {
  login: (identifier, password) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  me: () => apiRequest("/api/auth/me"),
  updateMe: (updates) =>
    apiRequest("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  forgotPassword: (email) =>
    apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        redirect_to: `${window.location.origin}/reset-password`,
      }),
    }),
};

export const attendanceApi = {
  today: () => apiRequest("/api/attendance/today"),
  history: () => apiRequest("/api/attendance/history"),
  location: () => apiRequest("/api/attendance/location"),
  checkIn: (payload) =>
    apiRequest("/api/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkOut: (payload) =>
    apiRequest("/api/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const adminApi = {
  students: () => apiRequest("/api/admin/students"),
  todayAttendance: () => apiRequest("/api/admin/attendance/today"),
  attendanceStats: () => apiRequest("/api/admin/attendance/stats"),
  attendanceHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(
      `/api/admin/attendance/history${query ? `?${query}` : ""}`,
    );
  },
  leaveRequests: () => apiRequest("/api/admin/leave-requests"),
  updateLeaveRequest: (id, status) =>
    apiRequest(`/api/admin/leave-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const leaveApi = {
  mine: () => apiRequest("/api/leave-requests"),
  create: (payload) =>
    apiRequest("/api/leave-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
