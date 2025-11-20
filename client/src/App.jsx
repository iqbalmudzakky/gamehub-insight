import { BrowserRouter, Route, Routes } from "react-router";

import { Provider } from "react-redux";
import store from "./redux/store";

import AuthLayout from "./layouts/AuthLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import AdminLayout from "./layouts/AdminLayout";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import FavoritePage from "./pages/FavoritePage";
import DetailGame from "./pages/DetailGame";
import AdminHomePage from "./pages/AdminHomePage";
import AdminEditPage from "./pages/AdminEditPage";

function App() {
  return (
    <Provider store={store}>
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

          {/* Admin Routes - Admin Only Pages */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/edit/:id" element={<AdminEditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
