const { hashPassword, comparePassword } = require("../../helpers/bcrypt");

describe("Bcrypt Helper", () => {
  describe("hashPassword", () => {
    it("should hash a plain password successfully", async () => {
      const plainPassword = "mySecretPassword123";
      const hashed = await hashPassword(plainPassword);

      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe("string");
      expect(hashed).not.toBe(plainPassword);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should create different hashes for the same password (salt)", async () => {
      const plainPassword = "testPassword";
      const hash1 = await hashPassword(plainPassword);
      const hash2 = await hashPassword(plainPassword);

      expect(hash1).not.toBe(hash2); // bcrypt uses random salt
    });

    it("should hash empty string", async () => {
      const hashed = await hashPassword("");
      expect(hashed).toBeDefined();
      expect(typeof hashed).toBe("string");
    });
  });

  describe("comparePassword", () => {
    it("should return true when password matches hash", async () => {
      const plainPassword = "correctPassword123";
      const hashed = await hashPassword(plainPassword);
      const isMatch = await comparePassword(plainPassword, hashed);

      expect(isMatch).toBe(true);
    });

    it("should return false when password does not match hash", async () => {
      const plainPassword = "correctPassword";
      const wrongPassword = "wrongPassword";
      const hashed = await hashPassword(plainPassword);
      const isMatch = await comparePassword(wrongPassword, hashed);

      expect(isMatch).toBe(false);
    });

    it("should return false for empty password against hash", async () => {
      const plainPassword = "somePassword";
      const hashed = await hashPassword(plainPassword);
      const isMatch = await comparePassword("", hashed);

      expect(isMatch).toBe(false);
    });

    it("should handle case-sensitive password comparison", async () => {
      const plainPassword = "CaseSensitive123";
      const hashed = await hashPassword(plainPassword);
      const isMatchLower = await comparePassword("casesensitive123", hashed);

      expect(isMatchLower).toBe(false);
    });
  });
});
