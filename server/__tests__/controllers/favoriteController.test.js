const request = require("supertest");
const app = require("../../app");
const { Favorite, Game } = require("../../models");
const { generateToken } = require("../../helpers/jwt");

jest.mock("../../models");

describe("Favorite Controller - Integration Tests", () => {
  let validToken;

  beforeEach(() => {
    jest.clearAllMocks();
    validToken = generateToken({ id: 1, email: "user@example.com" });
  });

  describe("GET /favorites", () => {
    it("should get user favorites successfully", async () => {
      const mockFavorites = [
        {
          id: 1,
          UserId: 1,
          GameId: 10,
          Game: {
            id: 10,
            title: "Favorite Game 1",
            genre: "Action",
            platform: "PC",
            publisher: "Publisher 1",
            thumbnail: "http://example.com/game1.jpg",
          },
        },
        {
          id: 2,
          UserId: 1,
          GameId: 20,
          Game: {
            id: 20,
            title: "Favorite Game 2",
            genre: "RPG",
            platform: "PS5",
            publisher: "Publisher 2",
            thumbnail: "http://example.com/game2.jpg",
          },
        },
      ];

      Favorite.findAll = jest.fn().mockResolvedValue(mockFavorites);

      const response = await request(app)
        .get("/favorites")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("favorite list");
      expect(response.body.data).toEqual(mockFavorites);
      expect(response.body.total).toBe(2);
    });

    it("should return empty array when user has no favorites", async () => {
      Favorite.findAll = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get("/favorites")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/favorites");

      expect(response.status).toBe(401);
    });
  });

  describe("POST /favorites/:gameId", () => {
    it("should add game to favorites successfully", async () => {
      const mockGame = {
        id: 10,
        title: "New Favorite Game",
      };
      const mockFavorite = {
        id: 1,
        UserId: 1,
        GameId: 10,
      };

      Game.findByPk = jest.fn().mockResolvedValue(mockGame);
      Favorite.findOne = jest.fn().mockResolvedValue(null);
      Favorite.create = jest.fn().mockResolvedValue(mockFavorite);

      const response = await request(app)
        .post("/favorites/10")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Game successfully added to favorites."
      );
      expect(response.body.data).toEqual(mockFavorite);
    });

    it("should return 404 if game not found", async () => {
      Game.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post("/favorites/999")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should return 400 if game already in favorites", async () => {
      const mockGame = { id: 10 };
      const existingFavorite = {
        id: 1,
        UserId: 1,
        GameId: 10,
      };

      Game.findByPk = jest.fn().mockResolvedValue(mockGame);
      Favorite.findOne = jest.fn().mockResolvedValue(existingFavorite);

      const response = await request(app)
        .post("/favorites/10")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Game already exists in the favorite list."
      );
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/favorites/10");

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /favorites/:gameId", () => {
    it("should remove game from favorites successfully", async () => {
      const mockFavorite = {
        id: 1,
        UserId: 1,
        GameId: 10,
        destroy: jest.fn().mockResolvedValue(true),
      };

      Favorite.findOne = jest.fn().mockResolvedValue(mockFavorite);

      const response = await request(app)
        .delete("/favorites/10")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Game successfully removed from favorites."
      );
      expect(response.body.data).toEqual({
        GameId: "10",
        UserId: 1,
      });
      expect(mockFavorite.destroy).toHaveBeenCalled();
    });

    it("should return 404 if favorite not found", async () => {
      Favorite.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete("/favorites/999")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Favorite not found.");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).delete("/favorites/10");

      expect(response.status).toBe(401);
    });
  });
});
