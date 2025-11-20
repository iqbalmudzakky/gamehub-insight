const { verifyToken } = require("../helpers/jwt");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Get token from "Bearer <token>"

    if (!token) {
      const error = new Error("Token is required.");
      error.status = 401;
      throw error;
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      err.message = "Token is invalid or has expired.";
      err.status = 403;
    }
    next(err);
  }
};

module.exports = authenticateToken;
