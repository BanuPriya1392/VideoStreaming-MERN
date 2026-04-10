const express = require("express");
const router = express.Router();
const Video = require("../models/Video");

const colors = {
  "AI": ["#00F0FF", "#0055FF"],
  "Cinema": ["#E50914", "#8000FF"],
  "Education": ["#00FF88", "#0088FF"],
  "Family": ["#FF8800", "#FF0055"],
  "Gaming": ["#7000FF", "#FF00FF"],
  "Lifestyle": ["#FF00AA", "#FF8800"],
  "Live": ["#FF2A00", "#AA0000"],
  "Music": ["#8800FF", "#0000FF"],
  "Science": ["#00FFAA", "#00AAFF"],
  "Sports": ["#FF5500", "#CC0000"],
  "Tech": ["#0033FF", "#00FFFF"],
  "Vlog": ["#FFCC00", "#FF5500"],
  "Other": ["#222222", "#000000"]
};

function splitText(text, limit) {
  if (text.length <= limit) return [text, ""];
  const splitIndex = text.lastIndexOf(" ", limit);
  if (splitIndex === -1) {
    return [text.substring(0, limit), text.substring(limit)];
  }
  return [text.substring(0, splitIndex), text.substring(splitIndex + 1)];
}

router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).lean();
    if (!video) {
        return res.status(404).send("Not Found");
    }

    const tag = video.tag || "Other";
    const title = video.title || "Nexus Transmission";
    const [color1, color2] = colors[tag] || colors["Other"];
    
    // Abstract geometric positions based on ID
    const hash1 = video._id.toString().charCodeAt(0) * 10;
    const hash2 = video._id.toString().charCodeAt(1) * 10;

    const [line1, line2] = splitText(title, 35);
    const titleY1 = line2 ? 310 : 330;
    const titleY2 = line2 ? 370 : 0;

    const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
        <linearGradient id="overlay" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0A0E1A" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#0D1223" stop-opacity="0.2"/>
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="800" height="600" fill="url(#bg)" />
      <rect width="800" height="600" fill="url(#overlay)" />
      <rect width="800" height="600" fill="url(#grid)" />
      
      <!-- Geometric Abstract Ornaments -->
      <circle cx="${600 + hash1}" cy="${100 + hash2}" r="250" fill="rgba(255,255,255,0.03)" />
      <circle cx="${100 + hash2}" cy="${500 - hash1}" r="350" fill="rgba(0,0,0,0.15)" />
      
      <polygon points="0,600 ${400 + hash1},600 ${200 + hash2},300" fill="rgba(0,0,0,0.2)" />
      
      <!-- Center Plaque -->
      <rect x="40" y="${line2 ? 200 : 220}" width="720" height="${line2 ? 220 : 180}" fill="rgba(10,14,26,0.8)" rx="24" stroke="rgba(255,255,255,0.1)" stroke-width="2" />
      
      <!-- Category/Tag -->
      <text x="400" y="${line2 ? 255 : 270}" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="900" fill="${color1}" text-anchor="middle" letter-spacing="6" filter="url(#glow)">
        NEXUS // ${tag.toUpperCase()}
      </text>
      
      <!-- Title -->
      <text x="400" y="${titleY1}" font-family="'Inter', system-ui, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle">
        ${line1}
      </text>
      ${line2 ? `
      <text x="400" y="${titleY2}" font-family="'Inter', system-ui, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle">
        ${line2}
      </text>
      ` : ""}
      
      <!-- Badge -->
      <rect x="330" y="480" width="140" height="40" fill="rgba(0,0,0,0.5)" rx="20" stroke="${color1}" stroke-width="1" />
      <circle cx="360" cy="500" r="6" fill="${color1}" filter="url(#glow)" />
      <text x="380" y="506" font-family="'Inter', system-ui, sans-serif" font-size="14" font-weight="bold" fill="#CCCCCC" letter-spacing="2">
        HD 4K
      </text>
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Standard aggressive caching
    res.send(svg.trim());
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating thumbnail");
  }
});

module.exports = router;
