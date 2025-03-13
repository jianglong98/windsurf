const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const { sequelize } = require('./models');
const bodyParser = require('body-parser');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session and Flash setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.messages = {
        error: req.flash('error'),
        success: req.flash('success')
    };
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/admin', require('./routes/admin'));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: 'Something went wrong!' });
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
