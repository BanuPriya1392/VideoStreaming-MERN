const express = require("express");
const router = express.Router();

const {
  autoTagVideo,
  getAIRecommendations,
} = require("../controllers/ai.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/tag", protect, autoTagVideo);
router.post("/recommendations", protect, getAIRecommendations);

module.exports = router;
