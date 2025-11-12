import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

export default function FavoritePage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingGameId, setRemovingGameId] = useState(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await serverApi.get("/favorites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setFavorites(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch favorites:", err);

      if (err.response?.status === 401) {
        setError("Please login to view your favorites");
      } else {
        setError(err.response?.data?.message || "Failed to load favorites");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSeeDetail = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  /**
   * Trigger AI recommendation refresh (with error handling for Gemini API)
   * This updates the AI recommendation cache after favorites change
   */
  // const refreshAiRecommendation = async () => {
  //   try {
  //     // Call AI recommend endpoint to generate fresh recommendations
  //     await serverApi.get("/ai/recommend", {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       },
  //     });

  //     console.log("✅ AI recommendations refreshed successfully");
  //   } catch (err) {
  //     // Gracefully handle Gemini API failures
  //     // Don't show error to user - this is a background operation
  //     console.warn(
  //       "⚠️ AI recommendation refresh failed (non-critical):",
  //       err.message
  //     );

  //     // Log specific error for debugging
  //     if (err.response?.status === 500) {
  //       console.warn("Gemini API may be temporarily unavailable");
  //     }
  //   }
  // };

  /**
   * Refresh AI recommendations with retry logic
   * Handles Gemini API instability by retrying up to 3 times
   *
   * @param {number} retryCount - Current retry attempt (default: 0)
   * @param {number} maxRetries - Maximum retry attempts (default: 3)
   * @returns {Promise<boolean>} - Success status
   */
  const refreshAiRecommendation = async (retryCount = 0, maxRetries = 3) => {
    try {
      console.log(
        `🤖 Refreshing AI recommendations (attempt ${retryCount + 1}/${
          maxRetries + 1
        })...`
      );

      const response = await serverApi.get("/ai/recommend", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        timeout: 15000, // 15 second timeout for Gemini API
      });

      if (response.data.success) {
        console.log("✅ AI recommendations refreshed successfully");
        return true;
      }

      return false;
    } catch (err) {
      console.warn(
        `⚠️ AI recommendation refresh failed (attempt ${retryCount + 1}):`,
        err.message
      );

      // Check if we should retry
      const shouldRetry =
        retryCount < maxRetries &&
        (err.response?.status === 500 ||
          err.code === "ECONNABORTED" ||
          err.code === "ERR_NETWORK");

      if (shouldRetry) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`🔄 Retrying in ${delay / 1000} seconds...`);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return refreshAiRecommendation(retryCount + 1, maxRetries);
      }

      // Max retries reached or non-retryable error
      console.warn("❌ AI recommendation refresh failed after all retries");

      // Log specific error for debugging
      if (err.response?.status === 500) {
        console.warn("Gemini API may be temporarily unavailable");
      } else if (err.code === "ECONNABORTED") {
        console.warn("Request timeout - Gemini API too slow");
      }

      return false;
    }
  };

  /**
   * Remove game from favorites
   */
  const handleRemoveFavorite = async (gameId, gameTitle) => {
    // Confirm removal with SweetAlert
    const result = await Swal.fire({
      title: "Remove from Favorites?",
      text: `Are you sure you want to remove "${gameTitle}" from your favorites?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#00adb5",
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setRemovingGameId(gameId);

      // Remove from backend
      const response = await serverApi.delete(`/favorites/${gameId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        // Update local state - remove from favorites array
        setFavorites((prevFavorites) =>
          prevFavorites.filter((fav) => fav.Game.id !== gameId)
        );

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: `"${gameTitle}" has been removed from your favorites.`,
          confirmButtonColor: "#00adb5",
          timer: 2000,
        });

        // Refresh AI recommendations in background (non-blocking)
        // This ensures /ai/history will have fresh data on next visit
        refreshAiRecommendation()
          .then((success) => {
            if (success) {
              console.log(
                "🎯 AI cache updated - HomePage will show fresh recommendations"
              );
            } else {
              console.log(
                "⚠️ AI cache update failed - Old recommendations may still appear"
              );
            }
          })
          .catch((err) => {
            console.warn("AI refresh error (non-critical):", err);
          });
      }
    } catch (err) {
      console.error("Failed to remove favorite:", err);

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Failed to Remove",
        text:
          err.response?.data?.message ||
          "Failed to remove from favorites. Please try again.",
        confirmButtonText: "OK",
      });
    } finally {
      setRemovingGameId(null);
    }
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <>
        <main>
          <h2
            className="section-title"
            style={{ maxWidth: 1100, margin: "30px auto", paddingLeft: "20px" }}
          >
            ⭐ Your Favorite Games
          </h2>
          <div className="favorites-container">
            {[1, 2, 3].map((index) => (
              <div key={index} className="game-card skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
              </div>
            ))}
          </div>
        </main>
        <footer className="footer">
          <p>© 2025 GameHub Insight</p>
        </footer>
      </>
    );
  }

  /**
   * Error State
   */
  if (error) {
    return (
      <>
        <main>
          <h2
            className="section-title"
            style={{ maxWidth: 1100, margin: "30px auto", paddingLeft: "20px" }}
          >
            ⭐ Your Favorite Games
          </h2>
          <div
            className="ai-error-state"
            style={{ maxWidth: 1100, margin: "0 auto" }}
          >
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={fetchFavorites}>
              Retry
            </button>
          </div>
        </main>
        <footer className="footer">
          <p>© 2025 GameHub Insight</p>
        </footer>
      </>
    );
  }

  /**
   * Empty State
   */
  if (favorites.length === 0) {
    return (
      <>
        <main>
          <h2
            className="section-title"
            style={{ maxWidth: 1100, margin: "30px auto", paddingLeft: "20px" }}
          >
            ⭐ Your Favorite Games
          </h2>
          <div
            className="ai-empty-state"
            style={{ maxWidth: 1100, margin: "0 auto" }}
          >
            <div className="empty-icon">💔</div>
            <p className="empty-text">No favorite games yet</p>
            <p className="empty-subtext">
              Start adding games to your favorites to see them here!
            </p>
            <button
              className="refresh-btn"
              onClick={() => navigate("/")}
              style={{ marginTop: "20px" }}
            >
              Browse Games
            </button>
          </div>
        </main>
        <footer className="footer">
          <p>© 2025 GameHub Insight</p>
        </footer>
      </>
    );
  }

  /**
   * Success State - Display Favorites
   */
  return (
    <>
      <main>
        <h2
          className="section-title"
          style={{ maxWidth: 1100, margin: "30px auto", paddingLeft: "20px" }}
        >
          ⭐ Your Favorite Games ({favorites.length})
        </h2>
        <div className="favorites-container">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="game-card">
              <img
                src={favorite.Game.thumbnail}
                alt={favorite.Game.title}
                onClick={() => handleSeeDetail(favorite.Game.id)}
                style={{ cursor: "pointer" }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/200x120?text=No+Image";
                }}
              />
              <h3>{favorite.Game.title}</h3>
              <p>{favorite.Game.genre}</p>
              <div className="game-card-actions">
                <button
                  className="detail-btn"
                  onClick={() => handleSeeDetail(favorite.Game.id)}
                >
                  See Detail
                </button>
                <button
                  className="fav-btn remove-btn"
                  onClick={() =>
                    handleRemoveFavorite(favorite.Game.id, favorite.Game.title)
                  }
                  disabled={removingGameId === favorite.Game.id}
                >
                  {removingGameId === favorite.Game.id
                    ? "Removing..."
                    : "Remove"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <footer className="footer">
        <p>© 2025 GameHub Insight</p>
      </footer>
    </>
  );
}
