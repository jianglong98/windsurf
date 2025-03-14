const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const { sequelize } = require('./models');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rate limiting - more lenient settings for development
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // allow more requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting only to admin routes
app.use('/admin', limiter);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    }
}));

// Flash messages
app.use(flash());

// Simple CSRF Protection
app.use((req, res, next) => {
    if (req.method === 'GET') {
        // Generate token for GET requests
        const token = crypto.randomBytes(32).toString('hex');
        req.session.csrfToken = token;
        res.locals.csrfToken = token;
    } else {
        // Validate token for non-GET requests
        const token = req.body._csrf;
        if (!token || token !== req.session.csrfToken) {
            req.flash('error', 'Invalid form submission. Please try again.');
            return res.redirect('back');
        }
    }
    next();
});

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    req.flash('error', 'Something went wrong! Please try again.');
    res.redirect('/admin/login');
});

const PORT = process.env.PORT || 3000;

// Sync database and start server
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
