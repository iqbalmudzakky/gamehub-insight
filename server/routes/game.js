const express = require("express");
const router = express.Router();
const GameController = require("../controllers/gameController");
const { asyncHandler } = require("../middleware/errorHandler");
const authenticateToken = require("../middleware/authenticateToken");

// All routes in games require authentication.
router.use(authenticateToken);

// GET all games (tanpa pagination - untuk infinite scroll)
router.get("/", asyncHandler(GameController.getAllGames));

// GET detail game by database ID
router.get("/:id", asyncHandler(GameController.getGameById));

// PUT edit detail game by database ID
router.put("/:id", asyncHandler(GameController.editGameById));

module.exports = router;
