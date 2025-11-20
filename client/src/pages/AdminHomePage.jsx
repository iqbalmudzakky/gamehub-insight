import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

/**
 * AdminHomePage Component
 * Admin dashboard displaying all games with infinite scroll
 * No AI Recommendations, no "My Favorite" button
 * Clicking a game card navigates to admin edit page
 */
export default function AdminHomePage() {
  const navigate = useNavigate();
  const [allGames, setAllGames] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  async function fetchGenres() {
    try {
      const response = await serverApi.get(`/games?limit=1000`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Extract unique genres from all games
      const uniqueGenres = [
        ...new Set(response.data.data.map((game) => game.genre)),
      ];
      setGenreList(uniqueGenres);
    } catch (err) {
      console.error("🚀 ~ fetchGenres ~ err:", err);
    }
  }

  /**
   * Fetch games with pagination support
   * @param {number} pageNum - Page number to fetch
   * @param {boolean} isNewSearch - Whether this is a new search (reset data)
   */
  async function fetchAllGame(pageNum = 1, isNewSearch = false) {
    try {
      setLoading(true);
      
      const response = await serverApi.get(
        `/games?q=${q}&genre=${genre}&page=${pageNum}&limit=12`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const newGames = response.data.data;
      const pagination = response.data.pagination;

      if (isNewSearch) {
        // Replace existing games with new search results
        setAllGames(newGames);
      } else {
        // Append new games to existing list (infinite scroll)
        setAllGames((prevGames) => [...prevGames, ...newGames]);
      }

      // Update pagination state
      setHasMore(pagination.hasNextPage);
      setPage(pageNum);
      
      console.log(`📄 Loaded page ${pageNum} - ${newGames.length} games (Total: ${pagination.totalItems})`);
    } catch (err) {
      console.error("🚀 ~ fetchAllGame ~ err:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load more games for infinite scroll
   */
  const loadMoreGames = () => {
    if (!loading && hasMore) {
      fetchAllGame(page + 1, false);
    }
  };

  // Fetch genres only once on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch games when search or genre changes (reset to page 1)
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchAllGame(1, true);
  }, [q, genre]);

  /**
   * Navigate to edit page when game card is clicked
   */
  const handleCardClick = (gameId) => {
    navigate(`/admin/edit/${gameId}`);
  };

  return (
    <>
      {/* 🔍 Search & Filter Section */}
      <section className="search-section">
        <input
          type="text"
          id="searchInput"
          placeholder="Search game title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          id="genreSelect"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">All Genres</option>
          {genreList.map((genreItem, index) => (
            <option key={index} value={genreItem}>
              {genreItem}
            </option>
          ))}
        </select>
        <button className="search-btn">Search</button>
      </section>

      {/* Game List Section with Infinite Scroll */}
      <main className="game-section">
        <h2 className="section-title">🎮 Manage Games</h2>
        
        {allGames.length > 0 ? (
          <InfiniteScroll
            dataLength={allGames.length}
            next={loadMoreGames}
            hasMore={hasMore}
            loader={
              <div className="infinite-scroll-loader">
                <div className="loader-spinner"></div>
                <p>Loading more games...</p>
              </div>
            }
            endMessage={
              <div className="infinite-scroll-end">
                <p>🎮 You've seen all games! 🎮</p>
              </div>
            }
            style={{ overflow: "visible" }}
          >
            <div className="game-grid">
              {allGames.map((game) => (
                <div
                  key={game.id}
                  className="game-card admin-game-card"
                  onClick={() => handleCardClick(game.id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={game.thumbnail}
                    alt={game.title}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/200x120?text=No+Image";
                    }}
                  />
                  <h3>{game.title}</h3>
                  <p style={{ color: "#00adb5" }}>{game.genre}</p>
                  <p>{game.platform}</p>
                  <button className="edit-btn" onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(game.id);
                  }}>
                    ✏️ Edit
                  </button>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="game-grid">
            {loading ? (
              // Show skeleton loaders on initial load
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index) => (
                  <div key={index} className="game-card skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                ))}
              </>
            ) : (
              <p className="empty-text">
                No games found. Try a different search.
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 GameHub Insight — Admin Dashboard</p>
      </footer>
    </>
  );
}
