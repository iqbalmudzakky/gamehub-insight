import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serverApi } from "../../helpers/client-api";

/**
 * ============================================
 * ASYNC THUNK: Update Game
 * ============================================
 * This thunk handles the API call to update a game.
 *
 * How it works:
 * 1. Takes an object with gameId and gameData
 * 2. Gets token from localStorage
 * 3. Makes PUT request to /games/:id
 * 4. Returns the updated game data on success
 * 5. Rejects with error message on failure
 */
export const updateGame = createAsyncThunk(
  "games/updateGame", // Action type name
  async ({ gameId, gameData }, { rejectWithValue }) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token");

      // Make API call to update game
      const response = await serverApi.put(
        `/games/${gameId}`,
        gameData, // Form data (title, genre, platform, etc.)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Return the updated game data (will be in action.payload)
      return response.data;
    } catch (error) {
      // Return error details for better error handling
      const errorMessage =
        error.response?.data?.message || "Failed to update game";
      const statusCode = error.response?.status;

      return rejectWithValue({
        message: errorMessage,
        status: statusCode,
      });
    }
  }
);

const gameSlice = createSlice({
  name: "games",

  // Initial state
  initialState: {
    currentGame: null, // Store the currently edited game
    loading: false, // True when API call is in progress
    error: null, // Error message if operation fails
    successMessage: null, // Success message after updating game
  },

  // Regular reducers (for synchronous actions)
  reducers: {
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },

    // Clear success message
    clearSuccess: (state) => {
      state.successMessage = null;
    },

    // Reset the entire state
    resetGameState: (state) => {
      state.currentGame = null;
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },

  // Extra reducers handle the async thunk states
  extraReducers: (builder) => {
    builder
      // ============================================
      // UPDATE GAME - Edit game details
      // ============================================

      // When updateGame is pending (API call in progress)
      .addCase(updateGame.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      // When updateGame succeeds
      .addCase(updateGame.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage =
          action.payload.message || "Game updated successfully!";
        // Store the updated game data
        state.currentGame = action.payload.data || null;
      })

      // When updateGame fails
      .addCase(updateGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update game";
        state.successMessage = null;
      });
  },
});

// Export actions for use in components
export const { clearError, clearSuccess, resetGameState } = gameSlice.actions;

// Export reducer to add to store
export default gameSlice.reducer;
