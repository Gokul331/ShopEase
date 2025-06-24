import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const clientId = "555344318905-k1dqnrenn5ruhfb6trn41cph7gh14fvp.apps.googleusercontent.com";

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check credentials in localStorage on mount
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/account");
    }
    // eslint-disable-next-line
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("authToken", "dummy_token");
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userId", data.user._id);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        navigate("/"); // <-- Redirect to home page after login
      } else {
        setError(data.error || "Invalid email or password");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // Send credentialResponse.credential (JWT) to your backend for verification
    const res = await fetch("http://localhost:5000/api/users/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });
    const data = await res.json();
    if (res.ok) {
      // Set auth state, localStorage, etc.
      setIsAuthenticated(true);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userId", data.user._id);
      // Redirect as needed
      navigate("/"); // <-- Redirect to home page after Google login
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-indigo-600 text-center">
            Login to ShopEase
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-2 rounded-lg font-semibold shadow hover:from-pink-500 hover:to-indigo-500 transition"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <button
              className="text-indigo-600 hover:underline"
              onClick={() => navigate("/register")}
              type="button"
            >
              Register
            </button>
          </div>
          <div className="mt-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google Sign In Failed")}
            />
          </div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
