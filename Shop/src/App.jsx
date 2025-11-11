import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccess from "./pages/OrderSuccess";
import CategoriesPage from "./pages/CategoriesPage";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import AddressesPage from "./pages/AddressesPage";
import CardsPage from "./pages/CardsPage";
import Login from "./pages/Login"; // Changed from components to pages
import Register from "./pages/Register"; // Changed from components to pages
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <div className="se-app">
            {/* Conditionally render Navbar - hide on auth pages */}
            <Routes>
              <Route path="/*" element={<LayoutWithNav />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}

// Layout component that includes Navbar for authenticated routes
const LayoutWithNav = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/:orderId" element={<PaymentPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/addresses" element={<AddressesPage />} />
          <Route path="/profile/cards" element={<CardsPage />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
