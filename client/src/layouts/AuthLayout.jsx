import { Outlet } from "react-router";
import Navbar from "../components/Navbar";

/**
 * AuthLayout Component
 * Layout wrapper for authentication pages (Login & Register)
 * Provides consistent structure with Navbar
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 */
export default function AuthLayout() {
  return (
    <>
      <Navbar showAuthButtons={false} />
      <div className="auth-container">
        <Outlet />
      </div>
    </>
  );
}
