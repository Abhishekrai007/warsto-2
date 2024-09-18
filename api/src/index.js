const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require("axios")
const cors = require('cors');
const multer = require("multer")
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const dotenv = require('dotenv');
const session = require('express-session');
const cartRoutes = require('./routes/cart');
const reviewsRouter = require('./routes/reviews');
const ordersRouter = require('./routes/orders');
const User = require('./models/User');
const wishlistRoutes = require('./routes/whishlist');
const adminProducts = require("./admin/products")
const adminReviews = require("./admin/reviews")
const adminOrders = require("./admin/orders")
const adminAnalytics = require("./admin/analytics");
const adminInventory = require("./admin/inventory")
const adminUsers = require("./admin/users")
const rateLimit = require("express-rate-limit")
const jwt = require("jsonwebtoken")
// const Product = require("./products")
dotenv.config();

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const products = [
    {
        "sku": "W001",
        "name": "Modern Wardrobe",
        "description": "A sleek modern wardrobe with ample storage.",
        "type": "Wardrobe",
        "price": {
            "amount": "12000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "15",
            "reserved": "3"
        },
        "categories": ["Wardrobe", "Modern"],
        "attributes": {
            "collection": "opulence",
            "material": "Wood",
            "color": {
                "family": "Brown",
                "shade": "Dark Brown"
            },
            "dimensions": {
                "length": "200",
                "width": "80",
                "height": "210",
                "unit": "cm"
            },
            "configuration": "2-door"
        },
        "designer": {
            "name": "John Doe",
            "royalty": "10"
        },
        "images": [
            {
                "url": "https://example.com/images/W001.jpg",
                "altText": "Modern Wardrobe",
                "isPrimary": "true"
            }
        ],
        "tags": ["wardrobe", "storage"],
        "features": ["spacious", "durable"]
    },
    {
        "sku": "S001",
        "name": "Compact Storage Cabinet",
        "description": "Compact and minimal storage solution.",
        "type": "Storage",
        "price": {
            "amount": "8000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "25",
            "reserved": "5"
        },
        "categories": ["Storage", "Minimal"],
        "attributes": {
            "collection": "nexgen",
            "material": "Metal",
            "color": {
                "family": "White",
                "shade": "Off White"
            },
            "dimensions": {
                "length": "150",
                "width": "60",
                "height": "170",
                "unit": "cm"
            },
            "configuration": "Single-door"
        },
        "designer": {
            "name": "Jane Smith",
            "royalty": "8"
        },
        "images": [
            {
                "url": "https://example.com/images/S001.jpg",
                "altText": "Compact Storage Cabinet",
                "isPrimary": "true"
            }
        ],
        "tags": ["storage", "compact"],
        "features": ["lightweight", "minimalist"]
    },
    {
        "sku": "W002",
        "name": "Vintage Wooden Wardrobe",
        "description": "Beautiful vintage style wardrobe made of solid wood.",
        "type": "Wardrobe",
        "price": {
            "amount": "15000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "10",
            "reserved": "2"
        },
        "categories": ["Wardrobe", "Vintage"],
        "attributes": {
            "collection": "smartspace",
            "material": "Oak Wood",
            "color": {
                "family": "Natural",
                "shade": "Light Brown"
            },
            "dimensions": {
                "length": "210",
                "width": "90",
                "height": "220",
                "unit": "cm"
            },
            "configuration": "3-door"
        },
        "designer": {
            "name": "Chris Turner",
            "royalty": "12"
        },
        "images": [
            {
                "url": "https://example.com/images/W002.jpg",
                "altText": "Vintage Wooden Wardrobe",
                "isPrimary": "true"
            }
        ],
        "tags": ["wardrobe", "vintage", "wooden"],
        "features": ["durable", "classic"]
    },
    {
        "sku": "S002",
        "name": "Minimalist Storage Shelf",
        "description": "A modern, open storage shelf with a minimalist design.",
        "type": "Storage",
        "price": {
            "amount": "5000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "20",
            "reserved": "4"
        },
        "categories": ["Storage", "Minimalist"],
        "attributes": {
            "collection": "sytleshift",
            "material": "Steel",
            "color": {
                "family": "Black",
                "shade": "Matte Black"
            },
            "dimensions": {
                "length": "120",
                "width": "40",
                "height": "180",
                "unit": "cm"
            },
            "configuration": "5-tier"
        },
        "designer": {
            "name": "Lena Black",
            "royalty": "7"
        },
        "images": [
            {
                "url": "https://example.com/images/S002.jpg",
                "altText": "Minimalist Storage Shelf",
                "isPrimary": "true"
            }
        ],
        "tags": ["storage", "shelf", "minimalist"],
        "features": ["modern", "versatile"]
    },
    {
        "sku": "W003",
        "name": "Luxury Wardrobe with Mirror",
        "description": "A luxury wardrobe with integrated mirror doors.",
        "type": "Wardrobe",
        "price": {
            "amount": "18000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "8",
            "reserved": "1"
        },
        "categories": ["Wardrobe", "Luxury"],
        "attributes": {
            "collection": "sovereign",
            "material": "Teak Wood",
            "color": {
                "family": "Mahogany",
                "shade": "Rich Red"
            },
            "dimensions": {
                "length": "230",
                "width": "100",
                "height": "240",
                "unit": "cm"
            },
            "configuration": "4-door"
        },
        "designer": {
            "name": "Peter Novak",
            "royalty": "15"
        },
        "images": [
            {
                "url": "https://example.com/images/W003.jpg",
                "altText": "Luxury Wardrobe with Mirror",
                "isPrimary": "true"
            }
        ],
        "tags": ["wardrobe", "mirror", "luxury"],
        "features": ["mirror", "high-end"]
    },

    {
        "sku": "S003",
        "name": "Elegant Storage Chest",
        "description": "A beautifully designed chest for compact storage.",
        "type": "Storage",
        "price": {
            "amount": "7000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "18",
            "reserved": "2"
        },
        "categories": ["Storage", "Elegant"],
        "attributes": {
            "collection": "ornate",
            "material": "Birch Wood",
            "color": {
                "family": "White",
                "shade": "Ivory"
            },
            "dimensions": {
                "length": "120",
                "width": "50",
                "height": "75",
                "unit": "cm"
            },
            "configuration": "Chest"
        },
        "designer": {
            "name": "Alex Grey",
            "royalty": "9"
        },
        "images": [
            {
                "url": "https://example.com/images/S003.jpg",
                "altText": "Elegant Storage Chest",
                "isPrimary": "true"
            }
        ],
        "tags": ["storage", "elegant", "chest"],
        "features": ["compact", "stylish"]
    },
    {
        "sku": "W004",
        "name": "Spacious Wardrobe",
        "description": "A large wardrobe with ample hanging space.",
        "type": "Wardrobe",
        "price": {
            "amount": "22000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "5",
            "reserved": "1"
        },
        "categories": ["Wardrobe", "Spacious"],
        "attributes": {
            "collection": "opulence",
            "material": "Maple Wood",
            "color": {
                "family": "Light Brown",
                "shade": "Beige"
            },
            "dimensions": {
                "length": "250",
                "width": "120",
                "height": "240",
                "unit": "cm"
            },
            "configuration": "5-door"
        },
        "designer": {
            "name": "Sophia King",
            "royalty": "12"
        },
        "images": [
            {
                "url": "https://example.com/images/W004.jpg",
                "altText": "Spacious Wardrobe",
                "isPrimary": "true"
            }
        ],
        "tags": ["wardrobe", "spacious", "large"],
        "features": ["luxurious", "extra-large"]
    },
    {
        "sku": "S004",
        "name": "Rustic Storage Bench",
        "description": "A rustic storage bench for added seating and storage.",
        "type": "Storage",
        "price": {
            "amount": "9500",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "12",
            "reserved": "3"
        },
        "categories": ["Storage", "Rustic"],
        "attributes": {
            "collection": "nexgen",
            "material": "Pine Wood",
            "color": {
                "family": "Brown",
                "shade": "Chestnut"
            },
            "dimensions": {
                "length": "160",
                "width": "50",
                "height": "45",
                "unit": "cm"
            },
            "configuration": "Bench"
        },
        "designer": {
            "name": "Ethan Taylor",
            "royalty": "10"
        },
        "images": [
            {
                "url": "https://example.com/images/S004.jpg",
                "altText": "Rustic Storage Bench",
                "isPrimary": "true"
            }
        ],
        "tags": ["storage", "bench", "rustic"],
        "features": ["dual-purpose", "seating and storage"]
    },
    {
        "sku": "W005",
        "name": "Contemporary Wardrobe",
        "description": "A sleek, modern wardrobe for contemporary interiors.",
        "type": "Wardrobe",
        "price": {
            "amount": "25000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "7",
            "reserved": "2"
        },
        "categories": ["Wardrobe", "Contemporary"],
        "attributes": {
            "collection": "smartspace",
            "material": "Ash Wood",
            "color": {
                "family": "Grey",
                "shade": "Charcoal"
            },
            "dimensions": {
                "length": "240",
                "width": "110",
                "height": "230",
                "unit": "cm"
            },
            "configuration": "3-door"
        },
        "designer": {
            "name": "Olivia Bennett",
            "royalty": "14"
        },
        "images": [
            {
                "url": "https://example.com/images/W005.jpg",
                "altText": "Contemporary Wardrobe",
                "isPrimary": "true"
            }
        ],
        "tags": ["wardrobe", "contemporary", "modern"],
        "features": ["sleek", "minimalist"]
    },
    {
        "sku": "S005",
        "name": "Wooden Storage Rack",
        "description": "A wooden storage rack for versatile use.",
        "type": "Storage",
        "price": {
            "amount": "6000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "20",
            "reserved": "4"
        },
        "categories": ["Storage", "Wooden"],
        "attributes": {
            "collection": "styleshift",
            "material": "Oak",
            "color": {
                "family": "Brown",
                "shade": "Light Oak"
            },
            "dimensions": {
                "length": "150",
                "width": "40",
                "height": "180",
                "unit": "cm"
            },
            "configuration": "4-tier"
        },
        "designer": {
            "name": "Grace Miller",
            "royalty": "9"
        },
        "images": [
            {
                "url": "https://example.com/images/S005.jpg",
                "altText": "Wooden Storage Rack",
                "isPrimary": "true"
            }
        ],
        "tags": ["storage", "wooden", "rack"],
        "features": ["versatile", "durable"]
    },
    {
        "sku": "W006",
        "name": "Artisan Crafted Wardrobe",
        "description": "Handcrafted wardrobe with artistic design.",
        "type": "Wardrobe",
        "price": {
            "amount": "27000",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "5",
            "reserved": "1"
        },
        "categories": ["Wardrobe", "Artisan"],
        "attributes": {
            "collection": "sovereign",
            "material": "Mahogany",
            "color": {
                "family": "Red",
                "shade": "Crimson"
            },
            "dimensions": {
                "length": "220",
                "width": "100",
                "height": "230",
                "unit": "cm"
            },
            "configuration": "2-door"
        },
        "designer": {
            "name": "Zara Lee",
            "royalty": "15"
        },
        "images": [
            {
                "url": "https://example.com/images/W006.jpg",
                "altText": "Artisan Crafted Wardrobe",
                "isPrimary": "true"
            }
        ],
        "tags": ["wardrobe", "artisan", "handmade"],
        "features": ["artistic", "luxury"]
    },
    {
        "sku": "S006",
        "name": "Foldable Storage Box",
        "description": "Convenient foldable storage box for easy organization.",
        "type": "Storage",
        "price": {
            "amount": "2500",
            "currency": "INR"
        },
        "inventory": {
            "quantity": "50",
            "reserved": "10"
        },
        "categories": ["Storage", "Foldable"],
        "attributes": {
            "collection": "ornate",
            "material": "Fabric",
            "color": {
                "family": "Blue",
                "shade": "Navy Blue"
            },
            "dimensions": {
                "length": "40",
                "width": "40",
                "height": "40",
                "unit": "cm"
            },
            "configuration": "Box"
        },
        "designer": {
            "name": "Emma Wood",
            "royalty": "5"
        },
        "images": [
            {
                "url": "https://example.com/images/S006.jpg",
                "altText": "Foldable Storage Box",
                "isPrimary": "true"
            }
        ],
        "tags": ["storage", "foldable", "box"],
        "features": ["convenient", "portable"]
    },
    // Add more until 30


]


// Middleware
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());

// JWT strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        console.log("JWT payload:", payload);  // Add this line
        const user = await User.findById(payload.id);
        console.log("User found:", user ? "Yes" : "No");
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        console.error("Error in JWT strategy:", error);
        return done(error, false);
    }
}));

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// axios.post('http://localhost:5000/api/products/bulk', products)
//     .then(response => console.log(response.data))
//     .catch(error => console.error('Error:', error.response.data));

app.use("/api/", apiLimiter)
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewsRouter);
app.use('/api/orders', ordersRouter);
app.use("/api/admin/products", adminProducts)
app.use("/api/admin/reviews", adminReviews)
app.use("/api/admin/orders", adminOrders)
app.use("/api/admin/analytics", adminAnalytics)
app.use("/api/admin/users", adminUsers)
app.use("/api/admin/inventory", adminInventory)
app.use('/uploads', express.static('uploads'));
app.use('/api/wishlist', wishlistRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;