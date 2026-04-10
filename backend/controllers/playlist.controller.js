const Playlist = require("../models/Playlist");

async function createPlaylist(req, res, next) {
  try {
    const newPlaylist = await Playlist.create({
      name: req.body.name,
      description: req.body.description || "",
      owner: req.user._id,
      isPublic:
        typeof req.body.isPublic === "boolean" ? req.body.isPublic : true,
      videos: req.body.videos || [],
    });
    return res.status(201).json({ success: true, data: newPlaylist });
  } catch (err) {
    return next(err);
  }
}

async function getMyPlaylists(req, res, next) {
  try {
    const playlists = await Playlist.find({ owner: req.user._id })
      .populate("videos")
      .lean();
    return res.status(200).json({ success: true, data: playlists });
  } catch (err) {
    return next(err);
  }
}

async function getPlaylistById(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("videos owner", "username email")
      .lean();
    if (!playlist) {
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    }
    if (
      !playlist.isPublic &&
      playlist.owner._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return res.status(200).json({ success: true, data: playlist });
  } catch (err) {
    return next(err);
  }
}

async function updatePlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist)
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    playlist.name = req.body.name || playlist.name;
    playlist.description =
      typeof req.body.description === "string"
        ? req.body.description
        : playlist.description;
    if (typeof req.body.isPublic === "boolean")
      playlist.isPublic = req.body.isPublic;
    if (Array.isArray(req.body.videos)) playlist.videos = req.body.videos;

    await playlist.save();
    return res.status(200).json({ success: true, data: playlist });
  } catch (err) {
    return next(err);
  }
}

async function deletePlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist)
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await playlist.remove();
    return res.status(200).json({ success: true, message: "Playlist deleted" });
  } catch (err) {
    return next(err);
  }
}

async function addVideoToPlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist)
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const videoId = req.body.videoId;
    if (!videoId)
      return res
        .status(400)
        .json({ success: false, message: "videoId is required" });
    if (!playlist.videos.includes(videoId)) playlist.videos.push(videoId);
    await playlist.save();
    return res.status(200).json({ success: true, data: playlist });
  } catch (err) {
    return next(err);
  }
}

async function removeVideoFromPlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist)
      return res
        .status(404)
        .json({ success: false, message: "Playlist not found" });
    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    playlist.videos = playlist.videos.filter(
      (id) => id.toString() !== req.params.videoId,
    );
    await playlist.save();
    return res.status(200).json({ success: true, data: playlist });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createPlaylist,
  getMyPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
};
