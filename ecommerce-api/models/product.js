const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  brand: { type: String },
  rating: { type: Number },
  reviews: { type: Number },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  colors: [{ type: String }],
  images: [{ type: String }],
  thumbnail: { type: String },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
