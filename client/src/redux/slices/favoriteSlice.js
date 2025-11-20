import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { serverApi } from "../../helpers/client-api";

/**
 * ============================================
 * ASYNC THUNK: Get User's Favorites List
 * ============================================
 * This thunk fetches all favorites for the logged-in user.
 * 
 * How it works:
 * 1. Gets token from localStorage
 * 2. Makes GET request to /favorites
 * 3. Returns the favorites array on success
 * 4. Rejects with error message on failure
 */
export const getFavorites = createAsyncThunk(
  "favorites/getFavorites", // Action type name
  async (_, { rejectWithValue }) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token");

      // Make API call to get favorites
      const response = await serverApi.get("/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Return the favorites data (will be in action.payload)
      return response.data;
    } catch (error) {
      // Return error details for better error handling
      const errorMessage =
        error.response?.data?.message || "Failed to load favorites";
      const statusCode = error.response?.status;

      return rejectWithValue({
        message: errorMessage,
        status: statusCode,
      });
    }
  }
);

/**
 * ============================================
 * ASYNC THUNK: Add Game to Favorites
 * ============================================
 * This thunk handles the API call to add a game to the user's favorites.
 * 
 * How it works:
 * 1. Takes gameId as parameter
 * 2. Gets token from localStorage
 * 3. Makes POST request to /favorites/:gameId
 * 4. Returns the response data on success
 * 5. Rejects with error message on failure
 */
export const addToFavorite = createAsyncThunk(
  "favorites/addToFavorite", // Action type name
  async (gameId, { rejectWithValue }) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token");

      // Make API call to add favorite
      const response = await serverApi.post(
        `/favorites/${gameId}`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Return the data (will be in action.payload)
      return response.data;
    } catch (error) {
      // Return error details for better error handling
      const errorMessage =
        error.response?.data?.message || "Failed to add to favorites";
      const statusCode = error.response?.status;

      return rejectWithValue({
        message: errorMessage,
        status: statusCode,
      });
    }
  }
);

/**
 * ============================================
 * ASYNC THUNK: Remove Game from Favorites
 * ============================================
 * This thunk handles the API call to remove a game from favorites.
 * 
 * How it works:
 * 1. Takes gameId as parameter
 * 2. Gets token from localStorage
 * 3. Makes DELETE request to /favorites/:gameId
 * 4. Returns the gameId on success (to remove from state.items)
 * 5. Rejects with error message on failure
 */
export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite", // Action type name
  async (gameId, { rejectWithValue }) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token");

      // Make API call to delete favorite
      const response = await serverApi.delete(`/favorites/${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Return gameId to remove from state
      // Also include the success message from backend
      return {
        gameId: gameId,
        message: response.data.message || "Removed from favorites!",
      };
    } catch (error) {
      // Return error details for better error handling
      const errorMessage =
        error.response?.data?.message || "Failed to remove from favorites";
      const statusCode = error.response?.status;

      return rejectWithValue({
        message: errorMessage,
        status: statusCode,
      });
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",

  // Initial state
  initialState: {
    items: [], // Array to store the favorites list
    loading: false, // True when API call is in progress
    error: null, // Error message if operation fails
    successMessage: null, // Success message after adding favorite
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
    resetFavoriteState: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },

  // Extra reducers handle the async thunk states
  extraReducers: (builder) => {
    builder
      // ============================================
      // GET FAVORITES - Read user's favorites list
      // ============================================
      
      // When getFavorites is pending (API call in progress)
      .addCase(getFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // When getFavorites succeeds
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Store the favorites array in state.items
        state.items = action.payload.data || [];
      })

      // When getFavorites fails
      .addCase(getFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load favorites";
        state.items = []; // Clear items on error
      })

      // ============================================
      // ADD TO FAVORITES - Create new favorite
      // ============================================
      
      // When addToFavorite is pending (API call in progress)
      .addCase(addToFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      // When addToFavorite succeeds
      .addCase(addToFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || "Added to favorites!";
      })

      // When addToFavorite fails
      .addCase(addToFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        state.successMessage = null;
      })

      // ============================================
      // REMOVE FROM FAVORITES - Delete favorite
      // ============================================
      
      // When removeFavorite is pending (API call in progress)
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })

      // When removeFavorite succeeds
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.successMessage = action.payload.message || "Removed from favorites!";
        
        // Remove the item from state.items array
        // Filter out the favorite that matches the gameId
        state.items = state.items.filter(
          (favorite) => favorite.Game.id !== action.payload.gameId
        );
      })

      // When removeFavorite fails
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to remove favorite";
        state.successMessage = null;
      });
  },
});

// Export actions for use in components
export const { clearError, clearSuccess, resetFavoriteState } =
  favoriteSlice.actions;

// Export reducer to add to store
export default favoriteSlice.reducer;
