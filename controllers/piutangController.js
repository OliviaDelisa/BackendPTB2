const db = require("../config/db");
const { sendFcmNotification } = require("./fcmHelper");

// CREATE PIUTANG
exports.createPiutang = async (req, res) => {
  const { userId, nama, jumlah, tanggalTenggat, tanggalDibuat, tanggalSelesai, selesai, buktiPembayaranUri } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "userId wajib dikirim" });

  try {
    const sql = `
      INSERT INTO piutang
      (user_id, nama, jumlah, tanggal_tenggat, tanggal_dibuat, tanggal_selesai, selesai, bukti_pembayaran_uri)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, nama, jumlah, tanggalTenggat, tanggalDibuat, tanggalSelesai || null, selesai ? 1 : 0, buktiPembayaranUri || null];

    const [result] = await db.promise().query(sql, values);

    // Ambil token user
    const [users] = await db.promise().query("SELECT fcm_token FROM users WHERE id = ?", [userId]);
    if (users[0] && users[0].fcm_token) {
      const fcmToken = users[0].fcm_token;
      const tenggat = new Date(tanggalTenggat);
      const today = new Date();
      const hMinus1 = new Date();
      hMinus1.setDate(today.getDate() + 1);

      let title = "", bodyNotif = "";
      if (tenggat.toDateString() === today.toDateString()) {
        title = "⏰ Piutang Jatuh Tempo";
        bodyNotif = `Piutang "${nama}" jatuh tempo hari ini`;
      } else if (tenggat.toDateString() === hMinus1.toDateString()) {
        title = "🔔 Pengingat Piutang";
        bodyNotif = `Besok piutang "${nama}" jatuh tempo`;
      }

      if (title) await sendFcmNotification(fcmToken, title, bodyNotif, { piutangId: result.insertId.toString() });
    }

    res.status(201).json({ success: true, message: "Piutang berhasil disimpan", id: result.insertId });
  } catch (err) {
    console.error("ERROR PIUTANG:", err);
    res.status(500).json({ success: false, message: "Gagal menyimpan piutang" });
  }
};

// UPDATE PIUTANG
exports.updatePiutang = async (req, res) => {
  const { id } = req.params;
  const { nama, jumlah, tanggalTenggat, selesai, tanggalSelesai, buktiPembayaranUri } = req.body;

  try {
    const sql = `
      UPDATE piutang
      SET
        nama = COALESCE(?, nama),
        jumlah = COALESCE(?, jumlah),
        tanggal_tenggat = COALESCE(?, tanggal_tenggat),
        selesai = COALESCE(?, selesai),
        tanggal_selesai = COALESCE(?, tanggal_selesai),
        bukti_pembayaran_uri = COALESCE(?, bukti_pembayaran_uri)
      WHERE id = ?
    `;

    await db.promise().query(sql, [
      nama,
      jumlah,
      tanggalTenggat,
      selesai !== undefined ? (selesai ? 1 : 0) : null,
      tanggalSelesai,
      buktiPembayaranUri,
      id
    ]);

    // Ambil token user
    const [rows] = await db.promise().query(
      "SELECT u.fcm_token, p.nama, p.tanggal_tenggat FROM piutang p JOIN users u ON u.id=p.user_id WHERE p.id=?",
      [id]
    );

    if (rows[0] && rows[0].fcm_token) {
      const fcmToken = rows[0].fcm_token;
      const tenggat = new Date(rows[0].tanggal_tenggat);
      const today = new Date();
      const hMinus1 = new Date();
      hMinus1.setDate(today.getDate() + 1);

      let title = "", bodyNotif = "";
      if (tenggat.toDateString() === today.toDateString()) {
        title = "⏰ Piutang Jatuh Tempo";
        bodyNotif = `Piutang "${rows[0].nama}" jatuh tempo hari ini`;
      } else if (tenggat.toDateString() === hMinus1.toDateString()) {
        title = "🔔 Pengingat Piutang";
        bodyNotif = `Besok piutang "${rows[0].nama}" jatuh tempo`;
      }

      if (title) await sendFcmNotification(fcmToken, title, bodyNotif, { piutangId: id.toString() });
    }

    res.json({ success: true, message: "Piutang berhasil diupdate" });
  } catch (err) {
    console.error("ERROR UPDATE PIUTANG:", err);
    res.status(500).json({ success: false });
  }
};

// DELETE PIUTANG
exports.deletePiutang = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.promise().query("SELECT selesai FROM piutang WHERE id = ?", [id]);
    if (results.length === 0) return res.status(404).json({ message: "Piutang tidak ditemukan" });
    if (results[0].selesai === 1) return res.status(400).json({ message: "Piutang sudah selesai, tidak bisa dihapus" });

    await db.promise().query("DELETE FROM piutang WHERE id = ?", [id]);
    res.json({ success: true, message: "Piutang berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
