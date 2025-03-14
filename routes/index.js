const express = require('express');
const router = express.Router();
const { Service, BusinessHours } = require('../models');

// Home page
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({ where: { isActive: true } });
    res.render('index', { 
      title: 'Massage Booking Service',
      services,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.render('index', { 
      title: 'Massage Booking Service',
      services: [],
      user: req.session.user || null
    });
  }
});

// About page
router.get('/about', (req, res) => {
  res.render('about', { 
    title: 'About Us',
    user: req.session.user || null
  });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', { 
    title: 'Contact Us',
    user: req.session.user || null
  });
});

// Services page
router.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll({ where: { isActive: true } });
    res.render('services', { 
      title: 'Our Services',
      services,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    req.session.error_msg = 'Failed to load services. Please try again.';
    res.redirect('/');
  }
});

module.exports = router;
