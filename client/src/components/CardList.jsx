import { useNavigate } from "react-router";

/**
 * CardList Component
 * Reusable game card component for displaying game information
 * Navigates to detail page when "See Detail" is clicked
 */
export default function CardList({ game }) {
  const navigate = useNavigate();

  const handleSeeDetail = () => {
    navigate(`/game/${game.id}`);
  };

  return (
    <div
      className="game-card d-flex flex-column justify-content-between"
      data-title={game.title}
      data-genre={game.genre}
      onClick={handleSeeDetail}
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
    </div>
  );
}
