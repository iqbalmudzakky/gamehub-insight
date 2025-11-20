module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/migrations/**",
    "!**/seeders/**",
    "!**/bin/**",
    "!**/helpers/testGemini.js",
    "!jest.config.js",
  ],
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 95,
      lines: 85,
    },
  },
  testMatch: ["**/__tests__/**/*.test.js"],
  verbose: true,
  silent: false,
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],
};
