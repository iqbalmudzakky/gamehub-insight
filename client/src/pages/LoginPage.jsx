import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

/**
 * LoginPage Component
 * User authentication page with email/password login and Google OAuth
 */
export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const response = await serverApi.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.data.token);

      // Success - redirect to home
      await Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Login successful!",
        confirmButtonText: "Continue",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      });

      navigate("/");
    } catch (err) {
      console.log("🚀 ~ handleSubmit ~ err:", err);
      // Error alert - Let Axios handle validation
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid email or password.",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleCredentialResponse(credentialResponse) {
    console.log("🔐 Google credential received");

    setError("");
    setIsLoading(true);

    try {
      const response = await serverApi.post("/auth/google", {
        googleAccessToken: credentialResponse.credential,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.data.token);

      // Success - redirect to home
      await Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: response.data.message || "Login successful!",
        confirmButtonText: "Continue",
        confirmButtonColor: "#3085d6",
        timer: 1500,
      });

      navigate("/");
    } catch (err) {
      console.error("🚀 ~ handleCredentialResponse ~ err:", err);
      // Error alert
      Swal.fire({
        icon: "error",
        title: "Google Login Failed",
        text:
          err.response?.data?.message ||
          "Failed to login with Google. Please try again.",
        confirmButtonText: "Try Again",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Initialize Google OAuth button
   */
  useEffect(() => {
    // Function to initialize Google Sign-In
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        const buttonDiv = document.getElementById("buttonDiv");
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: 280,
          });
        }
        console.log("✅ Google Sign-In initialized");
      } else {
        console.error("❌ Google Identity Services not loaded");
      }
    };
    initializeGoogle();
    // Check if Google script is already loaded
    // if (window.google && window.google.accounts) {
    //   initializeGoogle();
    // } else {
    //   // Load Google Identity Services script if not loaded
    //   const script = document.createElement("script");
    //   script.src = "https://accounts.google.com/gsi/client";
    //   script.async = true;
    //   script.defer = true;
    //   script.onload = initializeGoogle;
    //   document.body.appendChild(script);

    //   // Cleanup function
    //   return () => {
    //     if (script.parentNode) {
    //       script.parentNode.removeChild(script);
    //     }
    //   };
    // }
  }, []);

  if (localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to continue your journey</p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="current-password"
            />
          </div>

          <div className="d-flex flex-column align-items-center gap-3">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <div id="buttonDiv"></div>
          </div>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
