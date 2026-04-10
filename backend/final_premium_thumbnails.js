const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

// Category keywords for highly relevant images
const categoryKeywords = {
  "AI": "artificial-intelligence",
  "Cinema": "cinema",
  "Education": "learning",
  "Family": "family",
  "Gaming": "gaming",
  "Lifestyle": "lifestyle",
  "Live": "live-stream",
  "Music": "music",
  "Science": "science",
  "Sports": "sports",
  "Tech": "technology",
  "Vlog": "vlogging",
  "Other": "abstract"
};

async function applyFinalThumbnails() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({});
    console.log(`Applying final HD upgrade to ${videos.length} videos...`);

    const bulkOps = videos.map((video, index) => {
      const keyword = categoryKeywords[video.tag] || "abstract";
      
      // LoremFlickr is a stable and reliable service for themed images.
      // The 'lock' parameter ensures each video gets a unique image.
      // We use a combination of category and a unique index to ensure no overlaps.
      const finalThumbnail = `https://loremflickr.com/800/600/${keyword}?lock=${index + 1000}`;
      
      return {
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { thumbnail: finalThumbnail } }
        }
      };
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully finalized ${result.modifiedCount} videos with unique, visible HD thumbnails!`);
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error applying final thumbnails:", err);
    process.exit(1);
  }
}

applyFinalThumbnails();
