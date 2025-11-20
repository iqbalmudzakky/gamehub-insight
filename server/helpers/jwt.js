const jwt = require("jsonwebtoken");

// Secret key untuk JWT (sebaiknya disimpan di environment variable)
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generate JWT token untuk user
 * @param {Object} payload - Data yang akan di-encode dalam token
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token yang akan diverifikasi
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
