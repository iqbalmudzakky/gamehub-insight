const request = require("supertest");
const app = require("../../app");
const { Game, User } = require("../../models");
const { generateToken } = require("../../helpers/jwt");

jest.mock("../../models");

describe("Game Controller - Integration Tests", () => {
  let validToken;
  let adminToken;

  beforeEach(() => {
    jest.clearAllMocks();
    validToken = generateToken({ id: 1, email: "user@example.com" });
    adminToken = generateToken({ id: 2, email: "admin@example.com" });
  });

  describe("GET /games", () => {
    it("should get all games with pagination", async () => {
      const mockGames = [
        { id: 1, title: "Game 1" },
        { id: 2, title: "Game 2" },
      ];

      Game.findAndCountAll = jest.fn().mockResolvedValue({
        count: 20,
        rows: mockGames,
      });

      const response = await request(app)
        .get("/games?page=1&limit=2")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGames);
      expect(response.body.pagination).toEqual({
        currentPage: 1,
        totalPages: 10,
        totalItems: 20,
        itemsPerPage: 2,
        hasNextPage: true,
      });
    });

    it("should filter games by genre", async () => {
      Game.findAndCountAll = jest.fn().mockResolvedValue({
        count: 5,
        rows: [{ id: 1, title: "RPG Game", genre: "RPG" }],
      });

      const response = await request(app)
        .get("/games?genre=RPG")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(Game.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { genre: "RPG" },
        })
      );
    });

    it("should search games by title", async () => {
      Game.findAndCountAll = jest.fn().mockResolvedValue({
        count: 3,
        rows: [{ id: 1, title: "Zelda" }],
      });

      const response = await request(app)
        .get("/games?q=Zelda")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(Game.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: expect.anything(),
          }),
        })
      );
    });

    it("should use default pagination values", async () => {
      Game.findAndCountAll = jest.fn().mockResolvedValue({
        count: 100,
        rows: [],
      });

      const response = await request(app)
        .get("/games")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(Game.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 12,
          offset: 0,
        })
      );
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/games");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /games/:id", () => {
    it("should get game by ID", async () => {
      const mockGame = {
        id: 1,
        title: "Test Game",
        genre: "Action",
      };

      Game.findByPk = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get("/games/1")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGame);
    });

    it("should return 404 if game not found", async () => {
      Game.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get("/games/999")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Game not found.");
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).get("/games/1");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /games/:id", () => {
    it("should update game as admin", async () => {
      const mockAdmin = { id: 2, role: "admin" };
      const mockGame = {
        id: 1,
        title: "Old Title",
        update: jest.fn().mockResolvedValue(true),
      };

      User.findByPk = jest.fn().mockResolvedValue(mockAdmin);
      Game.findByPk = jest.fn().mockResolvedValue(mockGame);

      const updateData = {
        title: "New Title",
        genre: "RPG",
        platform: "PC",
        publisher: "Test Publisher",
        thumbnail: "http://example.com/image.jpg",
        createdAt: "2024-01-01",
      };

      const response = await request(app)
        .put("/games/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockGame.update).toHaveBeenCalledWith(updateData);
    });

    it("should return 404 if user not found", async () => {
      User.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put("/games/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "New Title",
          genre: "RPG",
          platform: "PC",
          publisher: "Test Publisher",
          thumbnail: "http://example.com/image.jpg",
          createdAt: "2024-01-01",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("User not found.");
    });

    it("should return 403 if user is not admin", async () => {
      const mockUser = { id: 1, role: "user" };
      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .put("/games/1")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: "New Title",
          genre: "RPG",
          platform: "PC",
          publisher: "Test Publisher",
          thumbnail: "http://example.com/image.jpg",
          createdAt: "2024-01-01",
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("User not authorized.");
    });

    it("should return 400 if fields are missing", async () => {
      const mockAdmin = { id: 2, role: "admin" };
      User.findByPk = jest.fn().mockResolvedValue(mockAdmin);

      const response = await request(app)
        .put("/games/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "New Title",
          // Missing other required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("All fields are required.");
    });

    it("should return 404 if game not found", async () => {
      const mockAdmin = { id: 2, role: "admin" };
      User.findByPk = jest.fn().mockResolvedValue(mockAdmin);
      Game.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put("/games/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "New Title",
          genre: "RPG",
          platform: "PC",
          publisher: "Test Publisher",
          thumbnail: "http://example.com/image.jpg",
          createdAt: "2024-01-01",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Game not found.");
    });
  });
});
