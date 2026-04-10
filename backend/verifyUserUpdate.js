const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function verify() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/videostreaming";
    await mongoose.connect(mongoUri);
    
    // Check first user to see if schema update is reflected
    const user = await User.findOne();
    if (user) {
      console.log(`User: ${user.username}`);
      console.log(`Profile:`, user.profile);
      if ('bannerUrl' in user.profile) {
        console.log("SUCCESS: bannerUrl field exists in profile.");
      } else {
        console.log("FAILURE: bannerUrl field missing.");
      }
    } else {
      console.log("No users found to verify.");
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
