const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const videoRoutes = require("./routes/videos");
const playlistRoutes = require("./routes/playlists");
const aiRoutes = require("./routes/ai");
const notificationRoutes = require("./routes/notifications");
const thumbnailRoutes = require("./routes/thumbnails");

const {
  globalLimiter,
  notFound,
  errorHandler,
} = require("./middlewares/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(globalLimiter);

// Serve static physical uploads
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/thumbnails", thumbnailRoutes);

// Welcome Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Video Streaming MERN API",
    version: "1.0.0",
    status: "Active"
  });
});

// Health Check
app.get("/health", (req, res) =>
  res.json({ success: true, status: "ok", uptime: process.uptime() }),
);


// Error Handling
app.use(notFound);
app.use(errorHandler);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Nexus Database Connected Successfully"))
  .catch((err) => console.error("Database connection failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Nexus Core running on port ${PORT}`));
