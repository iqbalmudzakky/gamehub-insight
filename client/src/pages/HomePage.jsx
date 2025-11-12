import { useEffect, useState } from "react";
import CardList from "../components/CardList";
import AiRecommendation from "../components/AiRecommendation";
import { serverApi } from "../helpers/client-api";

export default function HomePage() {
  const [allGames, setAllGames] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");

  async function fetchGenres() {
    try {
      const response = await serverApi.get(`/games`, {
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

  async function fetchAllGame() {
    try {
      const response = await serverApi.get(`/games?q=${q}&genre=${genre}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAllGames(response.data.data);
    } catch (err) {
      console.error("🚀 ~ fetchAllGame ~ err:", err);
    }
  }

  // Fetch genres only once on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  // Fetch games when search or genre changes
  useEffect(() => {
    fetchAllGame();
  }, [q, genre]);

  return (
    <>
      {/* AI Recommendation Section */}
      <AiRecommendation />

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

      {/* Game List Section */}
      <main className="game-section">
        <h2 className="section-title">🔥 Popular Games</h2>
        <div className="game-grid">
          {allGames.length > 0 ? (
            allGames.map((game) => <CardList key={game.id} game={game} />)
          ) : (
            <p className="empty-text">
              No games found. Try a different search.
            </p>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 GameHub Insight — Powered by FreeToGame API &amp; AI</p>
      </footer>
    </>
  );
}
