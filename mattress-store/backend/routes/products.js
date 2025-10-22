const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin add product (protected by ADMIN_TOKEN header)
router.post('/', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const p = new Product(req.body);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update product by ID (protected by ADMIN_TOKEN)
router.put('/:id', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product by ID (protected by ADMIN_TOKEN)
router.delete('/:id', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
