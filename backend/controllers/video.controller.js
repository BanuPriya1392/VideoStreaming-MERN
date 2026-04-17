const Video = require("../models/Video");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const sheety = require("../config/sheety");

function sheetyRowToDoc(row) {
  return {
    sheetyId: row.id,
    title: row.title,
    author: row.author,
    tag: row.tag,
    views: row.views,
    time: row.time,
    url: row.url,
    duration: row.duration || "0:00",
    thumbnail: row.thumbnail || "",
    banner: row.banner || "",
    description: row.description || "",
  };
}

function docToSheetyPayload(doc) {
  return {
    sheet1: {
      title: doc.title,
      author: doc.author,
      tag: doc.tag,
      views: doc.views,
      time: doc.time,
      url: doc.url,
      duration: doc.duration,
      thumbnail: doc.thumbnail,
      banner: doc.banner,
      description: doc.description,
    },
  };
}

async function syncFromSheety(req, res, next) {
  try {
    var result = await sheety.get("");
    var rows = result.data.sheet1 || [];
    var ops = rows.map(function (row) {
      return {
        updateOne: {
          filter: { sheetyId: row.id },
          update: { $set: sheetyRowToDoc(row) },
          upsert: true,
        },
      };
    });
    var bulkResult = await Video.bulkWrite(ops);
    return res.status(200).json({
      success: true,
      message: "Sync complete",
      data: {
        upserted: bulkResult.upsertedCount,
        modified: bulkResult.modifiedCount,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getAllVideos(req, res, next) {
  try {
    var tag = req.query.tag;
    var author = req.query.author;
    var search = req.query.search;
    var page = parseInt(req.query.page) || 1;
    var limit = parseInt(req.query.limit) || 50;
    var filter = {};
    if (tag) filter.tag = tag;
    if (author) filter.author = new RegExp(author, "i");
    if (search) {
      const searchRegex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { author: searchRegex },
      ];
    }
    var skip = (page - 1) * limit;
    var total = await Video.countDocuments(filter);
    var videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const users = await User.find({ username: { $in: videos.map(v => v.author) } }).lean();
    const userMap = {};
    users.forEach(u => {
      userMap[u.username] = u.profile?.avatarUrl;
    });
    const videosWithAvatar = videos.map(v => {
      v.authorAvatar = userMap[v.author] || null;
      return v;
    });

    return res.status(200).json({
      success: true,
      data: videosWithAvatar,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function getAllTags(req, res, next) {
  try {
    var tags = await Video.distinct("tag");
    return res.status(200).json({ success: true, data: tags.sort() });
  } catch (err) {
    return next(err);
  }
}

async function getVideoById(req, res, next) {
  try {
    var video = await Video.findById(req.params.id).lean();
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    const user = await User.findOne({ username: video.author }).lean();
    video.authorAvatar = user?.profile?.avatarUrl || null;
    return res.status(200).json({ success: true, data: video });
  } catch (err) {
    return next(err);
  }
}

async function createVideo(req, res, next) {
  try {
    var video = await Video.create(req.body);
    try {
      var sheetyResult = await sheety.post("", docToSheetyPayload(video));
      video.sheetyId = sheetyResult.data.sheet1 && sheetyResult.data.sheet1.id;
      await video.save();
    } catch (sheetyErr) {
      console.warn("Sheety sync failed (create):", sheetyErr.message);
    }
    return res.status(201).json({ success: true, data: video });
  } catch (err) {
    return next(err);
  }
}

async function updateVideo(req, res, next) {
  try {
    var video = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    if (video.sheetyId) {
      try {
        await sheety.put("/" + video.sheetyId, docToSheetyPayload(video));
      } catch (sheetyErr) {
        console.warn("Sheety sync failed (update):", sheetyErr.message);
      }
    }
    return res.status(200).json({ success: true, data: video });
  } catch (err) {
    return next(err);
  }
}

async function uploadVideo(req, res, next) {
  try {
    // 1. Basic Field Extraction & Fallbacks
    const safeTitle = (req.body.title || "Untitled Transmission").substring(0, 200);
    const safeDescription = (req.body.description || "").substring(0, 500);
    const safeAuthor = (req.body.author || "Nexus Operative").substring(0, 100);
    
    // 2. Tag Normalization
    let tag = req.body.tag || "Other";
    tag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
    
    const validTags = ["AI", "Music", "Gaming", "Live", "Tech", "Education", "Cinema", "Science", "Lifestyle", "Family", "Sports", "Vlog", "Other"];
    if (!validTags.includes(tag)) tag = "Other";

    // 3. URLs
    let url = req.body.url;
    let thumbnail = req.body.thumbnail || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=600";
    let banner = req.body.banner || thumbnail;

    // 4. File Fallbacks (if anyone still uses multipart)
    if (req.files && req.files.videoFile) url = req.files["videoFile"][0].path;
    if (req.files && req.files.thumbnailFile) thumbnail = req.files["thumbnailFile"][0].path;
    if (req.files && req.files.bannerFile) banner = req.files["bannerFile"][0].path;
    
    // 5. Validation Check
    if (!url) {
      return res.status(400).json({ success: false, message: "Uplink failed: No video source found." });
    }

    // 6. DB Creation
    const video = await Video.create({
      title: safeTitle,
      author: safeAuthor,
      tag: tag,
      views: req.body.views || "0",
      time: "Just now",
      duration: req.body.duration || "0:00",
      url,
      thumbnail,
      banner,
      description: safeDescription,
      tags: req.body.tags || req.body["tags[]"] || [tag],
    });

    await Notification.create({
      user: req.user._id,
      text: `Uplink successful: ${safeTitle} has been integrated into the Nexus.`,
    });

    const videoObj = video.toObject();
    const userObj = await User.findOne({ username: safeAuthor }).lean();
    videoObj.authorAvatar = userObj?.profile?.avatarUrl || null;

    return res.status(201).json({ success: true, data: videoObj });
  } catch (err) {
    return next(err);
  }
}

async function patchVideo(req, res, next) {
  try {
    var video = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }
    if (video.sheetyId) {
      try {
        await sheety.put("/" + video.sheetyId, docToSheetyPayload(video));
      } catch (sheetyErr) {
        console.warn("Sheety sync failed (patch):", sheetyErr.message);
      }
    }
    return res.status(200).json({ success: true, data: video });
  } catch (err) {
    return next(err);
  }
}

async function deleteVideo(req, res, next) {
  try {
    var video = await Video.findById(req.params.id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    if (req.user.role !== "admin" && video.author !== req.user.username) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to delete this video",
        });
    }

    await video.deleteOne();

    if (video.sheetyId) {
      try {
        await sheety.delete("/" + video.sheetyId);
      } catch (sheetyErr) {
        console.warn("Sheety sync failed (delete):", sheetyErr.message);
      }
    }
    return res
      .status(200)
      .json({ success: true, message: "Video deleted successfully" });
  } catch (err) {
    return next(err);
  }
}

async function likeVideo(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    video.likes = (video.likes || 0) + 1;
    await video.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { "profile.likedVideos": video._id },
    });
    return res.status(200).json({ success: true, data: video });
  } catch (err) {
    return next(err);
  }
}

async function unlikeVideo(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    video.likes = Math.max(0, (video.likes || 0) - 1);
    await video.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { "profile.likedVideos": video._id },
    });
    return res.status(200).json({ success: true, data: video });
  } catch (err) {
    return next(err);
  }
}

