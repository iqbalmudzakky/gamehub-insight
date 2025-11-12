import { BrowserRouter, Route, Routes } from "react-router";

import AuthLayout from "./layouts/AuthLayout";
import RegisterPage from "./pages/RegisterPage";
// import LoginPage from "./pages/LoginPage";
// import HomePage from "./pages/HomePage";
// import FavoritePage from "./pages/FavoritePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
