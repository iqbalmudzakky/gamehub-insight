const authenticateToken = require("../../middleware/authenticateToken");
const { generateToken } = require("../../helpers/jwt");
const jwt = require("jsonwebtoken");

describe("Authenticate Token Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe("Valid token scenarios", () => {
    it("should authenticate valid token and set req.user", () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const token = generateToken(mockUser);
      mockReq.headers["authorization"] = `Bearer ${token}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user.id).toBe(mockUser.id);
      expect(mockReq.user.email).toBe(mockUser.email);
      expect(mockNext).toHaveBeenCalledWith(); // Called without error
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it("should extract token from Bearer format", () => {
      const mockUser = { id: 5, email: "user@test.com" };
      const token = generateToken(mockUser);
      mockReq.headers["authorization"] = `Bearer ${token}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should handle authorization header with multiple spaces", () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const token = generateToken(mockUser);
      mockReq.headers["authorization"] = `Bearer  ${token}`; // Extra space

      authenticateToken(mockReq, mockRes, mockNext);

      // split(" ")[1] will get empty string with double space between Bearer and token
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401, // Token is required (empty string is falsy)
          message: "Token is required.",
        })
      );
    });
  });

  describe("Missing token scenarios", () => {
    it("should return 401 error when no authorization header", () => {
      // No authorization header set
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is required.",
          status: 401,
        })
      );
    });

    it("should return 401 error when authorization header is empty", () => {
      mockReq.headers["authorization"] = "";

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is required.",
          status: 401,
        })
      );
    });

    it("should return 401 error when authorization header has no token part", () => {
      mockReq.headers["authorization"] = "Bearer"; // No token after Bearer

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is required.",
          status: 401,
        })
      );
    });

    it("should return 401 error when authorization header has only Bearer keyword", () => {
      mockReq.headers["authorization"] = "Bearer ";

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is required.",
          status: 401,
        })
      );
    });
  });

  describe("Invalid token scenarios", () => {
    it("should return 403 error for malformed token", () => {
      mockReq.headers["authorization"] = "Bearer invalid.token.here";

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is invalid or has expired.",
          status: 403,
        })
      );
    });

    it("should return 403 error for expired token", () => {
      const expiredToken = jwt.sign(
        { id: 1, email: "test@example.com" },
        process.env.JWT_SECRET,
        { expiresIn: "-1h" } // Expired 1 hour ago
      );
      mockReq.headers["authorization"] = `Bearer ${expiredToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is invalid or has expired.",
          status: 403,
        })
      );
    });

    it("should return 403 error for token with wrong secret", () => {
      const wrongSecretToken = jwt.sign(
        { id: 1, email: "test@example.com" },
        "wrong-secret-key",
        { expiresIn: "1h" }
      );
      mockReq.headers["authorization"] = `Bearer ${wrongSecretToken}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is invalid or has expired.",
          status: 403,
        })
      );
    });

    it("should return 403 error for token with missing parts", () => {
      mockReq.headers["authorization"] = "Bearer just.two";

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
        })
      );
    });

    it("should handle JsonWebTokenError", () => {
      mockReq.headers["authorization"] = "Bearer not-a-jwt";

      authenticateToken(mockReq, mockRes, mockNext);

      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg.status).toBe(403);
      expect(errorArg.message).toBe("Token is invalid or has expired.");
    });

    it("should handle TokenExpiredError", async () => {
      const expiredToken = jwt.sign({ id: 1 }, process.env.JWT_SECRET, {
        expiresIn: "0s",
      });

      // Wait to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      mockReq.headers["authorization"] = `Bearer ${expiredToken}`;
      authenticateToken(mockReq, mockRes, mockNext);

      const errorArg = mockNext.mock.calls[0][0];
      expect(errorArg.status).toBe(403);
      expect(errorArg.message).toBe("Token is invalid or has expired.");
    });
  });

  describe("Edge cases", () => {
    it("should handle authorization header with lowercase 'bearer'", () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const token = generateToken(mockUser);
      mockReq.headers["authorization"] = `bearer ${token}`; // lowercase

      authenticateToken(mockReq, mockRes, mockNext);

      // This will fail because split(" ")[1] will get the token
      // but the token is still valid
      expect(mockReq.user).toBeDefined();
    });

    it("should not modify req.user if it already exists (should overwrite)", () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const token = generateToken(mockUser);
      mockReq.headers["authorization"] = `Bearer ${token}`;
      mockReq.user = { id: 999, email: "old@example.com" };

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user.id).toBe(mockUser.id);
      expect(mockReq.user.email).toBe(mockUser.email);
    });

    it("should handle token with extra whitespace", () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const token = generateToken(mockUser);
      mockReq.headers["authorization"] = `Bearer ${token}   `; // Trailing spaces

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeDefined();
    });
  });
});
