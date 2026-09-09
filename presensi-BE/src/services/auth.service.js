const { supabase, supabaseAdmin } = require("../config/supabase");

/**
 * Service untuk menangani alur bisnis autentikasi Supabase Auth
 */

/**
 * Login pengguna dengan Email atau NISN & password
 * @param {string} identifier - Bisa berupa Email atau NISN
 * @param {string} password
 */
async function loginUser(identifier, password) {
  if (!supabase) {
    throw {
      statusCode: 500,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Koneksi Supabase belum dikonfigurasi pada file .env",
    };
  }

  const cleanIdentifier = String(identifier || "").trim();
  let emailToAuth = cleanIdentifier;

  // Jika input bukan email (tidak ada tanda '@'), lakukan lookup NISN ke tabel profiles
  if (!cleanIdentifier.includes("@")) {
    if (!supabaseAdmin) {
      throw {
        statusCode: 500,
        code: "SUPABASE_NOT_CONFIGURED",
        message:
          "Koneksi Supabase Admin belum dikonfigurasi untuk pencarian NISN",
      };
    }

    const { data: profileByNisn, error: nisnError } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name, nisn")
      .eq("nisn", cleanIdentifier)
      .maybeSingle();

    if (nisnError || !profileByNisn || !profileByNisn.email) {
      throw {
        statusCode: 401,
        code: "INVALID_CREDENTIALS",
        message: `Akun dengan NISN '${cleanIdentifier}' tidak ditemukan dalam sistem.`,
      };
    }

    emailToAuth = profileByNisn.email;
  }

  // 1. Autentikasi kredensial ke Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToAuth,
    password,
  });

  if (error) {
    throw {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
      message: cleanIdentifier.includes("@")
        ? "Email atau password yang Anda masukkan salah"
        : "Password yang Anda masukkan salah untuk NISN tersebut",
      details: error.message,
    };
  }

  // 2. Ambil data profil dari tabel public.profiles
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, full_name, email, nisn, school, major, phone, gender, birth_date, birth_place, role",
    )
    .eq("id", data.user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("[AUTH SERVICE] Gagal mengambil profil:", profileError);
  }

  // Fallback profile jika trigger belum selesai berjalan
  const userProfile = profile || {
    id: data.user.id,
    email: data.user.email,
    full_name: data.user.user_metadata?.full_name || "Siswa PKL",
    nisn: data.user.user_metadata?.nisn || null,
    school: data.user.user_metadata?.school || "SMK Taruna Bhakti",
    major: data.user.user_metadata?.major || null,
    phone: data.user.user_metadata?.phone || null,
    gender: data.user.user_metadata?.gender || null,
    birth_date: data.user.user_metadata?.birth_date || null,
    birth_place: data.user.user_metadata?.birth_place || null,
    role: data.user.user_metadata?.role || "user",
  };

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_in: data.session.expires_in,
    expires_at: data.session.expires_at,
    user: userProfile,
  };
}

/**
 * Mengirim email instruksi reset password
 * @param {string} email
 */
async function sendPasswordResetEmail(email, redirectUrl = null) {
  if (!supabase) {
    throw {
      statusCode: 500,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Koneksi Supabase belum dikonfigurasi pada file .env",
    };
  }

  const redirectTo =
    redirectUrl ||
    process.env.FRONTEND_RESET_URL ||
    process.env.FRONTEND_URL ||
    undefined;
  const options = redirectTo ? { redirectTo } : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, options);

  if (error) {
    throw {
      statusCode: 400,
      code: "RESET_PASSWORD_FAILED",
      message: "Gagal mengirim email reset password",
      details: error.message,
    };
  }

  return {
    email,
    message:
      "Tautan instruksi reset password telah dikirimkan ke email Anda jika terdaftar.",
  };
}

/**
 * Mengubah password pengguna yang sedang login
 * @param {string} userId
 * @param {string} newPassword
 */
async function updateUserPassword(userId, newPassword) {
  if (!supabaseAdmin) {
    throw {
      statusCode: 500,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Koneksi Supabase Admin belum dikonfigurasi",
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw {
      statusCode: 400,
      code: "UPDATE_PASSWORD_FAILED",
      message: "Gagal memperbarui password",
      details: error.message,
    };
  }

  return { message: "Password berhasil diperbarui." };
}

/**
 * Mengubah password dengan memverifikasi password lama terlebih dahulu
 * @param {string} email
 * @param {string} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
async function changeUserPassword(email, userId, oldPassword, newPassword) {
  if (!supabase || !supabaseAdmin) {
    throw {
      statusCode: 500,
      code: "SUPABASE_NOT_CONFIGURED",
      message: "Layanan Supabase belum dikonfigurasi.",
    };
  }

  // 1. Verifikasi apakah password lama benar
  if (oldPassword) {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });

    if (verifyError) {
      throw {
        statusCode: 400,
        code: "INVALID_OLD_PASSWORD",
        message: "Password lama yang Anda masukkan salah.",
      };
    }
  }

  // 2. Update password baru
  return await updateUserPassword(userId, newPassword);
}

/**
 * Mengambil profil lengkap user berdasarkan ID
 * @param {string} userId
 */
async function getUserProfileById(userId) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, full_name, email, nisn, school, major, phone, gender, birth_date, birth_place, role, created_at, updated_at",
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw {
      statusCode: 404,
      code: "PROFILE_NOT_FOUND",
      message: "Profil pengguna tidak ditemukan",
      details: error.message,
    };
  }

  return data;
}

/**
 * Memperbarui field profil yang boleh diubah oleh pemilik akun.
 * Email, NISN, dan role tidak dapat diubah dari client.
 */
async function updateUserProfile(userId, updates) {
  const allowedUpdates = {};

  if (updates.full_name !== undefined) {
    const fullName = String(updates.full_name).trim();
    if (!fullName) {
      throw {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Nama lengkap wajib diisi.",
      };
    }
    allowedUpdates.full_name = fullName;
  }

  if (updates.school !== undefined) {
    allowedUpdates.school = String(updates.school).trim();
  }

  if (updates.major !== undefined) {
    allowedUpdates.major = String(updates.major).trim();
  }

  if (updates.phone !== undefined) {
    allowedUpdates.phone = String(updates.phone).trim() || null;
  }

  if (updates.gender !== undefined) {
    allowedUpdates.gender = String(updates.gender).trim() || null;
  }

  if (updates.birth_date !== undefined) {
    allowedUpdates.birth_date = updates.birth_date || null;
  }

  if (updates.birth_place !== undefined) {
    allowedUpdates.birth_place = String(updates.birth_place).trim() || null;
  }

  if (!Object.keys(allowedUpdates).length) {
    throw {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Tidak ada data profil yang diubah.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update(allowedUpdates)
    .eq("id", userId)
    .select(
      "id, full_name, email, nisn, school, major, phone, gender, birth_date, birth_place, role, created_at, updated_at",
    )
    .single();

  if (error) {
    throw {
      statusCode: 400,
      code: "PROFILE_UPDATE_FAILED",
      message: "Gagal memperbarui profil pengguna.",
      details: error.message,
    };
  }

  return data;
}

module.exports = {
  loginUser,
  sendPasswordResetEmail,
  updateUserPassword,
  changeUserPassword,
  getUserProfileById,
  updateUserProfile,
};
