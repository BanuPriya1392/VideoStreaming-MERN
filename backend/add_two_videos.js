const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

const categories = [
  "AI", "Cinema", "Education", "Family", "Gaming", "Lifestyle", 
  "Live", "Music", "Science", "Sports", "Tech", "Vlog", "Other"
];

const videoUrls = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
];

const thumbnails = [
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
];

async function addVideos() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const newVideos = [];

    categories.forEach((cat, index) => {
      // Video 1 for this category
      newVideos.push({
        title: `Premium ${cat} Insights - Vol 1`,
        author: "Nexus Creator",
        tag: cat,
        views: "150K",
        time: "Just now",
        duration: "12:45",
        url: videoUrls[index % videoUrls.length],
        thumbnail: thumbnails[index % thumbnails.length],
        description: `Fresh premium content for the ${cat} sector. Part of our latest expansion.`,
        tags: [cat.toUpperCase(), "NEW", "PREMIUM"]
      });

      // Video 2 for this category
      newVideos.push({
        title: `Advanced ${cat} Mastery - Vol 2`,
        author: "Nexus Expert",
        tag: cat,
        views: "85K",
        time: "Just now",
        duration: "15:20",
        url: videoUrls[(index + 1) % videoUrls.length],
        thumbnail: thumbnails[(index + 1) % thumbnails.length],
        description: `In-depth exploration of ${cat} trends and techniques.`,
        tags: [cat.toUpperCase(), "MASTERCLASS", "2026"]
      });
    });

    console.log(`Inserting ${newVideos.length} new videos...`);
    const result = await Video.insertMany(newVideos);
    console.log(`Successfully added ${result.length} videos!`);

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error adding videos:", err);
    process.exit(1);
  }
}

addVideos();
