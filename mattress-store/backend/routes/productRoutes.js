const express = require("express");
const Product = require("../models/Product");
const slugify = require("slugify");

const router = express.Router();

// @route   POST /api/products
// @desc    Add a new product
router.post("/", async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // UPDATED: Added 'category' to the destructured body
    const { title, slug, description, price, originalPrice, sizes, images, featured, category } = req.body;
    const productSlug = slug || slugify(title, { lower: true, strict: true });

    const newProduct = new Product({
      title,
      slug: productSlug,
      description,
      price,
      originalPrice,
      category, // UPDATED: Include category in the new Product object
      sizes,
      images,
      featured,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Failed to create product" });
  }
});

// @route   GET /api/products
// @desc    Get all products (now supports optional category filtering)
router.get("/", async (req, res) => {
  try {
    // UPDATED: Check for category query parameter and set up filter
    const { category } = req.query; 
    const filter = {};

    if (category) {
        // If a category is present, filter the database query
        filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }); // Use the filter object
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// @route   GET /api/products/:slug
// @desc    Get product by slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product by ID (No changes needed, as req.body handles category update)
router.put('/:id', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product by ID
router.delete('/:id', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
