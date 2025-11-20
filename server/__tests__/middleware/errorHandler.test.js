const { errorHandler, asyncHandler } = require("../../middleware/errorHandler");

describe("Error Handler Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();

    // Spy on console.error
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("errorHandler", () => {
    it("should handle error with custom status and message", () => {
      const error = new Error("Custom error message");
      error.status = 400;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Custom error message",
      });
    });

    it("should use statusCode if status is not defined", () => {
      const error = new Error("Error message");
      error.statusCode = 404;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should default to status 500 for errors without status", () => {
      const error = new Error("Internal server error");

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Internal server error",
      });
    });

    it("should use default message when error has no message", () => {
      const error = new Error();
      delete error.message;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    });

    it("should include error details in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const error = new Error("Dev error");
      error.status = 500;
      error.stack = "Error stack trace";

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Dev error",
          error: expect.any(Object),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should NOT include error details in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const error = new Error("Prod error");
      error.status = 500;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Prod error",
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should log error to console", () => {
      const error = new Error("Log test error");
      error.status = 400;
      error.stack = "Stack trace";

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error:"),
        expect.objectContaining({
          status: 400,
          message: "Log test error",
          stack: "Stack trace",
        })
      );
    });

    it("should handle errors with no stack trace", () => {
      const error = new Error("No stack");
      delete error.stack;

      expect(() => {
        errorHandler(error, mockReq, mockRes, mockNext);
      }).not.toThrow();
    });
  });

  describe("asyncHandler", () => {
    it("should execute async function successfully", async () => {
      const mockAsyncFn = jest.fn().mockResolvedValue("success");
      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should catch and pass errors to next middleware", async () => {
      const error = new Error("Async error");
      const mockAsyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockAsyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle sync errors thrown in async function", async () => {
      const testError = new Error("Sync error in async");
      const mockAsyncFn = jest.fn().mockRejectedValue(testError);
      const wrappedFn = asyncHandler(mockAsyncFn);

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });

    it("should work with multiple async handlers", async () => {
      const mockFn1 = jest.fn().mockResolvedValue("first");
      const mockFn2 = jest.fn().mockResolvedValue("second");

      const wrapped1 = asyncHandler(mockFn1);
      const wrapped2 = asyncHandler(mockFn2);

      await wrapped1(mockReq, mockRes, mockNext);
      await wrapped2(mockReq, mockRes, mockNext);

      expect(mockFn1).toHaveBeenCalled();
      expect(mockFn2).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should preserve function context", async () => {
      const context = { value: 42 };
      const mockAsyncFn = jest.fn(async function () {
        return this.value;
      });

      const wrappedFn = asyncHandler(mockAsyncFn).bind(context);
      await wrappedFn(mockReq, mockRes, mockNext);

      expect(mockAsyncFn).toHaveBeenCalled();
    });
  });
});
