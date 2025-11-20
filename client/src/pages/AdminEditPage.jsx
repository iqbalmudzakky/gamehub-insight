import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { serverApi } from "../helpers/client-api";
import { updateGame } from "../redux/slices/gameSlice";

/**
 * AdminEditPage Component
 * Admin page for editing game details
 * Shows game thumbnail and edit form side by side
 */
export default function AdminEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Redux hooks
  const dispatch = useDispatch();
  const { loading: saving } = useSelector((state) => state.games);
  
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    platform: "",
    publisher: "",
    thumbnail: "",
    createdAt: "",
  });
  
  // Options for select inputs
  const [genreOptions, setGenreOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [publisherOptions, setPublisherOptions] = useState([]);

  /**
   * Fetch all games to build unique options for selects
   */
  const fetchOptions = async () => {
    try {
      const response = await serverApi.get("/games?limit=1000", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const games = response.data.data;

      // Build unique arrays
      const uniqueGenres = [...new Set(games.map((g) => g.genre))].sort();
      const uniquePlatforms = [...new Set(games.map((g) => g.platform))].sort();
      const uniquePublishers = [...new Set(games.map((g) => g.publisher))].sort();

      setGenreOptions(uniqueGenres);
      setPlatformOptions(uniquePlatforms);
      setPublisherOptions(uniquePublishers);
    } catch (err) {
      console.error("🚀 ~ fetchOptions ~ err:", err);
    }
  };

  /**
   * Fetch game details by ID
   */
  const fetchGameDetails = async () => {
    try {
      setLoading(true);
      const response = await serverApi.get(`/games/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const gameData = response.data.data;
      setGame(gameData);

      // Format date for input (YYYY-MM-DD)
      const formattedDate = new Date(gameData.createdAt).toISOString().split('T')[0];

      // Populate form
      setFormData({
        title: gameData.title || "",
        genre: gameData.genre || "",
        platform: gameData.platform || "",
        publisher: gameData.publisher || "",
        thumbnail: gameData.thumbnail || "",
        createdAt: formattedDate || "",
      });
    } catch (err) {
      console.error("🚀 ~ fetchGameDetails ~ err:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load game details.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    fetchGameDetails();
  }, [id]);

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handle form submission using Redux
   * Dispatches the updateGame thunk and handles the result
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Dispatch the Redux thunk
      // unwrap() extracts the payload or throws an error
      const result = await dispatch(
        updateGame({ gameId: id, gameData: formData })
      ).unwrap();

      // Success! Show success message
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: result.message || "Game updated successfully!",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      });

      // Redirect to admin home
      navigate("/admin");
    } catch (err) {
      // Error is already in Redux state, extract from err.message
      console.error("🚀 ~ handleSubmit ~ err:", err);

      // Show backend error message
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update game. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="error-container">
        <h2>Game not found</h2>
        <button className="btn-primary" onClick={handleBack}>
          Back to Admin
        </button>
      </div>
    );
  }

  return (
    <div className="admin-edit-container">
      <h2 className="section-title">✏️ Edit Game</h2>
      
      <div className="admin-edit-content">
        {/* Left: Game Thumbnail */}
        <div className="admin-edit-thumbnail">
          <img
            src={formData.thumbnail || game.thumbnail}
            alt={game.title}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
          <h3>{game.title}</h3>
          <p className="game-id">ID: {game.id}</p>
        </div>

        {/* Right: Edit Form */}
        <div className="admin-edit-form">
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Genre */}
            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Genre</option>
                {genreOptions.map((genre, index) => (
                  <option key={index} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div className="form-group">
              <label htmlFor="platform">Platform</label>
              <select
                id="platform"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Platform</option>
                {platformOptions.map((platform, index) => (
                  <option key={index} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher */}
            <div className="form-group">
              <label htmlFor="publisher">Publisher</label>
              <select
                id="publisher"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select Publisher</option>
                {publisherOptions.map((publisher, index) => (
                  <option key={index} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </div>

            {/* Thumbnail URL */}
            <div className="form-group">
              <label htmlFor="thumbnail">Thumbnail URL</label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>

            {/* Released Date */}
            <div className="form-group">
              <label htmlFor="createdAt">Released Date</label>
              <input
                type="date"
                id="createdAt"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="admin-edit-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleBack}
                disabled={saving}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Game"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
