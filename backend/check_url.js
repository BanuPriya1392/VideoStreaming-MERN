const mongoose = require("mongoose");
require("dotenv").config();
const Video = require("./models/Video");

async function checkUrls() {
  await mongoose.connect(process.env.MONGO_URI);
  const video = await Video.findOne({});
  console.log("Current Thumbnail URL Example:", video.thumbnail);
  mongoose.disconnect();
}
checkUrls();
