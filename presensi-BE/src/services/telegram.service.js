/**
 * Service untuk mengirimkan log notifikasi presensi secara real-time ke Telegram Bot
 * Menggunakan native fetch Node.js tanpa dependensi tambahan
 */

/**
 * Utility untuk sanitasi karakter HTML agar tidak merusak parser Telegram
 * @param {string} text 
 * @returns {string}
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Format tanggal dan waktu ke WIB (Asia/Jakarta)
 * @param {string|Date} timeInput 
 * @returns {{ dateFormatted: string, timeFormatted: string }}
 */
function formatDateTimeWIB(timeInput) {
  const dateObj = timeInput ? new Date(timeInput) : new Date();

  // Tanggal format Indonesia: "07 September 2026"
  const dateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(dateObj);

  // Waktu format WIB: "07:15 WIB"
  const timeFormatted =
    new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    })
      .format(dateObj)
      .replace(".", ":") + " WIB";

  return { dateFormatted, timeFormatted };
}

/**
 * Memeriksa apakah kredensial Telegram sudah terkonfigurasi di environment
 * @returns {boolean}
 */
function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Mengirim pesan teks terformat (HTML) ke Telegram Chat / Group
 * @param {string} text 
 */
async function sendMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Jika token atau chat id belum diisi di .env, lewati secara aman
  if (!token || !chatId) {
    return null;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.error("[TELEGRAM ERROR]", err.message);
    return null;
  }
}

/**
 * Mengirimkan log kehadiran (Check-in atau Check-out) ke Telegram
 * @param {object} params
 */
async function sendAttendanceLog({
  student = {},
  type = "CHECK_IN",
  time,
  distance,
  accuracy,
  locationName,
  photoUrl,
}) {
  if (!isTelegramConfigured()) {
    console.warn("[TELEGRAM LOG WARNING] Telegram Bot belum dikonfigurasi (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID kosong). Melewati pengiriman log presensi.");
    return null;
  }

  const isCheckIn = type === "CHECK_IN";
  const headerEmoji = isCheckIn ? "🟢" : "🔵";
  const headerTitle = isCheckIn ? "PRESENSI CHECK-IN" : "PRESENSI CHECK-OUT";
  const statusText = isCheckIn ? "CHECKED_IN" : "COMPLETED";

  const { dateFormatted, timeFormatted } = formatDateTimeWIB(time);

  const studentName = escapeHtml(student.full_name || "Siswa PKL");
  const studentNisn = escapeHtml(student.nisn || "-");
  const studentSchool = escapeHtml(student.school || "SMK Taruna Bhakti");
  const studentMajor = escapeHtml(student.major || "Rekayasa Perangkat Lunak");
  const locName = escapeHtml(locationName || "Direktorat Bina Teknik Sumber Daya Air");

  const distanceFormatted = distance != null ? `${Math.round(distance)} meter` : "-";
  const accuracyFormatted = accuracy != null ? `±${Math.round(accuracy)} meter` : "-";

  let photoFormatted = "-";
  if (photoUrl && typeof photoUrl === "string" && (photoUrl.startsWith("http://") || photoUrl.startsWith("https://"))) {
    photoFormatted = `<a href="${photoUrl}">Lihat Foto Presensi</a>`;
  }

  const message = `${headerEmoji} <b>${headerTitle}</b>

👤 <b>Siswa</b>
Nama: ${studentName}
NISN: ${studentNisn}
Sekolah: ${studentSchool}
Jurusan: ${studentMajor}

📅 <b>Tanggal:</b> ${dateFormatted}
🕐 <b>Waktu:</b> ${timeFormatted}

📍 <b>Lokasi</b>
${locName}
Jarak: ${distanceFormatted}
Akurasi GPS: ${accuracyFormatted}

📸 <b>Foto:</b>
${photoFormatted}

<b>Status:</b> ${statusText}`;

  try {
    console.log("[TELEGRAM] Sending attendance log...");
    const result = await sendMessage(message);

    if (result && result.ok) {
      console.log("[TELEGRAM] Attendance log sent successfully");
      return result;
    } else {
      console.warn("[TELEGRAM LOG WARNING] Gagal mengirim log ke Telegram:", result?.description || "Respons tidak berhasil");
      return null;
    }
  } catch (err) {
    console.error("[TELEGRAM ERROR]", err.message);
    return null;
  }
}

/**
 * Menguji koneksi bot Telegram dan mengirim pesan uji coba
 */
async function testTelegramConnection() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      success: false,
      message: "TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diisi di file .env",
    };
  }

  const testMessage = `🤖 <b>TEST KONEKSI TELEGRAM BOT PRESENSI PKL</b>\n\n✅ <i>Koneksi Berhasil!</i>\nBackend Presensi Siswa PKL SMK Taruna Bhakti di Direktorat Bina Teknik Sumber Daya Air siap mengirimkan log real-time ke chat ini.`;

  try {
    console.log("[TELEGRAM] Sending test connection message...");
    const result = await sendMessage(testMessage);

    if (result && result.ok) {
      console.log("[TELEGRAM] Attendance log sent successfully");
      return {
        success: true,
        message: "Pesan uji coba berhasil terkirim ke Telegram Anda!",
        data: {
          message_id: result.result?.message_id,
          chat: {
            id: result.result?.chat?.id,
            title: result.result?.chat?.title || result.result?.chat?.first_name,
            type: result.result?.chat?.type,
          },
          date: result.result?.date,
        },
      };
    }

    console.warn("[TELEGRAM LOG WARNING] Test connection failed:", result?.description || "Unknown error");
    return {
      success: false,
      message: result?.description || "Gagal mengirim pesan ke Telegram. Pastikan Anda sudah klik START pada bot di Telegram atau bot sudah dimasukkan ke dalam grup.",
      details: result ? { ok: result.ok, error_code: result.error_code, description: result.description } : null,
    };
  } catch (err) {
    console.error("[TELEGRAM ERROR]", err.message);
    return {
      success: false,
      message: "Terjadi kesalahan internal saat menghubungi Telegram API: " + err.message,
    };
  }
}

module.exports = {
  sendMessage,
  sendAttendanceLog,
  testTelegramConnection,
  isTelegramConfigured,
  formatDateTimeWIB,
  escapeHtml,
};
