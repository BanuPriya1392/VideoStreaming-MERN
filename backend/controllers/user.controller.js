const User = require("../models/User");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("-password").lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profileData = req.body.profile || req.body;
    
    // Build update object based on provided fields only
    const updates = {};
    if (profileData.bio !== undefined) updates["profile.bio"] = profileData.bio;
    if (profileData.avatarUrl !== undefined) updates["profile.avatarUrl"] = profileData.avatarUrl;
    if (profileData.bannerUrl !== undefined) updates["profile.bannerUrl"] = profileData.bannerUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No profile data provided" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, {
      new: true,
      runValidators: true,
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { "profile.avatarUrl": avatarUrl },
      { new: true, select: "-password" },
    );

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
async function getProfileByUsername(req, res, next) {
  try {
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${req.params.username}$`, "i") } 
    }).select("-password").lean();
    
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile, updateProfile, uploadAvatar, getProfileByUsername };
