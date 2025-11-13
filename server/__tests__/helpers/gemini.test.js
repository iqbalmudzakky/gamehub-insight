describe("Gemini Helper", () => {
  describe("generateContent", () => {
    it("should be a function", () => {
      const generateContent = require("../../helpers/gemini");
      expect(typeof generateContent).toBe("function");
    });

    it("should have module load without errors", () => {
      expect(() => require("../../helpers/gemini")).not.toThrow();
    });

    it("should use environment variable for API key", () => {
      expect(process.env.GEMINI_API_KEY).toBeDefined();
      expect(process.env.GEMINI_API_KEY).toBe("test-gemini-api-key");
    });

    // Note: We test Gemini API integration via controller tests
    // since the GoogleGenAI instance is created at module load time
  });
});
