import { configureStore } from "@reduxjs/toolkit";
import favoriteReducer from "./slices/favoriteSlice";
import gameReducer from "./slices/gameSlice";

export default configureStore({
  reducer: {
    favorites: favoriteReducer,
    games: gameReducer,
  },
});
