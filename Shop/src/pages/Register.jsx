import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiArrowRight,
} from "react-icons/fi";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordRequirements = [
    { id: 1, text: "At least 8 characters", met: false },
    { id: 2, text: "Contains a number", met: false },
    { id: 3, text: "Contains a special character", met: false },
    { id: 4, text: "Contains uppercase letter", met: false },
  ];

  const checkPasswordStrength = (password) => {
    const requirements = [
      password.length >= 8,
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      /[A-Z]/.test(password),
    ];

    const strength = requirements.filter(Boolean).length;
    setPasswordStrength(strength);

    return requirements.map((met, index) => ({
      ...passwordRequirements[index],
      met,
    }));
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (error) setError("");

    // Check password strength
    if (field === "password") {
      checkPasswordStrength(value);
    }
  };

  const validateForm = () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
      return "Please fill in all fields";
    }

    if (form.username.length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Please enter a valid email address";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    if (passwordStrength < 2) {
      return "Please choose a stronger password";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
        phone: form.phone,
      });

      if (result.success) {
        navigate("/login", {
          state: { message: "Registration successful! Please log in." },
        });
      } else {
        // Handle different error formats from API
        if (typeof result.error === "object") {
          const errorMessages = Object.values(result.error).flat().join(", ");
          setError(errorMessages || "Registration failed");
        } else {
          setError(result.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <FiUser className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
                disabled={isLoading}
                minLength={3}
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
                disabled={isLoading}
              />
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  disabled={isLoading}
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={form.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
                disabled={isLoading}
                minLength={8}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5" />
                ) : (
                  <FiEye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {form.password && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Password strength:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength === 4
                        ? "text-green-600"
                        : passwordStrength === 3
                        ? "text-yellow-600"
                        : passwordStrength === 2
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-5 w-5" />
                ) : (
                  <FiEye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                Creating account...
              </div>
            ) : (
              <div className="flex items-center">
                Create Account
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            )}
          </button>
        </form>

        {/* Additional Links */}
        <div className="text-center text-xs text-gray-500 space-y-2">
          <p>
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
