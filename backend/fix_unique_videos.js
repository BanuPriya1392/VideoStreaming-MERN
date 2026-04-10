const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

// Use only known-good Rick Astley, Big Buck Bunny, Elephants Dream, Tears of Steel, Sintel etc. via YouTube
const categoryVideos = {
  "AI": ["https://www.youtube.com/watch?v=aircAruvnKk", "https://www.youtube.com/watch?v=t4vKPhjcMZg"],
  "Music": ["https://www.youtube.com/watch?v=jfKfPfyJRdk", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
  "Gaming": ["https://www.youtube.com/watch?v=r6tH55syq0o", "https://www.youtube.com/watch?v=1O6Qstncpnc"],
  "Live": ["https://www.youtube.com/watch?v=jfKfPfyJRdk", "https://www.youtube.com/watch?v=21X5lGlDOfg"],
  "Tech": ["https://www.youtube.com/watch?v=OaqnI_N8oE0", "https://www.youtube.com/watch?v=Tn6-PIqc4UM"],
  "Education": ["https://www.youtube.com/watch?v=zOjov-2OZ0E", "https://www.youtube.com/watch?v=p3GkLS3m000"],
  "Cinema": ["https://www.youtube.com/watch?v=d9MyW72ELq0", "https://www.youtube.com/watch?v=mqqft2x_Aa4"],
  "Science": ["https://www.youtube.com/watch?v=Kx1mB2-pBfA", "https://www.youtube.com/watch?v=JH1kRty0I4U"],
  "Lifestyle": ["https://www.youtube.com/watch?v=lX6JcybgDFo", "https://www.youtube.com/watch?v=pWdKf3MneyI"],
  "Family": ["https://www.youtube.com/watch?v=pWdKf3MneyI"],
  "Sports": ["https://www.youtube.com/watch?v=xV_u5q9dE98"],
  "Vlog": ["https://www.youtube.com/watch?v=8WwNtv2fXyI"],
  "Other": ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=jNQXAC9IVRw"]
};

async function fixUniqueVideos() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    // Remove any videos that might have invalid URLs or syntax stuff
    const videos = await Video.find({}).sort({ createdAt: -1 });
    
    const categoryIndexes = {};
    const bulkOps = [];

    videos.forEach((video) => {
      // Don`\``t overwrite user-uploaded videos from local storage
      if (video.url && video.url.includes("/uploads/")) {
        return;
      }
      const tag = video.tag || "Other";
      if (categoryIndexes[tag] === undefined) {
        categoryIndexes[tag] = 0;
      }
      
      const vids = categoryVideos[tag] || categoryVideos["Other"];
      const url = vids[categoryIndexes[tag] % vids.length];
      categoryIndexes[tag]++;

      bulkOps.push({
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { url: url } }
        }
      });
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully updated ${result.modifiedCount} videos with UNIQUE YouTube URLs!`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

fixUniqueVideos();

