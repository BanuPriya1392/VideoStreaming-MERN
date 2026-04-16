const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Smart Cloudinary storage — detects video vs image by fieldname
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.fieldname === "videoFile";
    return {
      folder: isVideo ? "nexus/videos" : "nexus/thumbnails",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? "mp4,mov,avi,mkv,webm"
        : "jpg,jpeg,png,webp",
      ...(isVideo ? {} : { transformation: "q_auto,w_1280" }),
    };
  },
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
});

const uploadFields = upload.fields([
  { name: "videoFile", maxCount: 1 },
  { name: "thumbnailFile", maxCount: 1 },
]);

const {
  syncFromSheety,
  getAllVideos,
  getAllTags,
  getVideoById,
  createVideo,
  uploadVideo,
  updateVideo,
  patchVideo,
  deleteVideo,
  likeVideo,
  unlikeVideo,
  getVideoComments,
  addVideoComment,
  getRecommendations,
} = require("../controllers/video.controller");

const {
  validate,
  createVideoSchema,
  updateVideoSchema,
  patchVideoSchema,
  listQuerySchema,
  idParamSchema,
} = require("../validators/video.validator");

const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { writeLimiter } = require("../middlewares/error.middleware");

// ─── Public ───────────────────────────────────────────────────────────────────

// GET  /api/videos
router.get("/", validate(listQuerySchema, "query"), getAllVideos);

// GET  /api/videos/tags  (must come before /:id)
router.get("/tags", getAllTags);

// GET  /api/videos/:id
router.get("/:id", validate(idParamSchema, "params"), getVideoById);

// GET /api/videos/cloudinary-signature — signed upload credentials for direct browser upload
router.get("/cloudinary-signature", protect, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "nexus/videos";
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );
    return res.json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Signature generation failed" });
  }
});

// POST /api/videos/upload (meta upload — for small files or thumbnails only)
router.post("/upload", protect, uploadFields, uploadVideo);

// ─── Protected (logged-in users) ──────────────────────────────────────────────

// POST /api/videos
router.post(
  "/",
  protect,
  writeLimiter,
  validate(createVideoSchema, "body"),
  createVideo,
);

// PUT  /api/videos/:id
router.put(
  "/:id",
  protect,
  writeLimiter,
  validate(idParamSchema, "params"),
  validate(updateVideoSchema, "body"),
  updateVideo,
);

// PATCH /api/videos/:id
router.patch(
  "/:id",
  protect,
  writeLimiter,
  validate(idParamSchema, "params"),
  validate(patchVideoSchema, "body"),
  patchVideo,
);

// DELETE /api/videos/:id
router.delete(
  "/:id",
  protect,
  writeLimiter,
  validate(idParamSchema, "params"),
  deleteVideo,
);

router.post("/:id/like", protect, validate(idParamSchema, "params"), likeVideo);
router.post(
  "/:id/unlike",
  protect,
  validate(idParamSchema, "params"),
  unlikeVideo,
);
router.get(
  "/:id/comments",
  validate(idParamSchema, "params"),
  getVideoComments,
);
router.post(
  "/:id/comments",
  protect,
  validate(idParamSchema, "params"),
  addVideoComment,
);
router.get(
  "/:id/recommendations",
  validate(idParamSchema, "params"),
  getRecommendations,
);

// ─── Admin ────────────────────────────────────────────────────────────────────

// POST /api/videos/sync  — pull latest from Sheety into MongoDB
router.post("/sync", protect, adminOnly, syncFromSheety);

module.exports = router;
