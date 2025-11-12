import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

/**
 * DetailGame Component
 * Displays detailed information about a selected game
 * Protected route - requires authentication
 */
export default function DetailGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToFavorite, setAddingToFavorite] = useState(false);

  /**
   * Fetch game details from backend
   */
  const fetchGameDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await serverApi.get(`/games/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setGame(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch game details:", err);

      if (err.response?.status === 404) {
        setError("Game not found");
      } else if (err.response?.status === 401) {
        setError("Please login to view game details");
      } else {
        setError(err.response?.data?.message || "Failed to load game details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameDetail();
  }, [id]);

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
   * Add game to favorites with AI recommendation refresh
   * Uses POST /favorites/:gameId endpoint
   * After successful addition, triggers AI recommendation update
   */
  const handleAddToFavorite = async () => {
    try {
      setAddingToFavorite(true);

      const response = await serverApi.post(
        `/favorites/${game.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Added to Favorites!",
          text: `${game.title} has been added to your favorites.`,
          confirmButtonText: "Great!",
          confirmButtonColor: "#00adb5",
          timer: 2000,
          showConfirmButton: false,
        });

        // Run in background without waiting
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
      console.error("Failed to add to favorites:", err);

      // Handle duplicate favorite error
      if (err.response?.status === 400) {
        Swal.fire({
          icon: "info",
          title: "Already in Favorites",
          text:
            err.response?.data?.message ||
            "This game is already in your favorites.",
          confirmButtonText: "OK",
          confirmButtonColor: "#00adb5",
        });
      } else if (err.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Authentication Required",
          text: "Please login to add games to favorites.",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#00adb5",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Add",
          text:
            err.response?.data?.message ||
            "Failed to add to favorites. Please try again.",
          confirmButtonText: "Try Again",
        });
      }
    } finally {
      setAddingToFavorite(false);
    }
  };

  /**
   * Navigate back to home
   */
  const handleGoBack = () => {
    navigate("/");
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <div className="detail-container">
        <div className="detail-card">
          <div className="skeleton-detail-image"></div>
          <div className="skeleton-detail-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error || !game) {
    return (
      <div className="detail-container">
        <div className="detail-error-state">
          <div className="error-icon">❌</div>
          <h2>{error || "Game not found"}</h2>
          <button className="back-btn" onClick={handleGoBack}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  /**
   * Success State - Display Game Details
   */
  return (
    <div className="detail-container">
      <div className="detail-card">
        <button className="back-btn" onClick={handleGoBack}>
          ← Back
        </button>

        <div className="detail-content">
          <div className="detail-image-section">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="detail-thumbnail"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/400x250?text=No+Image";
              }}
            />
          </div>

          <div className="detail-info-section">
            <h1 className="detail-title">{game.title}</h1>

            <div className="detail-info-grid">
              <div className="info-item">
                <span className="info-label">Genre:</span>
                <span className="info-value">{game.genre || "N/A"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Platform:</span>
                <span className="info-value">{game.platform || "N/A"}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Publisher:</span>
                <span className="info-value">{game.publisher || "N/A"}</span>
              </div>

              {game.developer && (
                <div className="info-item">
                  <span className="info-label">Developer:</span>
                  <span className="info-value">{game.developer}</span>
                </div>
              )}

              {game.release_date && (
                <div className="info-item">
                  <span className="info-label">Release Date:</span>
                  <span className="info-value">{game.release_date}</span>
                </div>
              )}
            </div>

            {game.short_description && (
              <div className="detail-description">
                <h3>About</h3>
                <p>{game.short_description}</p>
              </div>
            )}

            <div className="detail-actions">
              <button
                className="fav-btn-large"
                onClick={handleAddToFavorite}
                disabled={addingToFavorite}
              >
                {addingToFavorite ? "Adding..." : "⭐ Add to Favorites"}
              </button>

              {game.game_url && (
                <a
                  href={game.game_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-btn"
                >
                  🎮 Play Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
