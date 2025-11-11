const { Game, Favorite, User } = require("../models");
const { Op } = require("sequelize");

class GameController {
  /**
   * @route GET /games
   * @desc Fetch all games from the local database.
   * @access Public
   */
  static async getAllGames(req, res, next) {
    try {
      const games = await Game.findAll({
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Games successfully retrieved.",
        data: games,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /games/:id
   * @desc Fetch game details by database ID.
   * @access Public
   */
  static async getGameById(req, res, next) {
    try {
      const { id } = req.params;

      // Search by database ID only.
      const game = await Game.findByPk(id);

      if (!game) {
        const error = new Error("Game not found.");
        error.status = 404;
        throw error;
      }

      return res.status(200).json({
        success: true,
        message: "Game details successfully retrieved.",
        data: game,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /games/search
   * @desc Cari game berdasarkan genre, platform, atau keyword
   * @access Public
   */
  static async searchGames(req, res, next) {
    try {
      const { genre, platform, keyword } = req.query;
      const where = {};

      if (genre) {
        where.genre = {
          [Op.iLike]: `%${genre}%`,
        };
      }

      if (platform) {
        where.platform = {
          [Op.iLike]: `%${platform}%`,
        };
      }

      if (keyword) {
        where.title = {
          [Op.iLike]: `%${keyword}%`,
        };
      }

      const games = await Game.findAll({
        where: Object.keys(where).length > 0 ? where : {},
        order: [["id", "ASC"]],
      });

      return res.status(200).json({
        success: true,
        message: "Game search results.",
        data: games,
        total: games.length,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GameController;
