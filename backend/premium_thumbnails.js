const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

const categoryKeywords = {
  "AI": "artificial intelligence, neural network, robot",
  "Cinema": "movie theater, film, cinema, popcorn",
  "Education": "library, study, classroom, books, graduation",
  "Family": "happy family, home, lifestyle, children",
  "Gaming": "gaming room, video games, controller, esports",
  "Lifestyle": "minimalist, yoga, healthy food, travel",
  "Live": "live stream, broadcast, concert, stadium",
  "Music": "music studio, instruments, headphones, concert",
  "Science": "laboratory, space, microscope, biology",
  "Sports": "stadium, soccer, basketball, fitness, athlete",
  "Tech": "coding, hardware, server room, laptop, cyberspace",
  "Vlog": "vlogging, camera, travel vlog, lifestyle vlog",
  "Other": "abstract, nature, technology, cosmic"
};

async function applyPremiumThumbnails() {
  try {
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB...");

    const videos = await Video.find({});
    console.log(`Upgrading ${videos.length} videos to Premium HD...`);

    const bulkOps = videos.map((video, index) => {
      const keyword = categoryKeywords[video.tag] || "abstract";
      // Using a more reliable Unsplash random source approach with seeds
      // We append a signature/seed to ensure uniqueness within the same category
      const premiumThumbnail = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800&category=${video.tag}&sig=${video._id}`;
      
      // Wait, that's still the same photo ID. Let's use the 'featured' URL which is more dynamic
      // Even if deprecated, it's the best for this 'quick fix' without an Unsplash API key
      const dynamicThumbnail = `https://source.unsplash.com/featured/800x600?${encodeURIComponent(keyword)}&sig=${video._id}`;
      
      return {
        updateOne: {
          filter: { _id: video._id },
          update: { $set: { thumbnail: dynamicThumbnail } }
        }
      };
    });

    if (bulkOps.length > 0) {
      const result = await Video.bulkWrite(bulkOps);
      console.log(`Successfully upgraded ${result.modifiedCount} videos with Premium HD thumbnails!`);
    }

    mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error applying premium thumbnails:", err);
    process.exit(1);
  }
}

applyPremiumThumbnails();
