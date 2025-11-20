import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import Navbar from "../components/Navbar";

/**
 * ProtectedLayout Component
 * Layout wrapper for authenticated pages (HomePage & FavoritePage)
 * Provides route protection - redirects to login if no valid token found
 * Shows Navbar with authentication-aware buttons
 */
export default function ProtectedLayout() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No token found - redirect to login
        Swal.fire({
          icon: "warning",
          title: "Authentication Required",
          text: "Please login to access this page.",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
        }).then(() => {
          navigate("/login");
        });
        setIsLoading(false);
        return;
      }

      // Token exists - allow access
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuthentication();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar showAuthButtons={true} />
      <Outlet />
    </>
  );
}
