const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  // === NEW FIELD FOR CATEGORY ===
  category: { type: String, required: true },
  // ==============================
  sizes: [String],
  images: [String],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
