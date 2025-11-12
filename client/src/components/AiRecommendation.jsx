import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

/**
 * AiRecommendation Component
 * Displays AI-powered game recommendations fetched from /ai/history
 * Handles loading states, errors, and empty data gracefully
 */
export default function AiRecommendation() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null); // 'cache' or 'generated'

  /**
   * Check if user has favorites and refresh AI recommendations if needed
   */
  const checkAndRefreshRecommendations = async () => {
    try {
      console.log("🔍 Checking user favorites...");

      const favoritesResponse = await serverApi.get("/favorites", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const hasFavorites = favoritesResponse.data?.data?.length > 0;

      if (hasFavorites) {
        console.log(
          `✅ Found ${favoritesResponse.data.data.length} favorites. Refreshing AI recommendations...`
        );

        // Refresh AI recommendations based on current favorites
        try {
          const recommendResponse = await serverApi.get("/ai/recommend", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 15000, // 15 second timeout for Gemini API
          });

          if (recommendResponse.data.success) {
            console.log("🤖 AI recommendations refreshed successfully");
          }
        } catch (refreshErr) {
          // Don't block the UI if AI refresh fails - just log it
          console.warn(
            "⚠️ AI refresh failed (will use cached data):",
            refreshErr.message
          );
        }
      } else {
        console.log("📭 No favorites found. Skipping AI refresh.");
      }
    } catch (err) {
      // Don't fail the entire component if favorites check fails
      console.warn("⚠️ Failed to check favorites:", err.message);
    }
  };

  /**
   * Fetch AI recommendations from backend
   * First checks for favorites and refreshes recommendations if needed
   */
  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      await checkAndRefreshRecommendations();

      const response = await serverApi.get("/ai/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setRecommendations(response.data.data.recommendations || []);
        setSource(response.data.source);
        console.log(
          `✅ Loaded ${
            response.data.data.recommendations?.length || 0
          } recommendations (${response.data.source})`
        );
      }
    } catch (err) {
      console.error("❌ Failed to fetch AI recommendations:", err);

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError("Please login to view recommendations");
      } else if (err.response?.status === 500) {
        setError("AI service temporarily unavailable");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection");
      } else {
        setError(
          err.response?.data?.message || "Failed to load recommendations"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  /**
   * Retry fetching recommendations
   */
  const handleRetry = () => {
    fetchRecommendations();
  };

  /**
   * Loading State
   */
  if (loading) {
    return (
      <section className="ai-section">
        <h2 className="section-title">🎮 AI Game Recommendations</h2>
        <div className="ai-cards">
          {[1, 2, 3].map((index) => (
            <div key={index} className="ai-card skeleton-card">
              <div className="skeleton-image"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
        <p className="ai-status">Loading recommendations...</p>
      </section>
    );
  }

  /**
   * Error State with Retry Option
   */
  if (error) {
    return (
      <section className="ai-section">
        <h2 className="section-title">🎮 AI Game Recommendations</h2>
        <div className="ai-error-state">
          <div className="error-icon">⚠️</div>
          <p className="error-text">{error}</p>
          <button className="retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  /**
   * Empty State
   */
  if (recommendations.length === 0) {
    return (
      <section className="ai-section">
        <h2 className="section-title">🎮 AI Game Recommendations</h2>
        <div className="ai-empty-state">
          <div className="empty-icon">🎲</div>
          <p className="empty-text">No recommendations available yet</p>
          <p className="empty-subtext">
            Add some games to your favorites to get personalized
            recommendations!
          </p>
        </div>
      </section>
    );
  }

  /**
   * Navigate to game detail page
   */
  const handleCardClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  /**
   * Success State with Recommendations
   */
  return (
    <section className="ai-section">
      <div className="ai-header">
        <h2 className="section-title">🎮 AI Game Recommendations</h2>
        {source && (
          <span className="ai-badge">
            {source === "cache" ? "📦 From History" : "✨ Fresh Pick"}
          </span>
        )}
      </div>
      <div className="ai-cards">
        {recommendations.map((game) => (
          <div
            key={game.id}
            className="ai-card"
            data-title={game.title}
            data-genre={game.genre}
            onClick={() => handleCardClick(game.id)}
          >
            <img
              src={game.thumbnail}
              alt={game.title}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/200x120?text=No+Image";
              }}
            />
            <h3>{game.title}</h3>
            <p className="ai-genre">{game.genre}</p>
            <p className="ai-platform">{game.platform}</p>
          </div>
        ))}
      </div>
      <button className="refresh-btn" onClick={handleRetry}>
        🔄 Refresh Recommendations
      </button>
    </section>
  );
}
