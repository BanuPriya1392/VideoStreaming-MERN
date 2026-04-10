const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

async function standardizeThumbnails() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({});
    console.log(`Processing ${videos.length} videos...`);

    const bulkOps = videos.map((video) => {
      // Use the video's MongoDB ID as a seed for a unique, high-quality image
      const uniqueThumbnail = `https://picsum.photos/seed/${video._id}/600/400`;
      
      return {
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { thumbnail: uniqueThumbnail } }
        }
      };
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} videos with unique thumbnails!`);
    } else {
      console.log("No videos found to update.");
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error standardizing thumbnails:", err);
    process.exit(1);
  }
}

standardizeThumbnails();
