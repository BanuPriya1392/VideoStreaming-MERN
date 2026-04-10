const Video = require("../models/Video");

// Use standard @google/generative-ai
let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require("@google/generative-ai").GoogleGenerativeAI;
} catch (error) {
  GoogleGenerativeAI = null;
}

const categories = [
  "AI",
  "Music",
  "Gaming",
  "Live",
  "Tech",
  "Education",
  "Cinema",
  "Science",
  "Lifestyle",
  "Family",
  "Sports",
  "Vlog",
  "Other",
];

const keywordMap = {
  "AI": ["ai", "artificial intelligence", "machine learning", "neural", "deep learning", "gemini", "gpt", "robot", "llm", "algorithm", "data", "generative"],
  "Music": ["music", "song", "lo-fi", "chill", "beats", "audio", "track", "album", "concert", "singer", "pop", "hip hop", "instrumental", "bass"],
  "Gaming": ["gaming", "game", "playthrough", "cyberpunk", "fps", "rpg", "mmo", "twitch", "stream", "nintendo", "xbox", "playstation", "gameplay", "walkthrough", "online", "multiplayer"],
  "Live": ["live", "broadcast", "premiere", "recording", "live stream", "vod"],
  "Tech": ["tech", "coding", "software", "hardware", "programming", "react", "node", "javascript", "app", "web", "computer", "developer", "framework", "tutorial", "code", "python"],
  "Education": ["education", "tutorial", "learn", "how to", "guide", "course", "basics", "explained", "class", "study", "math", "history", "lesson", "tips", "tricks", "masterclass"],
  "Cinema": ["cinema", "movie", "film", "sci-fi", "masterpiece", "director", "actor", "trailer", "hollywood", "netflix", "documentary", "short"],
  "Science": ["science", "space", "ocean", "biology", "physics", "nature", "ecosystem", "quantum", "chemistry", "rocket", "planet", "astronomy", "animals", "discovery"],
  "Lifestyle": ["lifestyle", "fashion", "routine", "day in the life", "healthy", "morning", "night", "travel", "beauty", "aesthetic"],
  "Family": ["family", "kids", "child", "children", "baby", "playing", "play time", "san", "outdoor", "outside", "parent", "mom", "dad", "toddler", "toys", "christmas", "celebration"],
  "Sports": ["sports", "football", "basketball", "soccer", "tennis", "athletic", "gym", "workout", "fitness", "run", "training"],
  "Vlog": ["vlog", "blog", "daily", "diary", "update", "life", "chat", "talking", "story", "storytime"]
};

function generateHashtags(title, description, bestTag) {
  const stopWords = new Set(["a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "from", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "vs", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "my", "your", "his", "her", "its", "their", "our", "you", "me", "we", "they", "this", "that", "these", "those"]);
  
  const combined = `${title || ""} ${description || ""}`.toLowerCase();
  const words = combined
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  const tags = new Set();
  
  // Always include the best category tag (keep original casing for enum compatibility)
  if (bestTag) tags.add(bestTag);
  
  // Add matched keywords from keywordMap
  for (const [tag, keywords] of Object.entries(keywordMap)) {
    for (const kw of keywords) {
      if (combined.includes(kw.toLowerCase())) {
        tags.add(kw.toUpperCase().replace(/\s+/g, ""));
      }
    }
  }
  
  // Add significant words from title/description
  words.forEach(word => {
    if (tags.size < 12) {
      tags.add(word.toUpperCase());
    }
  });

  // Fallback if none found
  if (tags.size === 0) {
    tags.add("NEXUS");
    tags.add("STREAM");
  }
  
  return Array.from(tags).slice(0, 10);
}

async function autoTagVideo(req, res, next) {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    if (!GoogleGenerativeAI || !process.env.GEMINI_API_KEY) {
      console.warn("Gemini AI not configured, using fallback matcher.");
      return fallbackTagVideo(req, res, next);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      As a video metadata expert for 'Nexus' (a high-end futuristic video streaming platform), your task is to analyze the following title and description to generate:
      1. A single best category from this list: ${categories.join(", ")}.
      2. Ten relevant tags/hashtags (concise, uppercase, alphanumeric only).
      3. A professional, catchy description if the PROVIDED description is short or missing.
      
      Input Title: "${title}"
      Input Description: "${description || ""}"
      
      Output your response ONLY as a JSON object with this exact structure:
      {
        "tag": "CategoryName",
        "hashtags": ["TAG1", "TAG2", ...],
        "suggestedDescription": "Generated description here"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(responseText);

    return res.status(200).json({
      success: true,
      tag: parsed.tag || "Other",
      hashtags: parsed.hashtags || [],
      description: parsed.suggestedDescription || description || ""
    });
  } catch (err) {
    console.error("Gemini AI failed, using fallback:", err.message);
    return fallbackTagVideo(req, res, next);
  }
}

async function fallbackTagVideo(req, res, next) {
  try {
    const { title, description } = req.body;
    const combinedContent = `${title || ""} ${description || ""}`.toLowerCase();
    
    let bestTag = "Other";
    let maxMatches = 0;
    
    for (const [tag, keywords] of Object.entries(keywordMap)) {
      let matches = 0;
      for (const kw of keywords) {
        if (combinedContent.includes(kw)) {
          matches++;
        }
      }
      if (matches > maxMatches) {
        maxMatches = matches;
        bestTag = tag;
      }
    }

    const hashtags = generateHashtags(title, description, bestTag);
    return res.status(200).json({ success: true, tag: bestTag, hashtags: hashtags, description: description });
  } catch (err) {
    return next(err);
  }
}

async function getAIRecommendations(req, res, next) {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      return res
        .status(400)
        .json({ success: false, message: "videoId is required" });
    }
    const video = await Video.findById(videoId);
    if (!video)
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });

    const related = await Video.find({
      _id: { $ne: video._id },
      tag: video.tag,
    })
      .sort({ likes: -1, views: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({ success: true, data: related });
  } catch (err) {
    return next(err);
  }
}

module.exports = { autoTagVideo, getAIRecommendations };
