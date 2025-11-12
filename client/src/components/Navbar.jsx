import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";

/**
 * Navbar Component
 * Reusable navigation bar with conditional rendering based on auth state and route
 * @param {Object} props - Component props
 * @param {boolean} props.showAuthButtons - Show auth-related buttons (optional)
 */
export default function Navbar({ showAuthButtons = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Check if current page is login or register
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // Remove token from localStorage
      localStorage.removeItem("token");
      setIsLoggedIn(false);

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Logged Out!",
        text: "You have been logged out successfully.",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      });

      // Redirect to login page
      navigate("/login");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img src="/logo.png" className="logo" alt="GameHub Insight Logo" />
          <h1 className="title">GameHub Insight</h1>
        </Link>
      </div>

      {/* Show buttons only if showAuthButtons is true and not on auth pages */}
      {showAuthButtons && !isAuthPage && (
        <div className="navbar-right">
          {/* My Favorite button - always show on HomePage when logged in or not */}
          <Link to="/favorites">
            <button className="favorite-btn">My Favorite</button>
          </Link>

          {/* Conditional Login/Logout button */}
          {isLoggedIn ? (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login">
              <button className="login-btn">Login</button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
