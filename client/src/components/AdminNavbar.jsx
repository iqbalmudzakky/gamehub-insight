import { Link, useNavigate } from "react-router";

/**
 * AdminNavbar Component
 * Navigation bar for admin pages
 * Shows only Logout button, no "My Favorite"
 */
export default function AdminNavbar() {
  const navigate = useNavigate();

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
          to="/admin"
          style={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img src="/logo.png" className="logo" alt="GameHub Insight Logo" />
          <h1 className="title">GameHub Insight - Admin</h1>
        </Link>
      </div>

      <div className="navbar-right">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
