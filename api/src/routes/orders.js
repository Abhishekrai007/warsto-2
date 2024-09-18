const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const passport = require('passport');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const jwt = require("jsonwebtoken")




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

router.post('/create-razorpay-order', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { shippingAddress, billingAddress, deliveryOption, mobileNumber } = req.body;

        // Validate mobile number
        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            return res.status(400).json({ message: 'Invalid Indian mobile number. Please enter a 10-digit number starting with 6, 7, 8, or 9.' });
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const deliveryFee = deliveryOption === 'express' ? 100 : 0;
        const total = cart.total + deliveryFee;

        const options = {
            amount: total * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_receipt_" + Date.now(),
            payment_capture: 1,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Create an Order document
        const order = new Order({
            user: req.user._id,
            items: cart.items.map(item => ({
                product: item.product._id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price
            })),
            subtotal: cart.subtotal,
            discount: cart.discount,
            deliveryFee,
            total,
            shippingAddress,
            billingAddress,
            deliveryOption,
            mobileNumber,
            razorpayOrderId: razorpayOrder.id
        });

        await order.save();

        res.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            order: order
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
    }
});

router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is verified
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Update order status
            order.status = 'Processing';
            order.paymentStatus = 'Paid';
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();

            // Clear the cart
            await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [], total: 0, discount: 0 } });

            res.json({
                success: true,
                message: 'Payment has been verified',
                order: order
            });
        } else {
            res.json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        console.error('Error in payment verification:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
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

// Get a specific order
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});
// Update order status (admin only)
router.put('/:id/status', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Add admin check here
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
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

module.exports = router;