const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();
const Video = require("./models/Video");

const thumbnailsDir = path.join(__dirname, "uploads", "thumbnails");
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
      file.on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
    }).on("error", reject);
  });
}

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB. Starting local HD image download pipeline...");

    const videos = await Video.find({});
    let successCount = 0;
    let failCount = 0;

    console.log(`Processing ${videos.length} videos sequentially to avoid Unsplash rate limits...`);

    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        let url = video.thumbnail;
        
        if (!url || !url.startsWith("http")) {
            continue;
        }

        const filename = `${video._id}.jpg`;
        const dest = path.join(thumbnailsDir, filename);
        const localDbPath = `/uploads/thumbnails/${filename}`;

        try {
            if (!fs.existsSync(dest)) {
                await downloadImage(url, dest);
                // 150ms delay to prevent HTTP 429 Too Many Requests
                await new Promise(r => setTimeout(r, 150));
            }
            
            await Video.updateOne(
                { _id: video._id },
                { $set: { thumbnail: localDbPath } }
            );
            
            if ((i + 1) % 50 === 0) {
              console.log(`[${i + 1}/${videos.length}] Transferred successfully so far...`);
            }
            successCount++;
        } catch (err) {
            console.error(`[${i+1}/${videos.length}] ❌ Failed: ${video.title} - ${err.message}`);
            failCount++;
        }
    }

    console.log(`\nDONE. Successfully downloaded and permanently linked ${successCount} premium HD thumbnails. Failed: ${failCount}`);
    
    mongoose.disconnect();
    process.exit(0);
  } catch(e) {
      console.error("FATAL ERROR:", e);
      process.exit(1);
  }
}

start();
