const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/token", userController.saveFcmToken);
// router.post("/send-notification", userController.sendNotification); // sementara comment

module.exports = router;
