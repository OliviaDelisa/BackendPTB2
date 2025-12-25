const express = require("express");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/userRoutes");
const piutangRoutes = require("./routes/piutangRoutes");
const hutangRoutes = require("./routes/hutangRoutes");
const strukRoutes = require("./routes/strukRoutes");
const fcmRoutes = require("./routes/fcmRoutes");

// Cron
require("./cron/notifier"); // <-- jalankan cron otomatis

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/user", userRoutes);
app.use("/api/piutang", piutangRoutes);
app.use("/api/hutang", hutangRoutes);
app.use("/api/struk", strukRoutes);
app.use("/api/fcm", fcmRoutes);

// Root test
app.get("/", (req, res) => {
  res.send("SERVER OK");
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
