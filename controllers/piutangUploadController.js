const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// Setup storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `bukti_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

exports.uploadBukti = [
  upload.single("bukti"),
  (req, res) => {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "File wajib diupload" });
    }

    // URL publik
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    // Update database
    const sql = `
      UPDATE piutang
      SET bukti_pembayaran_uri = ?, selesai = 1, tanggal_selesai = NOW()
      WHERE id = ?
    `;
    db.query(sql, [fileUrl, id], (err, result) => {
      if (err) {
        console.error("ERROR UPLOAD BUKTI:", err);
        return res.status(500).json({ success: false, message: "Gagal upload bukti" });
      }

      res.status(200).json({
        success: true,
        message: "Bukti pembayaran berhasil diupload",
        url: fileUrl
      });
    });
  }
];
