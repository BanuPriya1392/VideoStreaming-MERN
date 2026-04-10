const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      bio: { type: String, trim: true, maxlength: 500, default: "" },
      avatarUrl: { type: String, trim: true, default: "" },
      bannerUrl: { type: String, trim: true, default: "" },
      favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
      likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
