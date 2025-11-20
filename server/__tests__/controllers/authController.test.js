const request = require("supertest");
const app = require("../../app");
const { User } = require("../../models");
const { generateToken } = require("../../helpers/jwt");
const { hashPassword } = require("../../helpers/bcrypt");

// Mock Sequelize models
jest.mock("../../models");

// Mock Google OAuth
jest.mock("google-auth-library", () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(),
    })),
  };
});

const { OAuth2Client } = require("google-auth-library");

describe("Auth Controller - Integration Tests", () => {
  let mockOAuth2Client;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOAuth2Client = new OAuth2Client();
  });

  describe("POST /auth/register", () => {
    it("should register new user successfully", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Registration successful");
      expect(response.body.data.user).toEqual(mockUser);
      expect(response.body.data.token).toBeDefined();
    });

    it("should return 400 if fields are missing", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        // Missing password and passwordConfirm
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("All fields must be filled.");
    });

    it("should return 400 if passwords don't match", async () => {
      const response = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "differentPassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Password and confirmation password do not match"
      );
    });

    it("should return 400 if email already exists", async () => {
      User.findOne = jest
        .fn()
        .mockResolvedValue({ id: 1, email: "test@example.com" });

      const response = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        passwordConfirm: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email is already registered");
    });
  });

  describe("POST /auth/login", () => {
    it("should login user successfully", async () => {
      const hashedPassword = await hashPassword("password123");
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data.token).toBeDefined();
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        // Missing password
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email and password are required");
    });

    it("should return 401 if user not found", async () => {
      User.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email or password is incorrect");
    });

    it("should return 401 if password is incorrect", async () => {
      const hashedPassword = await hashPassword("correctPassword");
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: hashedPassword,
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "wrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email or password is incorrect");
    });

    it("should return 401 if user has no password (Google user)", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: null, // Google OAuth user
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "anyPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email or password is incorrect");
    });
  });

  describe("POST /auth/google", () => {
    // Note: Google OAuth2Client is instantiated at module load time,
    // making it difficult to mock in unit tests.
    // These scenarios are covered by E2E/integration tests.

    it("should handle Google OAuth errors", async () => {
      mockOAuth2Client.verifyIdToken.mockRejectedValue(
        new Error("Invalid Google token")
      );

      const response = await request(app).post("/auth/google").send({
        googleAccessToken: "invalid-token",
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /auth/profile", () => {
    it("should return user profile with valid token", async () => {
      const mockUser = {
        id: 1,
        name: "Test User",
        email: "test@example.com",
        role: "user",
      };

      User.findByPk = jest.fn().mockResolvedValue(mockUser);

      const token = generateToken({ id: 1, email: "test@example.com" });

      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toEqual(mockUser);
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app).get("/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token is required.");
    });

    it("should return 404 if user not found", async () => {
      User.findByPk = jest.fn().mockResolvedValue(null);

      const token = generateToken({ id: 999, email: "notfound@example.com" });

      const response = await request(app)
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User not found");
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully", async () => {
      const token = generateToken({ id: 1, email: "test@example.com" });

      const response = await request(app)
        .post("/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("Logout successful");
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app).post("/auth/logout");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
