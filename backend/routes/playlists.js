const express = require("express");
const router = express.Router();

const {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} = require("../controllers/playlist.controller");

const { protect } = require("../middlewares/auth.middleware");

router.post("/", protect, createPlaylist);
router.get("/", protect, getMyPlaylists);
router.get("/:id", protect, getPlaylistById);
router.put("/:id", protect, updatePlaylist);
router.delete("/:id", protect, deletePlaylist);
router.post("/:id/videos", protect, addVideoToPlaylist);
router.delete("/:id/videos/:videoId", protect, removeVideoFromPlaylist);

module.exports = router;
