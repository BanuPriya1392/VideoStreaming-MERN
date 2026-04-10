const mongoose = require("mongoose");
require("dotenv").config();

async function test() {
  try {
    console.log("Testing connection to:", process.env.MONGO_URI.split("@")[1]);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("SUCCESS: Connected to Atlas!");
    process.exit(0);
  } catch (err) {
    console.error("FAILURE:", err.message);
    if (err.message.includes("is not allowed to access from this IP address")) {
        console.log("HINT: You need to whitelist your IP in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access From Anywhere).");
    }
    process.exit(1);
  }
}
test();
