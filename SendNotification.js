const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const User = require("../models/userModel");

router.post("/send-notification", async (req, res) => {
  const { userId, title, body } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmToken) {
      return res.status(400).json({ success: false, message: "Token user tidak ditemukan" });
    }

    const message = {
      token: user.fcmToken,
      notification: { title, body },
      android: { priority: "high", notification: { sound: "default" } },
      data: { title, body } // agar foreground juga bisa membaca
    };

    const response = await admin.messaging().send(message);
    return res.json({ success: true, response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
