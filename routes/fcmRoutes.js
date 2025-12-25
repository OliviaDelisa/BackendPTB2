const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/save-token", async (req, res) => {
  const { user_id, fcm_token } = req.body;
  await db.query("UPDATE users SET fcm_token=? WHERE id=?", [fcm_token, user_id]);
  res.json({ success: true });
});

module.exports = router;
