const { AiRequest, User, Favorite, Game } = require("../models");
const generateContent = require("../helpers/gemini");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * AiController - Manages all AI recommendation operations
 */
class AiController {
  /**
   * @private
   * @desc Helper method to generate AI recommendations
   * @param {number} userId - The ID of the user
   * @returns {Promise<Object>} - Generated recommendation data
   */
  static async _generateRecommendation(userId) {
    if (!GEMINI_API_KEY) {
      const error = new Error("Gemini API key is not configured");
      error.status = 500;
      throw error;
    }

    // Fetch all data games
    const games = await Game.findAll({
      attributes: ["id", "title"],
    });

    // Fetch user's favorite games with details
    const favorites = await Favorite.findAll({
      where: { UserId: userId },
      include: [
        {
          model: Game,
          attributes: ["title"],
        },
      ],
      limit: 10, // Limit to last 10 favorites for better context
      order: [["createdAt", "DESC"]],
    });

    let prompt;

    if (favorites.length === 0) {
      prompt = `The user has no favorite games. Please recommend 3-5 popular games from the following list: 
      [[id, title]]
      ${JSON.stringify(games.map((game) => [game.id, game.title]))}
      Return the result only as a JSON array of game IDs (numbers) — without any text, explanation, or extra formatting.
      `;
    } else {
      // Build prompt based on user's favorite games
      const favoriteGames = favorites.map((fav) => {
        const game = fav.Game;
        return game.title;
      });
      prompt = `Based on the user's favorite games: ${favoriteGames.join(
        ", "
      )}. Provide 3–5 game recommendations. Use the following game data as your reference when generating recommendations: 
      [[id, title]]
      ${games.map((game) => `[${game.id}, "${game.title}"]`).join(", ")}
      Return the result only as a JSON array of game IDs (numbers) — without any text, explanation, or extra formatting.
      `;
    }

    // Generate recommendation from Gemini AI
    const aiResponse = await generateContent(prompt);

    // Parse the response to extract game IDs
    let gameIds = [];
    try {
      // Try to parse JSON response
      const cleanedResponse = aiResponse
        .trim()
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
      gameIds = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      const error = new Error("Failed to parse AI response. Please try again.");
      error.status = 500;
      throw error;
    }

    // Validate that we got an array of numbers
    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      const error = new Error("Invalid recommendation format from AI");
      error.status = 500;
      throw error;
    }

    // Save request to database
    const aiRequest = await AiRequest.create({
      UserId: userId,
      prompt: `Auto-generated based on ${favorites.length} favorite games`,
      response: JSON.stringify(gameIds),
    });

    // Fetch the recommended games details
    const recommendedGames = await Game.findAll({
      where: {
        id: gameIds,
      },
      attributes: [
        "id",
        "title",
        "genre",
        "platform",
        "publisher",
        "thumbnail",
      ],
    });

    return {
      aiRequest,
      recommendedGames,
      gameIds,
      basedOnFavorites: favorites.length,
    };
  }

  /**
   * @route GET /ai/recommend
   * @desc Get personalized game recommendations based on user's favorite games
   * @access Private (requires authentication)
   */
  static async recommendGame(req, res, next) {
    try {
      // if (!req.user) {
      //   const error = new Error("User is not authenticated");
      //   error.status = 401;
      //   throw error;
      // }

      try {
        const result = await AiController._generateRecommendation(req.user.id);

        return res.status(200).json({
          success: true,
          message: "Game recommendations retrieved successfully",
          data: {
            id: result.aiRequest.id,
            recommendations: result.recommendedGames,
            gameIds: result.gameIds,
            basedOnFavorites: result.basedOnFavorites,
            createdAt: result.aiRequest.createdAt,
          },
        });
      } catch (apiError) {
        console.error("Gemini API Error:", apiError);
        const error = new Error(
          apiError.message || "Failed to get recommendations from Gemini API"
        );
        error.status = apiError.status || 500;
        throw error;
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route GET /ai/history
   * @desc View all AI request history for the current user
   *       If no history exists, automatically generates a new recommendation
   * @access Private (requires authentication)
   */
  static async getAiHistory(req, res, next) {
    try {
      // if (!req.user) {
      //   const error = new Error("User is not authenticated");
      //   error.status = 401;
      //   throw error;
      // }

      // Check for existing history
      const history = await AiRequest.findOne({
        where: { UserId: req.user.id },
        order: [["createdAt", "DESC"]],
      });

      // If history exists, return cached data
      if (history && history.response) {
        try {
          const recommendations = JSON.parse(history.response);

          // Fetch the recommended games details
          const recommendedGames = await Game.findAll({
            where: {
              id: recommendations,
            },
            attributes: [
              "id",
              "title",
              "genre",
              "platform",
              "publisher",
              "thumbnail",
            ],
          });

          return res.status(200).json({
            success: true,
            source: "cache",
            message: "Loaded from previous AI request",
            data: {
              id: history.id,
              recommendations: recommendedGames,
              gameIds: recommendations,
              createdAt: history.createdAt,
            },
          });
        } catch (parseError) {
          console.error("Failed to parse cached history:", parseError);
          // If parsing fails, fall through to generate new recommendation
        }
      }

      // No history exists or parsing failed - generate new recommendation
      console.log(
        "No AI history found for user. Generating new recommendation..."
      );

      try {
        const result = await AiController._generateRecommendation(req.user.id);

        return res.status(201).json({
          success: true,
          source: "generated",
          message:
            "No history found. New AI recommendation generated successfully",
          data: {
            id: result.aiRequest.id,
            recommendations: result.recommendedGames,
            gameIds: result.gameIds,
            basedOnFavorites: result.basedOnFavorites,
            createdAt: result.aiRequest.createdAt,
          },
        });
      } catch (generationError) {
        console.error(
          "Failed to generate new recommendation:",
          generationError
        );
        const error = new Error(
          generationError.message || "Failed to generate AI recommendation"
        );
        error.status = generationError.status || 500;
        throw error;
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * @route DELETE /ai/history/:id
   * @desc Delete a single AI request from history
   * @access Private (requires authentication & authorization)
   */
  static async deleteAiRequest(req, res, next) {
    try {
      // if (!req.user) {
      //   const error = new Error("User is not authenticated");
      //   error.status = 401;
      //   throw error;
      // }

      const { id } = req.params;

      // Find AI request
      const aiRequest = await AiRequest.findByPk(id);

      if (!aiRequest) {
        const error = new Error("AI request not found");
        error.status = 404;
        throw error;
      }

      // Authorization check - user can only delete their own requests
      if (aiRequest.UserId !== req.user.id) {
        const error = new Error("You do not have access to delete this");
        error.status = 403;
        throw error;
      }

      // Delete
      await aiRequest.destroy();

      return res.status(200).json({
        success: true,
        message: "AI request successfully deleted",
        data: {
          id,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AiController;
