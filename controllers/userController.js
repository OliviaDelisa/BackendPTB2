const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { sendFcmNotification } = require("./fcmHelper");

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: "Semua field wajib diisi" });

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ success: false, message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.create({ name, email, password: hashedPassword });

    res.json({ success: true, message: "Registrasi berhasil", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password, fcmToken } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email dan password wajib diisi" });

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ success: false, message: "Email tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Password salah" });

    // Update token FCM jika ada
    if (fcmToken) {
      await User.updateToken(user.id, fcmToken);
    }

    res.json({ success: true, message: "Login berhasil", userId: user.id, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// SIMPAN FCM TOKEN
exports.saveFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken)
    return res.status(400).json({ success: false, message: "userId dan fcmToken wajib" });

  try {
    await User.updateToken(userId, fcmToken);
    res.json({ success: true, message: "Token tersimpan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal menyimpan token" });
  }
};

// GET ALL USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data" });
  }
};
