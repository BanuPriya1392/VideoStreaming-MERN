const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

async function checkDuplicates() {
  await mongoose.connect(process.env.MONGO_URI);
  const videos = await Video.find({}, "thumbnail");
  const counts = {};
  videos.forEach(v => {
    counts[v.thumbnail] = (counts[v.thumbnail] || 0) + 1;
  });
  
  console.log("Top 5 Dulicate Thumbnails:");
  Object.entries(counts)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([url, count]) => console.log(`${count} videos use: ${url}`));
  
  mongoose.disconnect();
}
checkDuplicates();
