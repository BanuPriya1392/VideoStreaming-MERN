const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const Video = require("./models/Video");

async function cleanup() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in environment variables.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Find videos by 'banu' (case-insensitive)
    const authorName = "banu";
    const videos = await Video.find({ author: new RegExp(`^${authorName}$`, "i") });

    if (videos.length === 0) {
      console.log(`No videos found for author "${authorName}".`);
      process.exit(0);
    }

    console.log(`Found ${videos.length} videos from author "${authorName}". Proceeding with cleanup...`);

    for (const video of videos) {
      console.log(`Cleaning up: ${video.title} (${video._id})`);

      // 1. Delete Video File
      if (video.url && video.url.startsWith("/uploads/")) {
        // Convert web path to local path
        const relativePath = video.url.replace(/^\//, "");
        const filePath = path.join(__dirname, relativePath);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`  - Deleted Video File: ${filePath}`);
        }
      }

      // 2. Delete Thumbnail File
      if (video.thumbnail && video.thumbnail.startsWith("/uploads/")) {
        const relativeThumbPath = video.thumbnail.replace(/^\//, "");
        const thumbPath = path.join(__dirname, relativeThumbPath);
        
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
          console.log(`  - Deleted Thumbnail File: ${thumbPath}`);
        }
      }
    }

    // 3. Delete DB Records
    const result = await Video.deleteMany({ author: new RegExp(`^${authorName}$`, "i") });
    console.log(`\nSuccess: Deleted ${result.deletedCount} database records for author "${authorName}".`);

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical Error during cleanup:", err);
    process.exit(1);
  }
}

cleanup();
