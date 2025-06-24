const express = require("express");
const router = express.Router();
const User = require("../models/users");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "555344318905-k1dqnrenn5ruhfb6trn41cph7gh14fvp.apps.googleusercontent.com"
);

// Get a single user's details (by ID)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update a user's details (by ID)
router.put("/:id", async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (username !== undefined) user.username = username;
    if (password !== undefined) user.password = password;
    if (email !== undefined) user.email = email;
    await user.save();
    const { password: pw, ...userDetails } = user.toObject();
    res.json(userDetails);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
Q;
// Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, password, email, phone } = req.body;
    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "Username, password, and email are required" });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });
    user = new User({
      username,
      email,
      password,
      phone,
    });
    await user.save();
    const { password: pw, ...userDetails } = user.toObject();
    res.status(201).json(userDetails);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const { password: pw, ...userDetails } = user.toObject();
    res.json({ message: "Login successful", user: userDetails });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GOOGLE LOGIN ROUTE
router.post("/google-login", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        "555344318905-k1dqnrenn5ruhfb6trn41cph7gh14fvp.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        username: payload.name,
        email: payload.email,
        // You can add more fields if needed
      });
    }
    // Respond with user details and a dummy token (or your JWT)
    res.json({ user, token: "dummy_token" });
  } catch (err) {
    res.status(401).json({ error: "Invalid Google token" });
  }
});

module.exports = router;
