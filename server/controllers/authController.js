const { User } = require("../models");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { generateToken } = require("../helpers/jwt");

/**
 * AuthController - Mengelola semua operasi autentikasi
 */
class AuthController {
  /**
   * @route POST /auth/register
   * @desc Register user baru dengan email & password
   * @access Public
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, passwordConfirm } = req.body;

      // Validasi input
      if (!name || !email || !password || !passwordConfirm) {
        const error = new Error("All fields must be filled.");
        error.status = 400;
        throw error;
      }

      if (password !== passwordConfirm) {
        const error = new Error(
          "Password and confirmation password do not match"
        );
        error.status = 400;
        throw error;
      }

      // Cek apakah email sudah terdaftar
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        const error = new Error("Email is already registered");
        error.status = 400;
        throw error;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Buat user baru
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        GoogleId: null,
      });

      // Generate JWT token
      const token = generateToken({ id: user.id, email: user.email });

      return res.status(201).json({
        success: true,
        message: "Registration successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /auth/login
   * @desc Login user dengan email & password
   * @access Public
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validasi input
      if (!email || !password) {
        const error = new Error("Email and password are required");
        error.status = 400;
        throw error;
      }

      // Cari user berdasarkan email
      const user = await User.findOne({ where: { email } });

      if (!user || !user.password) {
        const error = new Error("Email or password is incorrect");
        error.status = 401;
        throw error;
      }

      // Cek password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        const error = new Error("Email or password is incorrect");
        error.status = 401;
        throw error;
      }

      // Generate JWT token
      const token = generateToken({ id: user.id, email: user.email });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /auth/profile
   * @desc Ambil profil user yang sedang login
   * @access Private (requires token)
   */
  static async getProfile(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error(
          "Token is invalid or user is not authenticated"
        );
        error.status = 401;
        throw error;
      }

      const user = await User.findByPk(req.user.id);

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "User profile retrieved successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /auth/logout
   * @desc Logout user (remove session/token from client)
   * @access Private (requires token)
   */
  static async logout(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: "Logout successful. Please remove the token from the client.",
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
