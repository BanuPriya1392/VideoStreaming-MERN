const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");
const User = require("./models/User");
const Comment = require("./models/Comment");
const Notification = require("./models/Notification");

const sampleVideos = [
  {
    title: "Understanding Neural Networks in 10 Minutes",
    author: "AI Simplified",
    tag: "AI",
    views: "1.2M",
    time: "2 days ago",
    duration: "10:15",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
    description: "A quick dive into how neural networks learn and function.",
  },
  {
    title: "The Next Generation of Consoles",
    author: "GameTech",
    tag: "Gaming",
    views: "3.4M",
    time: "1 week ago",
    duration: "15:30",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    description: "Witness the stunning visual fidelity of the latest gaming hardware.",
  },
  {
    title: "Lofi Beats to Code To",
    author: "Chill Beats",
    tag: "Music",
    views: "500K",
    time: "Just now",
    duration: "59:59",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=600",
    description: "Relaxing beats to help you focus on your coding and study sessions.",
  },
  {
    title: "Quantum Computing Explained",
    author: "Science Daily",
    tag: "Tech",
    views: "800K",
    time: "3 days ago",
    duration: "08:45",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600",
    description: "Demystifying quantum mechanics and quantum computing.",
  },
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes("<db_password>")) {
      console.error("ERROR: Please update your .env file with the actual database password first!");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas...");

    // 1. Clear everything
    await Promise.all([
      Video.deleteMany({}),
      User.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log("Wiped existing cloud data...");

    // 2. Create a Demo User
    const demoUser = await User.create({
      name: "Nexus Guardian",
      email: "guardian@nexus.com",
      password: "password123", // Will be hashed by pre-save hook
      username: "guardian",
      profile: {
        bio: "Overseer of the Nexus Signal Stream.",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
      }
    });
    console.log("Created Demo User: guardian");

    // 3. Insert Videos
    const insertedVideos = await Video.insertMany(sampleVideos);
    console.log(`Inserted ${insertedVideos.length} videos.`);

    // 4. Create initial signals (comments)
    await Comment.create({
      video: insertedVideos[0]._id,
      user: demoUser._id,
      text: "Neural frequency established. Excellent transmission."
    });
    console.log("Generated initial signal (comment).");

    // 5. Create initial notification
    await Notification.create({
      user: demoUser._id,
      text: "Welcome to the Atlas Cloud Frequencies. Your signal is strong."
    });
    console.log("Sent welcome notification.");

    console.log("\nFULL SYSTEM SEED COMPLETE! Check your Atlas Dashboard now.");
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding the database:", err);
    process.exit(1);
  }
}

seedDB();
