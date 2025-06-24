export const validateRegisterForm = (data) => {
  const errors = {};

  if (!data.name.trim()) {
    errors.name = "Full name is required";
  } else if (data.name.length < 3) {
    errors.name = "Name must be at least 3 characters";
  }

  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email";
  }

  if (!data.phone) {
    errors.phone = "Phone number is required";
  } else if (
    !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
      data.phone
    )
  ) {
    errors.phone = "Please enter a valid phone number";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
};
