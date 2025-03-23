const express = require('express');
const router = express.Router();
const { User, Service, Booking, BusinessHours } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../utils/emailService');

// Middleware to check if user is authenticated as admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    return next();
  }
  req.session.error_msg = 'You must be logged in as an admin to access this page';
  res.redirect('/admin/login');
};

// Admin login page
router.get('/login', (req, res) => {
  if (req.session.user && req.session.user.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { 
    title: 'Admin Login',
    user: req.session.user || null,
    error_msg: req.session.error_msg || null
  });
  // Clear session error message after displaying
  delete req.session.error_msg;
});

// Admin login process
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, passwordProvided: !!password });
    
    // Validate input
    if (!email || !password) {
      req.session.error_msg = 'Please provide both email and password';
      return res.redirect('/admin/login');
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    console.log('User found:', user ? { id: user.id, email: user.email, isAdmin: user.isAdmin, passwordExists: !!user.password } : 'No user found');
    
    if (!user || !user.isAdmin) {
      req.session.error_msg = 'Invalid email or password';
      return res.redirect('/admin/login');
    }
    
    // Validate password
    const isMatch = await user.validatePassword(password);
    console.log('Password validation result:', isMatch);
    
    if (!isMatch) {
      req.session.error_msg = 'Invalid email or password';
      return res.redirect('/admin/login');
    }
    
    // Set user session (exclude password)
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    };
    
    console.log('Session set:', req.session.user);
    
    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        req.session.error_msg = 'An error occurred during login';
        return res.redirect('/admin/login');
      }
      res.redirect('/admin/dashboard');
    });
  } catch (error) {
    console.error('Login error:', error);
    req.session.error_msg = 'An error occurred during login';
    res.redirect('/admin/login');
  }
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// Admin dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's bookings
    const todayBookings = await Booking.findAll({
      where: { date: today },
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Service, attributes: ['name', 'duration', 'price'] }
      ],
      order: [['time', 'ASC']]
    });
    
    // Get pending bookings
    const pendingBookings = await Booking.findAll({
      where: { 
        status: 'pending',
        date: {
          [Op.gte]: today
        }
      },
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Service, attributes: ['name', 'duration', 'price'] }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.session.user,
      todayBookings,
      pendingBookings
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.session.error_msg = 'Failed to load dashboard data';
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.session.user,
      todayBookings: [],
      pendingBookings: []
    });
  }
});

// All bookings
router.get('/bookings', isAdmin, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const where = {};
    
    // Filter by status if provided
    if (status && ['pending', 'confirmed', 'cancelled'].includes(status)) {
      where.status = status;
    }
    
    // Filter by date range if provided
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: startDate
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: endDate
      };
    }
    
    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Service, attributes: ['name', 'duration', 'price'] }
      ],
      order: [['date', 'DESC'], ['time', 'ASC']]
    });
    
    res.render('admin/bookings', {
      title: 'All Bookings',
      user: req.session.user,
      bookings,
      filters: { status, startDate, endDate }
    });
  } catch (error) {
    console.error('Bookings error:', error);
    req.session.error_msg = 'Failed to load bookings';
    res.redirect('/admin/dashboard');
  }
});

// Update booking status
router.post('/bookings/:id/status', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      req.session.error_msg = 'Invalid status';
      return res.redirect('/admin/bookings');
    }
    
    const booking = await Booking.findByPk(id, {
      include: [
        { model: User },
        { model: Service }
      ]
    });
    
    if (!booking) {
      req.session.error_msg = 'Booking not found';
      return res.redirect('/admin/bookings');
    }
    
    await booking.update({ status });
    
    // Send email notification if booking is confirmed
    if (status === 'confirmed') {
      try {
        // For testing purposes, override the email to the test email
        const testEmail = 'rcsiot123456@gmail.com';
        
        // Check if user has an email address (either original or test)
        if (!booking.User.email && !testEmail) {
          console.log('No email address available for user. Skipping email notification.');
          req.session.success_msg = `Booking status updated to ${status}. No email sent as customer has no email address.`;
        } else {
          const userWithTestEmail = { ...booking.User.dataValues, email: testEmail };
          
          const emailResult = await emailService.sendBookingConfirmation(
            booking,
            userWithTestEmail,
            booking.Service
          );
          
          if (emailResult) {
            console.log('Confirmation email sent:', emailResult);
            req.session.success_msg = `Booking confirmed and notification email sent to ${testEmail}`;
          } else {
            req.session.success_msg = `Booking status updated to ${status}. No email notification sent.`;
          }
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        req.session.success_msg = `Booking status updated to ${status}, but failed to send email notification`;
      }
    } else {
      req.session.success_msg = `Booking status updated to ${status}`;
    }
    
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Update booking error:', error);
    req.session.error_msg = 'Failed to update booking status';
    res.redirect('/admin/bookings');
  }
});

