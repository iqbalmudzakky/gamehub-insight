const express = require("express");
const router = express.Router();
const GameController = require("../controllers/gameController");
const { asyncHandler } = require("../middleware/errorHandler");

// GET search games (harus sebelum :id route untuk menghindari conflict)
// router.get("/search", asyncHandler(GameController.searchGames));

// GET all games (tanpa pagination - untuk infinite scroll)
router.get("/", asyncHandler(GameController.getAllGames));

// GET detail game by database ID
router.get("/:id", asyncHandler(GameController.getGameById));

module.exports = router;
