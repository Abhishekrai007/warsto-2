const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const passport = require('passport');

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Get all products
router.get('/', passport.authenticate("jwt", { session: false }), isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, type, collection, minPrice, maxPrice } = req.query;
        const query = {};

        if (search) query.$text = { $search: search };
        if (type) query.type = type;
        if (collection) query['attributes.collection'] = collection;
        if (minPrice || maxPrice) {
            query['price.amount'] = {};
            if (minPrice) query['price.amount'].$gte = Number(minPrice);
            if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
        }

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            products,
            totalPages,
            totalProducts,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Create a new product (admin only)
router.post('/', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
});

// Update a product (admin only)
router.put('/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
});

// Delete a product (admin only)
router.delete('/:id', passport.authenticate('jwt', { session: false }), isAdmin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

module.exports = router;

/*

POST /products
{
  "name": "New Product",
  "description": "This is a new product",
  "price": 19.99,
  "category": "Electronics"
}

PUT /products/123456789
{
  "name": "Updated Product",
  "description": "This is an updated product",
  "price": 24.99,
  "category": "Electronics"
}

DELETE /products/123456789

*/