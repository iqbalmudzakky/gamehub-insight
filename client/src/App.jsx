import { BrowserRouter, Route, Routes } from "react-router";

import AuthLayout from "./layouts/AuthLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import FavoritePage from "./pages/FavoritePage";
import DetailGame from "./pages/DetailGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Authentication Pages */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes - Authenticated Pages */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/game/:id" element={<DetailGame />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
