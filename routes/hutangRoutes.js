const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const path = require("path");

// =========================
//  MULTER (UPLOAD STRUK)
// =========================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =========================
//  ADD HUTANG
// =========================
router.post("/add", (req, res) => {
  const { nama, tanggal, jumlah } = req.body;

  if (!nama || !tanggal || jumlah == null) {
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap",
    });
  }

  const query = `
    INSERT INTO hutang (nama, tanggal, jumlah)
    VALUES (?, ?, ?)
  `;

  db.query(query, [nama, tanggal, jumlah], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal menambahkan hutang",
      });
    }

    res.json({
      success: true,
      message: "Hutang berhasil ditambahkan",
    });
  });
});

// =========================
//  GET ALL HUTANG
// =========================
router.get("/", (req, res) => {
  const query = "SELECT * FROM hutang ORDER BY id DESC";

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data hutang",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
});

// =========================
//  UPDATE HUTANG (EDIT)
// =========================
router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { nama, tanggal, jumlah } = req.body;

  if (!nama || !tanggal || jumlah == null) {
    return res.status(400).json({
      success: false,
      message: "Data tidak lengkap",
    });
  }

  const query = `
    UPDATE hutang
    SET nama = ?, tanggal = ?, jumlah = ?
    WHERE id = ?
  `;

  db.query(query, [nama, tanggal, jumlah, id], (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengupdate hutang",
      });
    }

    res.json({
      success: true,
      message: "Hutang berhasil diperbarui",
    });
  });
});

// =========================
//  DELETE HUTANG
// =========================
router.delete("/delete/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM hutang WHERE id = ?";

  db.query(query, [id], (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "Gagal menghapus hutang",
      });
    }

    res.json({
      success: true,
      message: "Hutang berhasil dihapus",
    });
  });
});

// =========================
//  SELESAIKAN HUTANG  ✅ (POST — SESUAI ANDROID)
// =========================
router.post("/selesai/:id", (req, res) => {
  const { id } = req.params;

  const selectQuery = "SELECT * FROM hutang WHERE id = ?";

  db.query(selectQuery, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hutang tidak ditemukan",
      });
    }

    const hutang = result[0];

    const insertHistory = `
      INSERT INTO history_hutang (nama, tanggal, jumlah)
      VALUES (?, ?, ?)
    `;

    db.query(
      insertHistory,
      [hutang.nama, hutang.tanggal, hutang.jumlah],
      (err) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Gagal memasukkan ke history",
          });
        }

        const deleteQuery = "DELETE FROM hutang WHERE id = ?";

        db.query(deleteQuery, [id], (err) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "Gagal menghapus hutang",
            });
          }

          res.json({
            success: true,
            message: "Hutang berhasil diselesaikan",
          });
        });
      }
    );
  });
});

// =========================
//  GET HISTORY HUTANG
// =========================
router.get("/history", (req, res) => {
  const query = `
    SELECT * FROM history_hutang
    ORDER BY tanggal_selesai DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil history",
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
});

// =========================
//  UPLOAD STRUK
// =========================
router.post("/upload/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "File tidak ditemukan",
    });
  }

  const imagePath = req.file.filename;

  const query = `
    UPDATE hutang
    SET struk = ?
    WHERE id = ?
  `;

  db.query(query, [imagePath, id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Gagal upload struk",
      });
    }

    res.json({
      success: true,
      message: "Struk berhasil diupload",
    });
  });
});

// =========================
//  EXPORT ROUTER
// =========================
module.exports = router;