// Services management
router.get('/services', isAdmin, async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['name', 'ASC']]
    });
    
    res.render('admin/services', {
      title: 'Manage Services',
      user: req.session.user,
      services
    });
  } catch (error) {
    console.error('Services error:', error);
    req.session.error_msg = 'Failed to load services';
    res.redirect('/admin/dashboard');
  }
});

// Add new service
router.post('/services', isAdmin, async (req, res) => {
  try {
    const { name, description, duration, price, isActive } = req.body;
    
    // Validate input
    if (!name || !duration || !price) {
      req.session.error_msg = 'Name, duration, and price are required';
      return res.redirect('/admin/services');
    }
    
    await Service.create({
      name,
      description,
      duration: parseInt(duration, 10),
      price: parseFloat(price),
      isActive: isActive === 'on'
    });
    
    req.session.success_msg = 'Service added successfully';
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Add service error:', error);
    req.session.error_msg = 'Failed to add service';
    res.redirect('/admin/services');
  }
});

// Update service
router.post('/services/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, isActive } = req.body;
    
    // Validate input
    if (!name || !duration || !price) {
      req.session.error_msg = 'Name, duration, and price are required';
      return res.redirect('/admin/services');
    }
    
    const service = await Service.findByPk(id);
    
    if (!service) {
      req.session.error_msg = 'Service not found';
      return res.redirect('/admin/services');
    }
    
    await service.update({
      name,
      description,
      duration: parseInt(duration, 10),
      price: parseFloat(price),
      isActive: isActive === 'on'
    });
    
    req.session.success_msg = 'Service updated successfully';
    res.redirect('/admin/services');
  } catch (error) {
    console.error('Update service error:', error);
    req.session.error_msg = 'Failed to update service';
    res.redirect('/admin/services');
  }
});

// Business hours management
router.get('/business-hours', isAdmin, async (req, res) => {
  try {
    const businessHours = await BusinessHours.findAll({
      order: [['dayOfWeek', 'ASC']]
    });
    
    // Create default business hours if none exist
    if (businessHours.length === 0) {
      const defaultHours = [];
      
      for (let day = 0; day < 7; day++) {
        defaultHours.push({
          dayOfWeek: day,
          openTime: '09:00',
          closeTime: '17:00',
          isActive: day !== 0 && day !== 6 // Closed on weekends by default
        });
      }
      
      await BusinessHours.bulkCreate(defaultHours);
      
      return res.redirect('/admin/business-hours');
    }
    
    res.render('admin/business-hours', {
      title: 'Business Hours',
      user: req.session.user,
      businessHours,
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    });
  } catch (error) {
    console.error('Business hours error:', error);
    req.session.error_msg = 'Failed to load business hours';
    res.redirect('/admin/dashboard');
  }
});

// Update business hours
router.post('/business-hours/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { openTime, closeTime, isActive } = req.body;
    
    // Validate input
    if (!openTime || !closeTime) {
      req.session.error_msg = 'Open time and close time are required';
      return res.redirect('/admin/business-hours');
    }
    
    const hours = await BusinessHours.findByPk(id);
    
    if (!hours) {
      req.session.error_msg = 'Business hours not found';
      return res.redirect('/admin/business-hours');
    }
    
    await hours.update({
      openTime,
      closeTime,
      isActive: isActive === 'on'
    });
    
    req.session.success_msg = 'Business hours updated successfully';
    res.redirect('/admin/business-hours');
  } catch (error) {
    console.error('Update business hours error:', error);
    req.session.error_msg = 'Failed to update business hours';
    res.redirect('/admin/business-hours');
  }
});

module.exports = router;