async function getVideoComments(req, res, next) {
  try {
    const comments = await Comment.find({ video: req.params.id })
      .populate("user", "username profile.avatarUrl")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: comments });
  } catch (err) {
    return next(err);
  }
}

async function addVideoComment(req, res, next) {
  try {
    if (!req.body.text)
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required" });
    const comment = await Comment.create({
      video: req.params.id,
      user: req.user._id,
      text: req.body.text,
    });
    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    return next(err);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });

    let related = await Video.find({
      _id: { $ne: video._id },
      $or: [
        { tag: video.tag },
        { author: video.author },
        { $text: { $search: video.title } },
      ],
    })
      .sort({ likes: -1, views: -1, createdAt: -1 })
      .limit(8)
      .lean();

    // FALLBACK: If not enough matches, fill with recent popular videos
    if (related.length < 4) {
      const existingIds = related.map((v) => v._id);
      existingIds.push(video._id);

      const fill = await Video.find({
        _id: { $nin: existingIds },
      })
        .sort({ createdAt: -1, views: -1 })
        .limit(8 - related.length)
        .lean();

      related = [...related, ...fill];
    }

    const users = await User.find({ username: { $in: related.map(v => v.author) } }).lean();
    const userMap = {};
    users.forEach(u => {
      userMap[u.username] = u.profile?.avatarUrl;
    });
    const relatedWithAvatar = related.map(v => {
      v.authorAvatar = userMap[v.author] || null;
      return v;
    });

    return res.status(200).json({ success: true, data: relatedWithAvatar });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  syncFromSheety: syncFromSheety,
  getAllVideos: getAllVideos,
  getAllTags: getAllTags,
  getVideoById: getVideoById,
  createVideo: createVideo,
  updateVideo: updateVideo,
  patchVideo: patchVideo,
  deleteVideo: deleteVideo,
  likeVideo: likeVideo,
  unlikeVideo: unlikeVideo,
  getVideoComments: getVideoComments,
  addVideoComment: addVideoComment,
  getRecommendations: getRecommendations,
  uploadVideo: uploadVideo,
};
