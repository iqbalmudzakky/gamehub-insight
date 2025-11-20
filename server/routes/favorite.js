const express = require("express");
const router = express.Router();
const FavoriteController = require("../controllers/favoriteController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

// All routes in favorites require authentication.
router.use(authenticateToken);

// GET user favorites
router.get("/", asyncHandler(FavoriteController.getUserFavorites));

// POST add favorite
router.post("/:gameId", asyncHandler(FavoriteController.addFavorite));

// DELETE remove favorite
router.delete("/:gameId", asyncHandler(FavoriteController.removeFavorite));

module.exports = router;
