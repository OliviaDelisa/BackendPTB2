const express = require("express");
const router = express.Router();
const piutangController = require("../controllers/piutangController");
const piutangUploadController = require("../controllers/piutangUploadController");

// CRUD Piutang
router.post("/", piutangController.createPiutang);
router.put("/:id", piutangController.updatePiutang);
router.delete("/:id", piutangController.deletePiutang);

// Upload bukti
router.post("/:id/upload", piutangUploadController.uploadBukti);

module.exports = router;
