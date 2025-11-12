import { Link } from "react-router";

/**
 * Navbar Component
 * Reusable navigation bar for authentication pages
 * @param {Object} props - Component props
 * @param {boolean} props.showAuthButtons - Show login/register buttons (optional)
 */
export default function Navbar({ showAuthButtons = false }) {
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
      {showAuthButtons && (
        <div className="navbar-right">
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>
        </div>
      )}
    </header>
  );
}
