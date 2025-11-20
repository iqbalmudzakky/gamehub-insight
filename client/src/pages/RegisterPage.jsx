import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

/**
 * RegisterPage Component
 * User registration page with username, email, password, and Google OAuth
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    console.log("🚀 ~ handleSubmit ~ formData:", formData);
    try {
      await serverApi.post("/auth/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      });

      // Success - redirect to login
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Registration successful! Please login.",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#3085d6",
      });

      navigate("/login");
    } catch (err) {
      console.log("🚀 ~ handleSubmit ~ err:", err);
      // Error alert
      if (err.message === "Network Error") {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Please check your internet connection.",
          confirmButtonText: "Try Again",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text:
            err.response.data.message ||
            "Registration failed. Please try again.",
          confirmButtonText: "Try Again",
        });
      }
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
        title: "Google Registration Failed",
        text:
          err.response?.data?.message ||
          "Failed to register with Google. Please try again.",
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
    // window.onload = function () {
    //   google.accounts.id.initialize({
    //     client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    //     callback: handleCredentialResponse,
    //   });
    //   google.accounts.id.renderButton(
    //     document.getElementById("buttonDiv"),
    //     { theme: "outline", size: "large" } // customization attributes
    //   );
    //   // google.accounts.id.prompt(); // also display the One Tap dialog
    // };

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
            text: "signup_with",
            width: 280,
          });
        }
        console.log("✅ Google Sign-In initialized");
      } else {
        console.error("❌ Google Identity Services not loaded");
      }
    };
    initializeGoogle();
    // // // Check if Google script is already loaded
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

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us to discover amazing games</p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="username"
            />
          </div>

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
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          <div className="d-flex flex-column align-items-center gap-3">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Creating Account..." : "Register"}
            </button>
            <div id="buttonDiv"></div>
          </div>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
