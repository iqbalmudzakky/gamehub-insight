const { Favorite, Game, User } = require("../models");

class FavoriteController {
  /**
   * @route GET /favorites
   * @desc Fetch all favorite games of the currently logged-in user.
   * @access Private (requires authentication)
   */
  static async getUserFavorites(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error("User not authenticated.");
        error.status = 401;
        throw error;
      }

      const favorites = await Favorite.findAll({
        where: { UserId: req.user.id },
        include: [
          {
            model: Game,
            attributes: [
              "id",
              "title",
              "genre",
              "platform",
              "publisher",
              "thumbnail",
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        message: "User’s favorite list successfully retrieved.",
        data: favorites,
        total: favorites.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route POST /favorites/:gameId
   * @desc Add game to the user’s favorite list.
   * @access Private (requires authentication)
   */
  static async addFavorite(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error("User not authenticated.");
        error.status = 401;
        throw error;
      }

      const { gameId } = req.params;

      // Validate game exists
      const game = await Game.findByPk(gameId);
      if (!game) {
        const error = new Error("Game not found.");
        error.status = 404;
        throw error;
      }

      // Check if already favorited
      const existingFavorite = await Favorite.findOne({
        where: { UserId: req.user.id, GameId: gameId },
      });

      if (existingFavorite) {
        const error = new Error("Game already exists in the favorite list.");
        error.status = 400;
        throw error;
      }

      // Add to favorites
      const favorite = await Favorite.create({
        UserId: req.user.id,
        GameId: gameId,
      });

      return res.status(201).json({
        success: true,
        message: "Game successfully added to favorites.",
        data: favorite,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route DELETE /favorites/:gameId
   * @desc Remove game from the user’s favorite list.
   * @access Private (requires authentication & authorization)
   */
  static async removeFavorite(req, res, next) {
    try {
      if (!req.user) {
        const error = new Error("User not authenticated.");
        error.status = 401;
        throw error;
      }

      const { gameId } = req.params;

      // Find favorite
      const favorite = await Favorite.findOne({
        where: { UserId: req.user.id, GameId: gameId },
      });

      if (!favorite) {
        const error = new Error("Favorite not found.");
        error.status = 404;
        throw error;
      }

      // Remove favorite
      await favorite.destroy();

      return res.status(200).json({
        success: true,
        message: "Game successfully removed from favorites.",
        data: {
          GameId: gameId,
          UserId: req.user.id,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = FavoriteController;
