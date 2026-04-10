const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    sheetyId: {
      type: Number,
      unique: true,
      sparse: true, // allow null for locally-created videos
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: 100,
    },
    tag: {
      type: String,
      required: [true, "Tag is required"],
      enum: [
        "AI",
        "Music",
        "Gaming",
        "Live",
        "Tech",
        "Education",
        "Cinema",
        "Science",
        "Lifestyle",
        "Family",
        "Sports",
        "Vlog",
        "Other",
      ],
    },
    views: {
      type: String,
      default: "0",
    },
    time: {
      type: String,
      default: "just now",
    },
    url: {
      type: String,
      required: [true, "Video URL is required"],
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    duration: { type: String, default: "0:00" },
    tags: [{ type: String, trim: true, uppercase: true }],
  },
  {
    timestamps: true,
  },
);

videoSchema.index({ tag: 1 });
videoSchema.index({ author: 1 });
videoSchema.index({ title: "text", description: "text", author: "text" });

module.exports = mongoose.model("Video", videoSchema);
