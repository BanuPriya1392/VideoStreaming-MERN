const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

async function applyThumbnailProxy() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({});
    let count = 0;

    const bulkOps = videos.map(video => {
      if (video.thumbnail && video.thumbnail.includes("images.unsplash.com") && !video.thumbnail.includes("wsrv.nl")) {
        // wsrv.nl proxy strips referrers and bypasses hotlinking restrictions
        const proxiedUrl = `https://wsrv.nl/?url=${encodeURIComponent(video.thumbnail)}`;
        count++;
        return {
          updateOne: {
            filter: { _id: video._id },
            update: { $set: { thumbnail: proxiedUrl } }
          }
        };
      }
      return null;
    }).filter(Boolean);

    if (bulkOps.length > 0) {
      await Video.bulkWrite(bulkOps);
      console.log(`Successfully proxied ${bulkOps.length} thumbnails to wsrv.nl!`);
    } else {
      console.log("No Unsplash thumbnails needed proxying.");
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Critical Error:", err);
    process.exit(1);
  }
}

applyThumbnailProxy();
