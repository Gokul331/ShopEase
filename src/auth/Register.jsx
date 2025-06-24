import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  CheckCircle,
} from "react-feather";
import AuthLayout from "./AuthLayout";
import FormInput from "./FormInput";
import { validateRegisterForm } from "./Validation";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call your backend API
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone, // Include phone in the request
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setRegistrationSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrors({ server: data.error || "Registration failed." });
      }
    } catch (error) {
      setErrors({ server: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationSuccess) {
    return (
      <AuthLayout title="Registration Successful">
        <div className="text-center py-8">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
          <p>Redirecting to login page...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Account" subtitle="Join our community today">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          Icon={User}
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <FormInput
          Icon={Mail}
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormInput
          Icon={Smartphone}
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        <FormInput
          Icon={Lock}
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          endAdornment={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          autoComplete="current-password"
        />

        <FormInput
          Icon={Lock}
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="current-password"
        />

        {errors.server && (
          <div className="text-red-500 text-sm text-center">
            {errors.server}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Creating Account..." : "Register"}
        </button>

        <div className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
