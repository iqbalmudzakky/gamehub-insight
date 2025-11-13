// Test setup file - runs before all tests
// Set up test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.GEMINI_API_KEY = "test-gemini-api-key";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id";

// Increase timeout for integration tests
jest.setTimeout(10000);
