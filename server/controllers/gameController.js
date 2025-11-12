const { Game, Favorite, User } = require("../models");
const { Op } = require("sequelize");

class GameController {
  /**
   * @route GET /games
   * @desc Fetch all games from the local database with pagination support.
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 12)
   * @query genre - Filter by genre
   * @query q - Search by title
   * @access Public
   */
  static async getAllGames(req, res, next) {
    try {
      const { genre, q, page = 1, limit = 12 } = req.query;
      const where = {};

      if (genre) where.genre = genre;
      if (q) where.title = { [Op.iLike]: `%${q}%` };

      // Calculate offset for pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const offset = (pageNum - 1) * limitNum;

      // Fetch games with pagination
      const { count, rows: games } = await Game.findAndCountAll({
        where,
        order: [["id", "ASC"]],
        limit: limitNum,
        offset: offset,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;

      return res.status(200).json({
        success: true,
        message: "Games successfully retrieved.",
        data: games,
        pagination: {
          currentPage: pageNum,
          totalPages: totalPages,
          totalItems: count,
          itemsPerPage: limitNum,
          hasNextPage: hasNextPage,
        },
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
}

module.exports = GameController;
