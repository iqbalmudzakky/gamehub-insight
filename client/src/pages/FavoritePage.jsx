export default function Favorite() {
  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <img src="logo.png" className="logo" />
          <h1 className="title">My Favorites</h1>
        </div>
        <div className="navbar-right">
          <button className="logout-btn">Logout</button>
        </div>
      </header>
      <main>
        <h2
          className="section-title"
          style={{ maxWidth: 1100, margin: "30px auto" }}
        >
          ⭐ Your Favorite Games
        </h2>
        <div className="favorites-container">
          <div className="game-card">
            <img src="game1.jpg" />
            <h3>Fortnite</h3>
            <p>Battle Royale</p>
            <button className="fav-btn">Remove</button>
          </div>
          <div className="game-card">
            <img src="game2.jpg" />
            <h3>Valorant</h3>
            <p>FPS</p>
            <button className="fav-btn">Remove</button>
          </div>
        </div>
        {/* Jika kosong */}
        {/* <p class="empty-fav">You haven't added any favorite games yet.</p> */}
      </main>
      <footer className="footer">
        <p>© 2025 GameHub Insight</p>
      </footer>
    </>
  );
}
