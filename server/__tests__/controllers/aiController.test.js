const request = require("supertest");
const app = require("../../app");
const { AiRequest, Game, Favorite } = require("../../models");
const { generateToken } = require("../../helpers/jwt");
const generateContent = require("../../helpers/gemini");

jest.mock("../../models");
jest.mock("../../helpers/gemini");

describe("AI Controller - Integration Tests", () => {
  let validToken;

  beforeEach(() => {
    jest.clearAllMocks();
    validToken = generateToken({ id: 1, email: "user@example.com" });
    process.env.GEMINI_API_KEY = "test-api-key";
  });

  describe("GET /ai/recommend", () => {
    it("should generate recommendations with favorites", async () => {
      const mockGames = [
        { id: 1, title: "Game 1" },
        { id: 2, title: "Game 2" },
        { id: 3, title: "Game 3" },
      ];

      const mockFavorites = [
        {
          UserId: 1,
          GameId: 1,
          Game: { title: "Game 1" },
          createdAt: new Date(),
        },
      ];

      const mockRecommendedGames = [
        { id: 2, title: "Game 2", genre: "RPG" },
        { id: 3, title: "Game 3", genre: "Action" },
      ];

      const mockAiRequest = {
        id: 1,
        UserId: 1,
        prompt: "Auto-generated based on 1 favorite games",
        response: "[2, 3]",
        createdAt: new Date(),
      };

      Game.findAll = jest.fn().mockImplementation(({ where }) => {
        if (where && where.id) {
          return Promise.resolve(mockRecommendedGames);
        }
        return Promise.resolve(mockGames);
      });

      Favorite.findAll = jest.fn().mockResolvedValue(mockFavorites);
      generateContent.mockResolvedValue("[2, 3]");
      AiRequest.create = jest.fn().mockResolvedValue(mockAiRequest);

      const response = await request(app)
        .get("/ai/recommend")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Game recommendations retrieved successfully"
      );
      expect(response.body.data.recommendations).toEqual(mockRecommendedGames);
      expect(response.body.data.basedOnFavorites).toBe(1);
    });

    it("should generate recommendations without favorites", async () => {
      const mockGames = [
        { id: 1, title: "Popular Game 1" },
        { id: 2, title: "Popular Game 2" },
      ];

      const mockRecommendedGames = [{ id: 1, title: "Popular Game 1" }];

      Game.findAll = jest.fn().mockImplementation(({ where }) => {
        if (where && where.id) {
          return Promise.resolve(mockRecommendedGames);
        }
        return Promise.resolve(mockGames);
      });

      Favorite.findAll = jest.fn().mockResolvedValue([]);
      generateContent.mockResolvedValue("[1]");
      AiRequest.create = jest.fn().mockResolvedValue({
        id: 1,
        createdAt: new Date(),
      });

      const response = await request(app)
        .get("/ai/recommend")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.basedOnFavorites).toBe(0);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/ai/recommend");

      expect(response.status).toBe(401);
    });

    // Note: GEMINI_API_KEY is checked when gemini.js module loads,
    // so we can't test the missing API key scenario in unit tests.
    // This is covered by environment setup validation.

    it("should handle invalid JSON response from AI", async () => {
      Game.findAll = jest.fn().mockResolvedValue([]);
      Favorite.findAll = jest.fn().mockResolvedValue([]);
      generateContent.mockResolvedValue("invalid json");

      const response = await request(app)
        .get("/ai/recommend")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it("should handle empty array from AI", async () => {
      Game.findAll = jest.fn().mockResolvedValue([]);
      Favorite.findAll = jest.fn().mockResolvedValue([]);
      generateContent.mockResolvedValue("[]");

      const response = await request(app)
        .get("/ai/recommend")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain("Invalid recommendation format");
    });

    it("should strip markdown from AI response", async () => {
      Game.findAll = jest.fn().mockImplementation(({ where }) => {
        if (where && where.id) {
          return Promise.resolve([{ id: 1, title: "Game 1" }]);
        }
        return Promise.resolve([{ id: 1, title: "Game 1" }]);
      });

      Favorite.findAll = jest.fn().mockResolvedValue([]);
      generateContent.mockResolvedValue("```json\n[1]\n```");
      AiRequest.create = jest.fn().mockResolvedValue({
        id: 1,
        createdAt: new Date(),
      });

      const response = await request(app)
        .get("/ai/recommend")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe("GET /ai/history", () => {
    it("should return cached history if exists", async () => {
      const mockHistory = {
        id: 1,
        UserId: 1,
        response: "[1, 2, 3]",
        createdAt: new Date(),
      };

      const mockGames = [
        { id: 1, title: "Game 1" },
        { id: 2, title: "Game 2" },
        { id: 3, title: "Game 3" },
      ];

      AiRequest.findOne = jest.fn().mockResolvedValue(mockHistory);
      Game.findAll = jest.fn().mockResolvedValue(mockGames);

      const response = await request(app)
        .get("/ai/history")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.source).toBe("cache");
      expect(response.body.message).toBe("Loaded from previous AI request");
    });

    it("should generate new recommendation if no history", async () => {
      AiRequest.findOne = jest.fn().mockResolvedValue(null);
      Game.findAll = jest.fn().mockResolvedValue([{ id: 1, title: "Game 1" }]);
      Favorite.findAll = jest.fn().mockResolvedValue([]);
      generateContent.mockResolvedValue("[1]");
      AiRequest.create = jest.fn().mockResolvedValue({
        id: 1,
        createdAt: new Date(),
      });

      const response = await request(app)
        .get("/ai/history")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(201);
      expect(response.body.source).toBe("generated");
      expect(response.body.message).toContain("No history found");
    });

    it("should regenerate if cached history has invalid JSON", async () => {
      const mockHistory = {
        id: 1,
        response: "invalid json",
        createdAt: new Date(),
      };

      AiRequest.findOne = jest.fn().mockResolvedValue(mockHistory);
      Game.findAll = jest.fn().mockResolvedValue([{ id: 1 }]);
      Favorite.findAll = jest.fn().mockResolvedValue([]);
      generateContent.mockResolvedValue("[1]");
      AiRequest.create = jest.fn().mockResolvedValue({
        id: 2,
        createdAt: new Date(),
      });

      const response = await request(app)
        .get("/ai/history")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(201);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/ai/history");

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /ai/history/:id", () => {
    it("should delete AI request successfully", async () => {
      const mockAiRequest = {
        id: 1,
        UserId: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };

      AiRequest.findByPk = jest.fn().mockResolvedValue(mockAiRequest);

      const response = await request(app)
        .delete("/ai/history/1")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("AI request successfully deleted");
      expect(mockAiRequest.destroy).toHaveBeenCalled();
    });

    it("should return 404 if AI request not found", async () => {
      AiRequest.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete("/ai/history/999")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("AI request not found");
    });

    it("should return 403 if user does not own the request", async () => {
      const mockAiRequest = {
        id: 1,
        UserId: 999, // Different user
      };

      AiRequest.findByPk = jest.fn().mockResolvedValue(mockAiRequest);

      const response = await request(app)
        .delete("/ai/history/1")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "You do not have access to delete this"
      );
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).delete("/ai/history/1");

      expect(response.status).toBe(401);
    });
  });
});
