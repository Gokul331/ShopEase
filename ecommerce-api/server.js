require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Product Schema & Model
const productSchema = new mongoose.Schema({
  title: String,
  price: Number,
  image: String,
  description: String,
});
const Product = mongoose.model("Product", productSchema);

// Import and use user routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Ecommerce API is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
