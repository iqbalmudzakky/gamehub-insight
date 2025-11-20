const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const authenticateToken = require("../middleware/authenticateToken");
const { asyncHandler } = require("../middleware/errorHandler");

// Public Routes
router.post("/google", asyncHandler(AuthController.googleLogin));
router.post("/login", asyncHandler(AuthController.login));
router.post("/register", asyncHandler(AuthController.register));

// Private Routes (requires authentication)
router.get(
  "/profile",
  authenticateToken,
  asyncHandler(AuthController.getProfile)
);
router.post("/logout", authenticateToken, asyncHandler(AuthController.logout));

module.exports = router;
