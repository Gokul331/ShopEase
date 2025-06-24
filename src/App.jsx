import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import ScrollToTop from "./components/ScrollToTop";
import ProductDisplay from "./pages/ProductDisplay";
// Lazy loaded pages
const HomePage = lazy(() => import("./pages/Home"));
const ProductPage = lazy(() => import("./pages/ProductDisplay"));
const CartPage = lazy(() => import("./pages/CartPage"));
const AccountPage = lazy(() => import("./pages/Account"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const OrdersPage = lazy(() => import("./pages/Orders"));
const ReturnsPage = lazy(() => import("./pages/Returns"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistory"));
const BuyAgainPage = lazy(() => import("./pages/BuyAgain"));
const NotFoundPage = lazy(() => import("./pages/NotFound"));

const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Suspense
        fallback={
          <div className="min-w-screen min-h-screen grid place-items-center">
            <PageLoader />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductDisplay />} />
          <Route
            path="/login"
            element={<LoginPage setIsAuthenticated={setIsAuthenticated} />}
          />
          <Route
            path="/register"
            element={<RegisterPage setIsAuthenticated={setIsAuthenticated} />}
          />

          {/* Protected Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/returns"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ReturnsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy-again"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <BuyAgainPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
