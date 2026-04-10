const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/videostreaming';

const pool = [
  'https://www.youtube.com/watch?v=pKmSdY56VtY', // Hero
  'https://www.youtube.com/watch?v=Y-rmzh0PI3c', // Cosmos Laundromat
  'https://www.youtube.com/watch?v=SkVqJ1SGeL0', // Essential Sports / Charge?
  'https://www.youtube.com/watch?v=UXqq0ZvbOnk', // Charge
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ', // Big Buck Bunny
  'https://www.youtube.com/watch?v=eRsGyueVLvQ', // Tears of Steel
  'https://www.youtube.com/watch?v=WhWc3b3KhnY', // Spring
  'https://www.youtube.com/watch?v=78X8_Q8hF_k', // Coffee Run
  'https://www.youtube.com/watch?v=_cMxraX_5RE', // Sprite Fright
  'https://www.youtube.com/watch?v=u9lj-c29dxI', // Wing It!
  'https://www.youtube.com/watch?v=TLmHlw38_2I', // Elephants Dream
  'https://www.youtube.com/watch?v=mN0zPOpADL4', // Agent 327
  'https://www.youtube.com/watch?v=R6MlUcmOul8', // Spring Alt
  'https://www.youtube.com/watch?v=TLkA0RELQ1g'  // Agent 327 Alt
];

const brokenIds = ['WjwwKHOAs1M', 'Z4C82eyhwxc', '1oQ_tNnO3cM'];

async function fixVideos() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const Video = require('./models/Video');
    const videos = await Video.find({}).sort({ createdAt: 1 });

    console.log(`Found ${videos.length} videos. Updating URLs...`);

    let updatedCount = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const newUrl = pool[i % pool.length];
      
      // Update ALL videos to the pool to ensure variety and fix broken ones
      video.url = newUrl;
      await video.save();
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} videos.`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating videos:', err);
    process.exit(1);
  }
}

fixVideos();
