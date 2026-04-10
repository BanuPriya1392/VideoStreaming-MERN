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
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600",
    description: "A quick dive into how neural networks learn and function.",
    duration: "10:15",
  },
  {
    title: "The Next Generation of Consoles",
    author: "GameTech",
    tag: "Gaming",
    views: "3.4M",
    time: "1 week ago",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    description: "Witness the stunning visual fidelity of the latest gaming hardware.",
    duration: "15:30",
  },
  {
    title: "Lofi Beats to Code To",
    author: "Chill Beats",
    tag: "Music",
    views: "500K",
    time: "Just now",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=600",
    description: "Relaxing beats to help you focus on your coding and study sessions.",
    duration: "59:59",
  },
  {
    title: "Quantum Computing Explained",
    author: "Science Daily",
    tag: "Tech",
    views: "800K",
    time: "3 days ago",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=600",
    description: "Demystifying quantum mechanics and quantum computing.",
    duration: "08:45",
  },
  {
    title: "SpaceX Launch Live Stream",
    author: "SpaceX",
    tag: "Live",
    views: "10M",
    time: "Live now",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=600",
    description: "Join us live for the historic launch of the Falcon Heavy rocket.",
    duration: "02:30:00",
  },
  {
    title: "Complete React JS Crash Course",
    author: "Code Masters",
    tag: "Education",
    views: "250K",
    time: "4 hours ago",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600",
    description: "Learn how to build lightning-fast web apps using Modern React and Vite.",
    duration: "12:00",
  },
  {
    title: "Top 10 Sci-Fi Movies of the Decade",
    author: "Cinephile Central",
    tag: "Cinema",
    views: "1.5M",
    time: "5 months ago",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=600",
    description: "Exploring the best science fiction films from the last 10 years.",
    duration: "07:20",
  },
  {
    title: "Deep Sea Ecosystems",
    author: "Nature Documentaries",
    tag: "Science",
    views: "4.2M",
    time: "1 year ago",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnail: "https://picsum.photos/seed/deepsea/600/400",
    description: "Discovering strange and wonderful creatures at the bottom of the ocean.",
    duration: "11:11",
  },
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas: Full Parity Mode");

    await Promise.all([
      Video.deleteMany({}),
      User.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const demoUser = await User.create({
      name: "Nexus Guardian",
      email: "guardian@nexus.com",
      password: "password123",
      username: "guardian",
      profile: {
        bio: "Overseer of the Nexus Signal Stream.",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
      }
    });

    const insertedVideos = await Video.insertMany(sampleVideos);

    await Comment.create({
      video: insertedVideos[0]._id,
      user: demoUser._id,
      text: "Neural frequency established. Full 8-signal spectrum active."
    });

    await Notification.create({
      user: demoUser._id,
      text: "Cloud parity achieved. All 8 transmissions are online."
    });

    console.log("SUCCESS: FULL SYSTEM SEED (8 VIDEOS) COMPLETE!");
    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("FAILURE:", err.message);
    process.exit(1);
  }
}

seedDB();
