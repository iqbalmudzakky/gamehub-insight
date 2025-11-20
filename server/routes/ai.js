const express = require("express");
const router = express.Router();
const AiController = require("../controllers/aiController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

// All routes in AI require authentication.
router.use(authenticateToken);

// GET personalized game recommendations based on user favorites
router.get("/recommend", asyncHandler(AiController.recommendGame));

// GET AI history
router.get("/history", asyncHandler(AiController.getAiHistory));

// DELETE AI request from history
router.delete("/history/:id", asyncHandler(AiController.deleteAiRequest));

module.exports = router;
