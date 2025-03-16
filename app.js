const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { sequelize } = require('./models');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'massage-booking-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Global middleware for template variables
app.use((req, res, next) => {
  // Make user info available to all templates
  res.locals.user = req.session.user || null;
  
  // Flash messages middleware
  res.locals.success_msg = req.session.success_msg;
  res.locals.error_msg = req.session.error_msg;
  
  // Clear flash messages after they've been sent to the template
  delete req.session.success_msg;
  delete req.session.error_msg;
  
  // Add current year for footer copyright
  res.locals.currentYear = new Date().getFullYear();
  
  // Add business name for global use
  res.locals.businessName = "Quality Massage LLC";
  
  // Add business address for global use
  res.locals.businessAddress = {
    street: "12229 Voyager Pkwy #160",
    city: "Colorado Springs",
    state: "CO",
    zip: "80921",
    full: "12229 Voyager Pkwy #160, Colorado Springs, CO 80921"
  };
  
  // Add business contact information for global use
  res.locals.businessPhone = "(719) 900-8424";
  res.locals.businessEmail = "yilinzhang1969@gmail.com";
  
  // Add active path for navigation highlighting
  res.locals.path = req.path;
  
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/booking', require('./routes/booking'));
app.use('/admin', require('./routes/admin'));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', {
    title: '404 Not Found',
    message: 'The page you requested could not be found.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).render('error', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong on our end.' 
      : err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start server
const PORT = process.env.PORT || 3000;

// Sync database and start server
const startServer = async () => {
  try {
    await sequelize.sync();
    console.log('Database synced successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();

module.exports = app; // For testing purposes
