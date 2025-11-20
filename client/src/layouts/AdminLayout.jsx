import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";
import AdminNavbar from "../components/AdminNavbar";

/**
 * AdminLayout Component
 * Layout wrapper for admin-only pages
 * Provides role-based access control - only allows admin users
 */
export default function AdminLayout() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // No token found - redirect to login
        await Swal.fire({
          icon: "warning",
          title: "Authentication Required",
          text: "Please login to access this page.",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
        });
        navigate("/login");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user profile to check role
        const response = await serverApi.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userRole = response.data.data.user.role;

        if (userRole !== "admin") {
          // User is not admin - show warning and redirect
          await Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "This page is restricted to admin users only.",
            confirmButtonText: "Go to Home",
            confirmButtonColor: "#d33",
            allowOutsideClick: false,
          });
          navigate("/");
          setIsLoading(false);
          return;
        }

        // User is admin - allow access
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (err) {
        console.error("🚀 ~ checkAdminAccess ~ err:", err);
        
        // Invalid token or error - redirect to login
        await Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Failed to verify your credentials. Please login again.",
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#3085d6",
          allowOutsideClick: false,
        });
        localStorage.removeItem("token");
        navigate("/login");
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  // Don't render admin content if not authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
}
