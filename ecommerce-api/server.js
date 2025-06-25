require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");

const app = express();
const client = new OAuth2Client(
  "555344318905-k1dqnrenn5ruhfb6trn41cph7gh14fvp.apps.googleusercontent.com"
);

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

// Google Sign-In route
app.post("/api/users/google-signin", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "555344318905-k1dqnrenn5ruhfb6trn41cph7gh14fvp.apps.googleusercontent.com",
    });
    const { email, name, picture } = ticket.getPayload();

    // Check if user already exists in the database
    let user = await User.findOne({ email });
    if (!user) {
      // If not, create a new user
      user = new User({
        email,
        name,
        password: "GoogleSignIn", // You can set a default password or generate a random one
        image: picture,
      });
      await user.save();
    }

    // Generate a JWT token for the user
    const token = user.generateAuthToken();

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Google Sign-In error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Ecommerce API is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
