const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const passport = require('passport');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Create a new order
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { mobileNumber, shippingAddress } = req.body;

        // Validate mobile number
        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            return res.status(400).json({ message: 'Invalid Indian mobile number. Please enter a 10-digit number starting with 6, 7, 8, or 9.' });
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const order = new Order({
            user: req.user._id,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: cart.subtotal,
            discount: cart.discount,
            total: cart.total,
            shippingAddress,
            mobileNumber
        });

        await order.save();

        // Clear the cart
        cart.items = [];
        cart.subtotal = 0;
        cart.discount = 0;
        cart.total = 0;
        await cart.save();

        res.status(201).json({
            message: 'Order created successfully',
            order: order
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Get all orders (admin only)
router.get('/', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.minTotal) filter.total = { $gte: parseFloat(req.query.minTotal) };
        if (req.query.maxTotal) filter.total = { ...filter.total, $lte: parseFloat(req.query.maxTotal) };
        if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

        const orders = await Order.find(filter)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email');

        const totalOrders = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalOrders / limit);

        res.json({
            orders,
            currentPage: page,
            totalPages,
            totalOrders
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Get a specific order (admin only)
router.get('/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// In your orders.js API file
router.put('/:id/status', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {


        const { status, paymentStatus } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

// update payment details
router.put('/:id/payment', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                paymentStatus: 'Paid'
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error updating payment details', error: error.message });
    }
});

// Delete an order (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});

// Get user's order history
router.get('/history', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order history', error: error.message });
    }
});



module.exports = router;

/*

GET /orders

GET /orders/123456789

PUT /orders/123456789/status
{
  "status": "shipped"
}

*/