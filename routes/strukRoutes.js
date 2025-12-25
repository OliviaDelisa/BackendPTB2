const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

// =====================
// STORAGE CONFIG
// =====================
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =====================
// UPLOAD STRUK
// =====================
router.post("/upload", upload.single("image"), (req, res) => {
  const { hutang_id } = req.body;
  const imageUrl = `http://${req.headers.host}/uploads/${req.file.filename}`;

  const sql = "INSERT INTO struk_hutang (hutang_id, image_url) VALUES (?, ?)";
  db.query(sql, [hutang_id, imageUrl], (err) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, image_url: imageUrl });
  });
});

// =====================
// GET STRUK BY HUTANG
// =====================
router.get("/:hutang_id", (req, res) => {
  const sql = "SELECT * FROM struk_hutang WHERE hutang_id = ?";
  db.query(sql, [req.params.hutang_id], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, data: result });
  });
});

module.exports = router;
