const { generateToken, verifyToken } = require("../../helpers/jwt");
const jwt = require("jsonwebtoken");

describe("JWT Helper", () => {
  const mockPayload = {
    id: 1,
    email: "test@example.com",
  };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT format: header.payload.signature
    });

    it("should include payload data in token", () => {
      const token = generateToken(mockPayload);
      const decoded = jwt.decode(token);

      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.exp).toBeDefined(); // Expiration time
      expect(decoded.iat).toBeDefined(); // Issued at time
    });

    it("should set token expiration to 24 hours", () => {
      const token = generateToken(mockPayload);
      const decoded = jwt.decode(token);

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(24 * 60 * 60); // 24 hours in seconds
    });

    it("should generate different tokens for same payload (issued at different times)", async () => {
      const token1 = generateToken(mockPayload);

      // Wait 1 second to ensure different iat
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const token2 = generateToken(mockPayload);
      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token and return payload", () => {
      const token = generateToken(mockPayload);
      const verified = verifyToken(token);

      expect(verified.id).toBe(mockPayload.id);
      expect(verified.email).toBe(mockPayload.email);
    });

    it("should throw JsonWebTokenError for invalid token", () => {
      const invalidToken = "invalid.token.here";

      expect(() => verifyToken(invalidToken)).toThrow();
      expect(() => verifyToken(invalidToken)).toThrow(jwt.JsonWebTokenError);
    });

    it("should throw error for token with wrong secret", () => {
      const wrongSecretToken = jwt.sign(mockPayload, "wrong-secret", {
        expiresIn: "1h",
      });

      expect(() => verifyToken(wrongSecretToken)).toThrow();
    });

    it("should throw error for malformed token", () => {
      const malformedToken = "not-a-valid-jwt";

      expect(() => verifyToken(malformedToken)).toThrow(
        jwt.JsonWebTokenError
      );
    });

    it("should throw TokenExpiredError for expired token", () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_SECRET, {
        expiresIn: "-1s", // Expired 1 second ago
      });

      expect(() => verifyToken(expiredToken)).toThrow();
      expect(() => verifyToken(expiredToken)).toThrow(jwt.TokenExpiredError);
    });

    it("should throw error for empty token", () => {
      expect(() => verifyToken("")).toThrow();
    });

    it("should throw error for null token", () => {
      expect(() => verifyToken(null)).toThrow();
    });
  });
});
