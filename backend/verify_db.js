const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/videostreaming';

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    const Video = require('./models/Video');
    const brokenIds = ['WjwwKHOAs1M', 'Z4C82eyhwxc', '1oQ_tNnO3cM'];
    const count = await Video.countDocuments({ url: { $regex: brokenIds.join('|') } });
    console.log(`REMAINING_BROKEN: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verify();
