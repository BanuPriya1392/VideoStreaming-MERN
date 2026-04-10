const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

async function applySvgThumbnails() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({});
    console.log(`Updating ${videos.length} videos to 100% fail-proof local SVG thumbnails...`);

    const bulkOps = videos.map((video) => {
      // Direct the thumbnail to the new local backend SVG generator
      // Note: We use relative path /api/thumbnails/... so the frontend auto-resolves correctly
      return {
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { thumbnail: `/api/thumbnails/${video._id}` } }
        }
      };
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} thumbnails manually!`);
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical Error:", err);
    process.exit(1);
  }
}

applySvgThumbnails();
