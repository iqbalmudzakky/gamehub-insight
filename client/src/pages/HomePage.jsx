export default function HomePage() {
  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-left">
          <img src="logo.png" className="logo" alt="Logo" />
          <h1 className="title">GameHub Insight</h1>
        </div>
        <div className="navbar-right">
          <button className="login-btn">Login</button>
        </div>
      </header>
      {/* AI Recommendation Section */}
      <section className="ai-section">
        <h2 className="section-title">🎮 AI Game Recommendations</h2>
        <div className="ai-cards">
          <div className="ai-card">
            <img src="ai1.jpg" alt="" />
            <p>Elden Ring</p>
          </div>
          <div className="ai-card">
            <img src="ai2.jpg" alt="" />
            <p>Cyberpunk 2077</p>
          </div>
          <div className="ai-card">
            <img src="ai3.jpg" alt="" />
            <p>The Witcher 3</p>
          </div>
        </div>
      </section>
      {/* 🔍 Search & Filter Section */}
      <section className="search-section">
        <input
          type="text"
          id="searchInput"
          placeholder="Search game title..."
        />
        <select id="genreSelect">
          <option value="">All Genres</option>
          <option value="RPG">RPG</option>
          <option value="FPS">FPS</option>
          <option value="Action">Action</option>
          <option value="MOBA">MOBA</option>
          <option value="Battle Royale">Battle Royale</option>
        </select>
        <button className="search-btn">Search</button>
      </section>
      {/* Game List Section */}
      <main className="game-section">
        <h2 className="section-title">🔥 Popular Games</h2>
        <div className="game-grid">
          <div
            className="game-card"
            data-title="Fortnite"
            data-genre="Battle Royale"
          >
            <img src="game1.jpg" />
            <h3>Fortnite</h3>
            <p>Battle Royale</p>
            <button className="fav-btn">Add to Favorite</button>
          </div>
          <div className="game-card" data-title="Valorant" data-genre="FPS">
            <img src="game2.jpg" />
            <h3>Valorant</h3>
            <p>FPS</p>
            <button className="fav-btn">Add to Favorite</button>
          </div>
          <div
            className="game-card"
            data-title="Genshin Impact"
            data-genre="RPG"
          >
            <img src="game3.jpg" />
            <h3>Genshin Impact</h3>
            <p>RPG</p>
            <button className="fav-btn">Add to Favorite</button>
          </div>
          <div
            className="game-card"
            data-title="League of Legends"
            data-genre="MOBA"
          >
            <img src="game4.jpg" />
            <h3>League of Legends</h3>
            <p>MOBA</p>
            <button className="fav-btn">Add to Favorite</button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 GameHub Insight — Powered by FreeToGame API &amp; AI</p>
      </footer>
    </>
  );
}
