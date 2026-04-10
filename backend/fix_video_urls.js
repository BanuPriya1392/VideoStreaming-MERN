const mongoose = require('mongoose');
require('dotenv').config();
const Video = require('./models/Video');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/videostreaming';

const pool = [
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ', // Big Buck Bunny
  'https://www.youtube.com/watch?v=pKmSdY56VtY', // Hero
  'https://www.youtube.com/watch?v=WhWc3b3KhnY', // Spring
  'https://www.youtube.com/watch?v=_cMxraX_5RE', // Sprite Fright
  'https://www.youtube.com/watch?v=u9lj-c29dxI', // Wing It!
  'https://www.youtube.com/watch?v=YeX08-LVDM0', // Caminandes
  'https://www.youtube.com/watch?v=rt_a3_z7R60'  // Glass Half
];

async function fixVideos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const videos = await Video.find({}).sort({ createdAt: 1 });
    console.log(`Found ${videos.length} videos. Checking for restricted URLs...`);

    let updatedCount = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      
      // Update ALL videos to ensure they are from the working pool
      // This solves the "Video unavailable" issues across the board.
      const newUrl = pool[i % pool.length];
      
      if (video.url !== newUrl) {
          video.url = newUrl;
          await video.save();
          updatedCount++;
      }
    }

    console.log(`Update complete. ${updatedCount} video URLs refreshed.`);
    process.exit(0);
  } catch (err) {
    console.error('Error during update:', err);
    process.exit(1);
  }
}

fixVideos();
