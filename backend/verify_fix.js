const mongoose = require('mongoose');
require('dotenv').config();
const Video = require('./models/Video');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/videostreaming';

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    const video = await Video.findOne({ title: /Advanced Family - Episode 17/i });
    if (video) {
        console.log(`FOUND: ${video.title}`);
        console.log(`URL: ${video.url}`);
    } else {
        console.log('Video not found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
verify();
