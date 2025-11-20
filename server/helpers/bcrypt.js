const bcrypt = require("bcryptjs");

/**
 * Hash password menggunakan bcrypt
 * @param {String} password - Password plain text yang akan di-hash
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare password dengan hash
 * @param {String} password - Password plain text
 * @param {String} hashedPassword - Hashed password dari database
 * @returns {Promise<Boolean>} True jika password cocok, false jika tidak
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
