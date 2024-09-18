const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const passport = require('passport');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken")

// router.get('/', (req, res, next) => {
//     console.log("Incoming request to /api/cart");
//     console.log("Headers:", req.headers);
//     next();
// }, passport.authenticate('jwt', { session: false }), (req, res, next) => {
//     console.log("Passport authentication passed");
//     console.log("Authenticated user:", req.user);
//     next();
// }, (req, res) => {
//     // Your existing getCart logic here
//     console.log("Sending cart response");
//     res.json(req.cart);
// });

// Middleware to get cart
const getCart = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.id };

        console.log("Getting cart for user:", req.user._id);
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            console.log("No cart found, creating new cart");
            cart = new Cart({ user: req.user._id, items: [], subtotal: 0, total: 0 });
        } else if (cart.items.length === 0) {
            console.log("Cart found but empty, resetting totals");
            cart.subtotal = 0;
            cart.total = 0;
            cart.discount = 0;
        } else {
            console.log("Recalculating cart totals");
            cart.calculateTotal();
        }
        await cart.save();
        console.log("Cart processed successfully");
        req.cart = cart;
        next();
    } catch (error) {
        console.error("Error in getCart middleware:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        next(error);
    }
};



// Get user's cart
router.get('/', passport.authenticate('jwt', { session: false }), getCart, (req, res, next) => {
    console.log("Sending cart response");
    console.log("Authenticated user:", req.user);  // Add this line
    getCart(req, res, next);
}, (req, res) => {
    console.log("Sending cart response");
    res.json(req.cart);
});

// Add item to cart
router.post('/add', passport.authenticate('jwt', { session: false }), getCart, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const existingItemIndex = req.cart.items.findIndex(item => item.product._id.toString() === productId);
        if (existingItemIndex > -1) {
            req.cart.items[existingItemIndex].quantity += quantity;
        } else {
            req.cart.items.push({ product: product._id, quantity, price: product.price.amount });
        }

        req.cart.calculateTotal();
        await req.cart.save();
        res.json(req.cart);
    } catch (error) {
        res.status(500).json({ message: 'Error adding item to cart', error: error.message });
    }
});

// Remove item from cart
router.post('/remove', passport.authenticate('jwt', { session: false }), getCart, async (req, res) => {
    try {
        const { productId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        req.cart.items = req.cart.items.filter(item => item.product._id.toString() !== productId);
        req.cart.calculateTotal();
        await req.cart.save();
        res.json(req.cart);
    } catch (error) {
        res.status(500).json({ message: 'Error removing item from cart', error: error.message });
    }
});

// Update item quantity
router.put('/update', passport.authenticate('jwt', { session: false }), getCart, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const item = req.cart.items.find(item => item.product._id.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        item.quantity = quantity;
        req.cart.calculateTotal();
        await req.cart.save();
        res.json(req.cart);
    } catch (error) {
        res.status(500).json({ message: 'Error updating item quantity', error: error.message });
    }
});

// Apply discount
router.post('/apply-discount', passport.authenticate('jwt', { session: false }), getCart, async (req, res) => {
    try {
        const { discountAmount } = req.body;
        const newTotal = req.cart.applyDiscount(discountAmount);
        await req.cart.save();
        res.json({
            message: 'Discount applied',
            subtotal: req.cart.subtotal,
            discount: req.cart.discount,
            newTotal,
            cart: req.cart
        });
    } catch (error) {
        res.status(500).json({ message: 'Error applying discount', error: error.message });
    }
});

// Clear cart
router.post('/clear', passport.authenticate('jwt', { session: false }), getCart, async (req, res) => {
    try {
        req.cart.items = [];
        req.cart.total = 0;
        req.cart.discount = 0;
        await req.cart.save();
        res.json({ message: 'Cart cleared', cart: req.cart });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing cart', error: error.message });
    }
});

module.exports = router;