const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

async function verify() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/videostreaming";
    await mongoose.connect(mongoUri);
    const count = await Video.countDocuments();
    const categories = await Video.distinct("tag");
    
    console.log(`Total Videos: ${count}`);
    console.log(`Categories found: ${categories.length}`);
    
    for (const tag of categories) {
      const tagCount = await Video.countDocuments({ tag });
      console.log(` - ${tag}: ${tagCount} videos`);
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
