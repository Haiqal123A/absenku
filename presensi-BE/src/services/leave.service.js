const { supabaseAdmin } = require("../config/supabase");

function ensureConfigured() {
  if (!supabaseAdmin) {
    throw {
      statusCode: 500,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Layanan Supabase belum dikonfigurasi.",
    };
  }
}

function throwDatabaseError(
  error,
  message,
  code = "QUERY_ERROR",
  statusCode = 500,
) {
  const missingTable =
    error?.code === "PGRST205" || error?.message?.includes("leave_requests");

  throw {
    statusCode: missingTable ? 500 : statusCode,
    code: missingTable ? "LEAVE_REQUESTS_TABLE_MISSING" : code,
    message: missingTable
      ? "Tabel leave_requests belum dibuat di Supabase. Jalankan database/migration_leave_requests.sql."
      : message,
    details: error?.message,
  };
}

async function getMyRequests(userId) {
  ensureConfigured();
  const { data, error } = await supabaseAdmin
    .from("leave_requests")
    .select("*, profiles(full_name, nisn)")
    .eq("user_id", userId)
    .order("request_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throwDatabaseError(error, "Gagal memuat pengajuan izin.");
  return data || [];
}

async function createRequest(userId, payload) {
  ensureConfigured();
  const { request_type, request_date, reason, attachment_path } = payload;
  if (
    !["Izin", "Sakit"].includes(request_type) ||
    !request_date ||
    !String(reason || "").trim()
  ) {
    throw {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Jenis, tanggal, dan alasan pengajuan wajib diisi.",
    };
  }

  const monthStart = `${request_date.slice(0, 7)}-01`;
  const monthEnd = new Date(`${request_date.slice(0, 7)}-01T00:00:00Z`);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
  const nextMonth = monthEnd.toISOString().slice(0, 10);
  const { count, error: countError } = await supabaseAdmin
    .from("leave_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("request_type", "Izin")
    .gte("request_date", monthStart)
    .lt("request_date", nextMonth)
    .neq("status", "Ditolak");

  if (countError) throwDatabaseError(countError, "Gagal memeriksa kuota izin.");
  if (request_type === "Izin" && count >= 4) {
    throw {
      statusCode: 400,
      code: "LEAVE_QUOTA_REACHED",
      message: "Batas izin 4 kali pada bulan ini sudah tercapai.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("leave_requests")
    .insert({
      user_id: userId,
      request_type,
      request_date,
      reason: String(reason).trim(),
      attachment_path: attachment_path || null,
    })
    .select("*, profiles(full_name, nisn)")
    .single();

  if (error) {
    throwDatabaseError(
      error,
      "Gagal menyimpan pengajuan izin.",
      "CREATE_REQUEST_FAILED",
      400,
    );
  }
  return data;
}

async function getAllRequests() {
  ensureConfigured();
  const { data, error } = await supabaseAdmin
    .from("leave_requests")
    .select("*, profiles(full_name, nisn)")
    .order("created_at", { ascending: false });
  if (error) throwDatabaseError(error, "Gagal memuat seluruh pengajuan izin.");
  return data || [];
}

async function updateRequestStatus(id, status) {
  ensureConfigured();
  if (!["Menunggu", "Diterima", "Ditolak"].includes(status)) {
    throw {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Status pengajuan tidak valid.",
    };
  }
  const { data, error } = await supabaseAdmin
    .from("leave_requests")
    .update({
      status,
      processed_at: status === "Menunggu" ? null : new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, profiles(full_name, nisn)")
    .single();
  if (error)
    throwDatabaseError(
      error,
      "Pengajuan tidak ditemukan.",
      "REQUEST_NOT_FOUND",
      404,
    );
  return data;
}

module.exports = {
  getMyRequests,
  createRequest,
  getAllRequests,
  updateRequestStatus,
};
