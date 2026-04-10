const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const Video = require("./models/Video");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateMissingCaptions() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI missing. Ensure backend/.env exists.");
    
    await mongoose.connect(mongoUri);
    console.log("Connected to Nexus Database...");

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from .env");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Find videos without description or with very short description
    const videos = await Video.find({ 
      $or: [
        { description: { $exists: false } },
        { description: "" },
        { description: { $eq: "Nexus transmission data pending. Standard operative feed initiated." } },
        { description: /^.{0,20}$/ }
      ] 
    });

    console.log(`Found ${videos.length} transmissions needing signal stabilization (captions)...`);

    for (const v of videos) {
      console.log(`Analyzing: ${v.title}`);
      
      const prompt = `
        As an AI signal analyst for 'Nexus' (futuristic video streaming), analyze this video title: "${v.title}" (Category: ${v.tag}). 
        Generate a professional, catchy description (max 200 chars).
        Respond ONLY with the description text.
      `;

      try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        // Clean up any potential markdown or garbage
        text = text.replace(/[*#]/g, "").trim();

        if (text) {
          v.description = text;
          await v.save();
          console.log(`SUCCESS: Captions generated for "${v.title}"`);
        }
      } catch (err) {
        console.error(`FAILED: Could not process "${v.title}": ${err.message}`);
      }
    }

    console.log("\nSIGNAL STABILIZATION COMPLETE.");
    mongoose.disconnect();
  } catch (err) {
    console.error("CRITICAL SIGNAL FAILURE:", err.message);
    process.exit(1);
  }
}

generateMissingCaptions();
