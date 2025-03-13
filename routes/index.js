const express = require('express');
const router = express.Router();
const { BusinessHours, Service, Booking } = require('../models');

// Home page
router.get('/', async (req, res) => {
    try {
        const services = await Service.findAll();
        res.render('index', { services });
    } catch (error) {
        req.flash('error', 'Failed to load services');
        res.status(500).render('error', { error: 'Failed to load services' });
    }
});

// Services page
router.get('/services', async (req, res) => {
    try {
        const services = await Service.findAll();
        res.render('services', { services });
    } catch (error) {
        req.flash('error', 'Failed to load services');
        res.status(500).render('error', { error: 'Failed to load services' });
    }
});

// Booking page
router.get('/booking', async (req, res) => {
    try {
        const services = await Service.findAll();
        res.render('booking', { services });
    } catch (error) {
        req.flash('error', 'Failed to load booking page');
        res.status(500).render('error', { error: 'Failed to load booking page' });
    }
});

// Create booking
router.post('/booking', async (req, res) => {
    try {
        const { name, email, date, time, serviceId } = req.body;
        
        // Validate the booking time against business hours
        const specificHours = await BusinessHours.findOne({
            where: {
                date,
                dayType: 'specific'
            }
        });

        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const defaultHours = await BusinessHours.findOne({
            where: {
                dayType: isWeekend ? 'weekend' : 'weekday',
                date: null
            }
        });

        const hours = specificHours || defaultHours;
        
        if (!hours) {
            req.flash('error', 'We are not open on this date');
            return res.redirect('/booking');
        }

        // Check if the booking time is within business hours
        const bookingTime = parseInt(time.replace(':', ''));
        const openTime = parseInt(hours.openTime.replace(':', ''));
        const closeTime = parseInt(hours.closeTime.replace(':', ''));

        if (bookingTime < openTime || bookingTime > closeTime) {
            req.flash('error', 'Selected time is outside business hours');
            return res.redirect('/booking');
        }

        // Create the booking
        await Booking.create({
            name,
            email,
            date,
            time,
            ServiceId: serviceId,
            status: 'pending'
        });

        req.flash('success', 'Booking created successfully');
        res.redirect('/confirmation');
    } catch (error) {
        console.error('Error creating booking:', error);
        req.flash('error', 'Failed to create booking');
        res.redirect('/booking');
    }
});

// Confirmation page
router.get('/confirmation', (req, res) => {
    res.render('confirmation', {
        success: req.flash('success')
    });
});

// Check availability
router.get('/availability', async (req, res) => {
    try {
        const { date } = req.query;
        
        // First check for specific hours on the given date
        const specificHours = await BusinessHours.findOne({
            where: {
                date,
                dayType: 'specific'
            }
        });

        if (specificHours) {
            return res.json({
                available: true,
                hours: {
                    open: specificHours.openTime,
                    close: specificHours.closeTime
                }
            });
        }

        // If no specific hours, check default hours based on weekday/weekend
        const dayOfWeek = new Date(date).getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        const defaultHours = await BusinessHours.findOne({
            where: {
                dayType: isWeekend ? 'weekend' : 'weekday',
                date: null
            }
        });

        if (defaultHours) {
            return res.json({
                available: true,
                hours: {
                    open: defaultHours.openTime,
                    close: defaultHours.closeTime
                }
            });
        }

        res.json({
            available: false,
            message: 'No business hours set for this date'
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            available: false,
            message: 'Error checking availability'
        });
    }
});

module.exports = router;
