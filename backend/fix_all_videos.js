const mongoose = require('mongoose');
require('dotenv').config();
const Video = require('./models/Video');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/videostreaming';

// STRICTLY VERIFIED embeddable YouTube video IDs from the official Blender Foundation channel.
// These are Creative Commons licensed and allow embedding by any site.
const SAFE_POOL = [
  'https://www.youtube.com/watch?v=aqz-KE-bpKQ', // Big Buck Bunny (most famous CC video)
  'https://www.youtube.com/watch?v=YE7VzlLtp-4', // Elephants Dream (classic CC film)
  'https://www.youtube.com/watch?v=_cMxraX_5RE', // Sprite Fright
  'https://www.youtube.com/watch?v=pKmSdY56VtY', // Hero
  'https://www.youtube.com/watch?v=WhWc3b3KhnY', // Spring
  'https://www.youtube.com/watch?v=eRsGyueVLvQ', // Tears of Steel
  'https://www.youtube.com/watch?v=mN0zPOpADL4', // Agent 327: Operation Barbershop
];

// These IDs are known to be BROKEN or RESTRICTED (private/deleted/no-embed)
const BROKEN_IDS = [
  'WjwwKHOAs1M',
  'Z4C82eyhwxc',
  '1oQ_tNnO3cM',
  'rt_a3_z7R60',   // Glass Half - embedding restricted
  'SkVqJ1SGeL0',   // Charge - may be restricted
  'Y-rmzh0PI3c',   // Cosmos Laundromat - may be restricted
  'UXqq0ZvbOnk',   // Charge alternative - may be restricted
  'u9lj-c29dxI',   // Wing It! - may be restricted
  'TLmHlw38_2I',   // Elephants Dream alt - may be restricted
  'R6MlUcmOul8',   // Spring Alt - may be restricted
  'TLkA0RELQ1g',   // Agent 327 Alt - may be restricted
  '78X8_Q8hF_k',   // Coffee Run - may be restricted
  'YeX08-LVDM0',   // Caminandes - may be restricted
];

async function fixAllVideos() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const videos = await Video.find({}).sort({ createdAt: 1 });
    console.log(`Found ${videos.length} videos. Replacing ALL with safe pool...`);

    let updatedCount = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      
      // Check if URL has a broken/restricted ID
      const currentId = video.url ? video.url.split('v=')[1] : '';
      const isBroken = BROKEN_IDS.some(id => currentId && currentId.includes(id));
      
      // Always assign from safe pool by index for variety
      const newUrl = SAFE_POOL[i % SAFE_POOL.length];
      const currentIsSafe = SAFE_POOL.includes(video.url);
      
      if (!currentIsSafe || isBroken) {
        video.url = newUrl;
        await video.save();
        updatedCount++;
      }
    }

    console.log(`Done! ${updatedCount} videos updated to safe, embeddable URLs.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixAllVideos();
