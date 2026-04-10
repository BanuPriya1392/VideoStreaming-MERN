const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Playlist", playlistSchema);
