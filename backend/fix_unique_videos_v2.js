const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

const blenderVideos = [
  "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
  "https://www.youtube.com/watch?v=eRsGyueVLvQ",
  "https://www.youtube.com/watch?v=R6MlUcmOul8",
  "https://www.youtube.com/watch?v=TLkA0RELQ1g",
  "https://www.youtube.com/watch?v=WhWc3b3KhnY",
  "https://www.youtube.com/watch?v=mN0zPOpADL4",
  "https://www.youtube.com/watch?v=Z4C82eyhwxc",
  "https://www.youtube.com/watch?v=1oQ_tNnO3cM",
  "https://www.youtube.com/watch?v=SkVqJ1SGeL0",
  "https://www.youtube.com/watch?v=Y-rmzh0PI3c",
  "https://www.youtube.com/watch?v=WjwwKHOAs1M",
  "https://www.youtube.com/watch?v=pKmSdY56VtY",
  "https://www.youtube.com/watch?v=_cMxraX_5RE",
  "https://www.youtube.com/watch?v=UXqq0ZvbOnk"
];

async function fixUniqueVideos() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({}).sort({ createdAt: -1 });
    const bulkOps = [];
    let index = 0;

    videos.forEach((video) => {
      // Keep local uploads intact
      if (video.url && video.url.includes("/uploads/")) {
        return;
      }
      
      const url = blenderVideos[index % blenderVideos.length];
      index++;

      bulkOps.push({
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { url: url } }
        }
      });
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} videos with 100% embeddable Blender YouTube URLs!`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

fixUniqueVideos();

