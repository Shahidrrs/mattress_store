const express = require("express");
const Cart = require("../models/Cart");
const protect = require("../middleware/protect");

const router = express.Router();

// 🔹 Get user's cart
router.get("/", protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = { items: [] };
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add item to cart
router.post("/add", protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [{ product: productId, quantity }] });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Remove item from cart
router.post("/remove", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
