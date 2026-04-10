const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

const categories = [
  "AI",
  "Music",
  "Gaming",
  "Live",
  "Tech",
  "Education",
  "Cinema",
  "Science",
  "Lifestyle",
  "Family",
  "Sports",
  "Vlog",
  "Other",
];

const videoUrls = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
];

const authors = [
  "Tech Guru", "Creative Mind", "Daily Vloggers", "Science Insider", "Gaming Legend",
  "Music Maestro", "Education Hub", "Cinema Buffs", "Life Enthusiast", "Sports Zone",
  "Family Fun", "Live Events", "AI Explorer", "Innovator Pro", "The Archive"
];

const adjectives = ["Mastering", "Explaining", "Discovering", "Daily", "Legendary", "Complete", "Quick", "Advanced", "Essential", "The Secret of"];

function generateVideos() {
  const allVideos = [];
  
  categories.forEach((category) => {
    for (let i = 1; i <= 30; i++) {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const author = authors[Math.floor(Math.random() * authors.length)];
      const videoId = `${category.toLowerCase()}_${i}`;
      
      const video = {
        title: `${adj} ${category} - Episode ${i}`,
        author: author,
        tag: category,
        views: `${(Math.random() * 5).toFixed(1)}M`,
        time: `${i} ${i === 1 ? 'day' : 'days'} ago`,
        url: videoUrls[i % videoUrls.length],
        thumbnail: `https://picsum.photos/seed/${videoId}/600/400`,
        description: `This is video #${i} in the ${category} category, providing high-quality content for our users.`,
        duration: `${Math.floor(Math.random() * 10) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        likes: Math.floor(Math.random() * 10000),
        dislikes: Math.floor(Math.random() * 500),
        tags: [category.toUpperCase(), "HD", "UNIQUE", `EP${i}`]
      };
      
      allVideos.push(video);
    }
  });
  
  return allVideos;
}

async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/videostreaming";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected Successfully.");

    console.log("Cleaning up existing videos...");
    await Video.deleteMany({});
    console.log("Cleanup complete.");

    const generatedVideos = generateVideos();
    console.log(`Generated ${generatedVideos.length} unique videos...`);

    console.log("Seeding to database (this may take a few seconds)...");
    const inserted = await Video.insertMany(generatedVideos);
    console.log(`Successfully seeded ${inserted.length} videos!`);

    mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Critical error during seeding:", err);
    process.exit(1);
  }
}

seedDB();
