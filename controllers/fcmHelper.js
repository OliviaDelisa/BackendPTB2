const admin = require("firebase-admin");
const serviceAccount = require("../notif-ad71d-firebase-adminsdk-fbsvc-54659b2818.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function sendFcmNotification(token, title, body, data = {}) {
  if (!token) return;

  const message = {
    token,
    notification: { title, body },
    data,
  };

  return admin.messaging().send(message);
}

module.exports = { sendFcmNotification };
