const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
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
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    }),
  me: () => apiRequest("/auth/me"),
  updateMe: (updates) =>
    apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email,
        redirect_to: `${window.location.origin}/reset-password`,
      }),
    }),
};

export const attendanceApi = {
  today: () => apiRequest("/attendance/today"),
  history: () => apiRequest("/attendance/history"),
  location: () => apiRequest("/attendance/location"),
  checkIn: (payload) =>
    apiRequest("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  checkOut: (payload) =>
    apiRequest("/attendance/check-out", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const adminApi = {
  students: () => apiRequest("/admin/students"),
  todayAttendance: () => apiRequest("/admin/attendance/today"),
  attendanceStats: () => apiRequest("/admin/attendance/stats"),
  attendanceHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/attendance/history${query ? `?${query}` : ""}`);
  },
  leaveRequests: () => apiRequest("/admin/leave-requests"),
  updateLeaveRequest: (id, status) =>
    apiRequest(`/admin/leave-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export const leaveApi = {
  mine: () => apiRequest("/leave-requests"),
  create: (payload) =>
    apiRequest("/leave-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
