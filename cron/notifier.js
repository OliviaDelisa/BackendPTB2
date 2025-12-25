const cron = require("node-cron");
const db = require("../config/db");
const { sendFcmNotification } = require("../controllers/fcmHelper");

cron.schedule("* * * * *", () => {
  console.log("[NODE-CRON] Cron scan piutang dimulai");

  db.query(`
    SELECT p.id, p.nama, p.tanggal_tenggat, u.fcm_token
    FROM piutang p
    JOIN users u ON u.id = p.user_id
    WHERE p.selesai = 0
  `, (err, rows) => {
    if (err) {
      console.error("[NODE-CRON] Error scan piutang:", err);
      return;
    }

    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();

    rows.forEach(row => {
      if (!row.fcm_token) return;

      const tenggat = new Date(row.tanggal_tenggat).toDateString();
      let title = "", body = "";

      if (tenggat === today) {
        title = "⏰ Piutang Jatuh Tempo";
        body = `Piutang "${row.nama}" jatuh tempo hari ini`;
      } else if (tenggat === tomorrow) {
        title = "🔔 Pengingat Piutang";
        body = `Besok piutang "${row.nama}" jatuh tempo`;
      }

      if (title) {
        sendFcmNotification(row.fcm_token, title, body, { piutangId: row.id.toString() });
      }
    });

    console.log("[NODE-CRON] Scan selesai:", rows.length);
  });
});
