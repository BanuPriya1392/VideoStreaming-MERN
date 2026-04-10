const mongoose = require("mongoose");
require("dotenv").config();

const uri = "mongodb+srv://banu:banu123@cluster0.wxt9pun.mongodb.net/videostreaming?retryWrites=true&w=majority&appName=Cluster0";

async function test() {
  try {
    console.log("Testing connection to FIRST Atlas cluster...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("SUCCESS: Connected to FIRST Atlas cluster!");
    process.exit(0);
  } catch (err) {
    console.error("FAILURE:", err.message);
    process.exit(1);
  }
}
test();
