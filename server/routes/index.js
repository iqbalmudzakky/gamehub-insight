const express = require("express");

const router = express.Router();
const authRoutes = require("./auth");
const gameRoutes = require("./game");
const favoriteRoutes = require("./favorite");
const aiRoutes = require("./ai");

router.use("/auth", authRoutes);

// Game routes need authentication
router.use("/games", gameRoutes);

// AI routes need authentication
router.use("/ai", aiRoutes);

// Favorite routes need authentication & authorization
router.use("/favorites", favoriteRoutes);

module.exports = router;
