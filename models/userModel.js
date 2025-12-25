const db = require("../config/db");

const User = {

  // =========================
  // CREATE USER (REGISTER)
  // =========================
  create: (data) => {
    return new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [data.name, data.email, data.password],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // =========================
  // FIND USER BY EMAIL
  // =========================
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0] || null); // null jika tidak ada
        }
      );
    });
  },

  // =========================
  // FIND USER BY ID
  // =========================
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, email, fcm_token FROM users WHERE id = ?",
        [id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0] || null);
        }
      );
    });
  },

  // =========================
  // GET ALL USERS
  // =========================
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT id, name, email, fcm_token FROM users",
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // =========================
  // UPDATE FCM TOKEN
  // =========================
  updateToken: (userId, fcmToken) => {
    return new Promise((resolve, reject) => {
      if (!fcmToken) return reject(new Error("FCM token tidak boleh kosong"));
      db.query(
        "UPDATE users SET fcm_token = ? WHERE id = ?",
        [fcmToken, userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // =========================
  // GET FCM TOKEN BY USER ID
  // =========================
  getTokenByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        "SELECT fcm_token FROM users WHERE id = ?",
        [userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result[0]?.fcm_token || null);
        }
      );
    });
  },

  // =========================
  // UPDATE INFO USER (name, email)
  // =========================
  updateInfo: (userId, data) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [data.name, data.email, userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // =========================
  // UPDATE PASSWORD
  // =========================
  updatePassword: (userId, hashedPassword) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET password = ? WHERE id = ?",
        [hashedPassword, userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },

  // =========================
  // DELETE USER
  // =========================
  delete: (userId) => {
    return new Promise((resolve, reject) => {
      db.query(
        "DELETE FROM users WHERE id = ?",
        [userId],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

};

module.exports = User;
