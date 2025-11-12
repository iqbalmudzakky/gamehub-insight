import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { serverApi } from "../helpers/client-api";

/**
 * RegisterPage Component
 * User registration page with username, email, and password
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

    // // Validation
    // if (!formData.username.trim()) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Oops...",
    //     text: "Username is required!",
    //   });
    //   return;
    // }

    // if (!formData.email.trim()) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Oops...",
    //     text: "Email is required!",
    //   });
    //   return;
    // }

    // if (formData.password.length < 6) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Weak Password",
    //     text: "Password must be at least 6 characters!",
    //   });
    //   return;
    // }

    // if (formData.password !== formData.confirmPassword) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "Password Mismatch",
    //     text: "Passwords do not match!",
    //   });
    //   return;
    // }

    setIsLoading(true);

    console.log("🚀 ~ handleSubmit ~ formData:", formData);
    try {
      await serverApi.post("/auth/register", {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
      });

      // if (!response.ok) {
      //   throw new Error(response.data.message || "Registration failed");
      // }

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

          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? "Creating Account..." : "Register"}
          </button>
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
