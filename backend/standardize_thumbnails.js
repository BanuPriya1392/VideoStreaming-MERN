const mongoose = require('mongoose');
const Video = require('./models/Video');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');
    
    // Update 1: Quik Log - Episode 5
    // Using a premium Unsplash URL: Cyberpunk city / Vlog style
    const res1 = await Video.updateOne(
      { title: "Quik Log - Episode 5" },
      { 
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600"
      }
    );
    console.log('Update 1:', res1);

    // Update 2: The Secret of Other - Episode 4
    // Using a premium Unsplash URL: Mysterious discovery / Artifact
    const res2 = await Video.updateOne(
      { title: "The Secret of Other - Episode 4" },
      { 
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600"
      }
    );
    console.log('Update 2:', res2);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
run();
