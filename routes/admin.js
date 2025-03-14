const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, Service, BusinessHours } = require('../models');
const { isAdmin } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Admin login routes
router.get('/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { 
        title: 'Admin Login',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!process.env.ADMIN_PASSWORD_HASH) {
            console.error('ADMIN_PASSWORD_HASH not set in environment');
            req.flash('error', 'Server configuration error');
            return res.redirect('/admin/login');
        }

        const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (match) {
            req.session.isAdmin = true;
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    req.flash('error', 'Login failed. Please try again.');
                    return res.redirect('/admin/login');
                }
                req.flash('success', 'Welcome to admin dashboard');
                res.redirect('/admin/dashboard');
            });
        } else {
            req.flash('error', 'Invalid password');
            res.redirect('/admin/login');
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Authentication error');
        res.redirect('/admin/login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/admin/login');
    });
});

// Protected routes
router.use(isAdmin);

// Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Get basic stats
        const total = await Booking.count();
        const pending = await Booking.count({ where: { status: 'pending' } });
        const confirmed = await Booking.count({ where: { status: 'confirmed' } });
        const cancelled = await Booking.count({ where: { status: 'cancelled' } });

        // Get this week's bookings
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const thisWeek = await Booking.count({
            where: {
                date: {
                    [Op.gte]: startOfWeek
                }
            }
        });

        // Calculate revenue from confirmed bookings
        const confirmedBookings = await Booking.findAll({
            where: { status: 'confirmed' },
            include: [{ model: Service }]
        });
        const revenue = confirmedBookings.reduce((total, booking) => {
            return total + (booking.Service ? booking.Service.price : 0);
        }, 0);

        // Get popular services
        const popularServices = await Booking.findAll({
            where: { status: 'confirmed' },
            include: [{ model: Service }],
            attributes: [
                [Booking.sequelize.fn('COUNT', Booking.sequelize.col('Service.id')), 'count']
            ],
            group: ['Service.id', 'Service.name', 'Service.price'],
            order: [[Booking.sequelize.fn('COUNT', Booking.sequelize.col('Service.id')), 'DESC']],
            limit: 5
        });

        // Get recent bookings
        const bookings = await Booking.findAll({
            include: [{ model: Service }],
            order: [['date', 'DESC']],
            limit: 10
        });

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            stats: { total, pending, confirmed, cancelled, thisWeek, revenue },
            popularServices,
            bookings,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Failed to load dashboard');
        res.redirect('/admin/login');
    }
});

// Search bookings
router.get('/bookings/search', async (req, res) => {
    try {
        const { query, status, dateFrom, dateTo } = req.query;
        const where = {};

        // Add search conditions
        if (query) {
            where[Op.or] = [
                { name: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } }
            ];
        }

        // Add status filter
        if (status && status !== 'all') {
            where.status = status;
        }

        // Add date range filter
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) {
                where.date[Op.gte] = new Date(dateFrom);
            }
            if (dateTo) {
                where.date[Op.lte] = new Date(dateTo);
            }
        }

        const bookings = await Booking.findAll({
            where,
            include: [{ model: Service }],
            order: [['date', 'DESC']]
        });

        res.json(bookings);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search bookings' });
    }
});

// Update booking status
router.post('/booking/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            req.flash('error', 'Invalid status');
            return res.redirect('/admin/dashboard');
        }

        await Booking.update({ status }, { where: { id } });
        req.flash('success', 'Booking status updated successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Status update error:', error);
        req.flash('error', 'Failed to update booking status');
        res.redirect('/admin/dashboard');
    }
});

// Service management routes
router.get('/services', async (req, res) => {
    try {
        const services = await Service.findAll({
            order: [['name', 'ASC']]
        });
        res.render('admin/services', { 
            title: 'Manage Services',
            services,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Services load error:', error);
        req.flash('error', 'Failed to load services');
        res.redirect('/admin/dashboard');
    }
});

router.post('/services', async (req, res) => {
    try {
        const { name, description, duration, price, active } = req.body;
        await Service.create({ 
            name, 
            description, 
            duration: parseInt(duration), 
            price: parseFloat(price),
            active: active === 'on'
        });
        req.flash('success', 'Service added successfully');
        res.redirect('/admin/services');
    } catch (error) {
        console.error('Service create error:', error);
        req.flash('error', 'Failed to add service');
        res.redirect('/admin/services');
    }
});

router.post('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, price, active } = req.body;
        await Service.update(
            { 
                name, 
                description, 
                duration: parseInt(duration), 
                price: parseFloat(price),
                active: active === 'on'
            },
            { where: { id } }
        );
        req.flash('success', 'Service updated successfully');
        res.redirect('/admin/services');
    } catch (error) {
        console.error('Service update error:', error);
        req.flash('error', 'Failed to update service');
        res.redirect('/admin/services');
    }
});

router.post('/services/:id/delete', async (req, res) => {
    try {
        const { id } = req.params;
        await Service.destroy({ where: { id } });
        req.flash('success', 'Service deleted successfully');
        res.redirect('/admin/services');
    } catch (error) {
        console.error('Service delete error:', error);
        req.flash('error', 'Failed to delete service');
        res.redirect('/admin/services');
    }
});

// Business Hours Management
router.get('/business-hours', async (req, res) => {
    try {
        const defaultHours = await BusinessHours.findAll({
            where: {
                date: null
            }
        });

        const weekday = defaultHours.find(h => h.dayType === 'weekday') || {
            openTime: '09:00',
            closeTime: '17:00'
        };

        const weekend = defaultHours.find(h => h.dayType === 'weekend') || {
            openTime: '10:00',
            closeTime: '16:00'
        };

        const specificHours = await BusinessHours.findAll({
            where: {
                dayType: 'specific'
            },
            order: [['date', 'ASC']]
        });

        res.render('admin/business-hours', { 
            title: 'Business Hours',
            weekday, 
            weekend, 
            specificHours,
            error: req.flash('error'),
            success: req.flash('success')
        });
    } catch (error) {
        console.error('Business hours load error:', error);
        req.flash('error', 'Failed to load business hours');
        res.redirect('/admin/dashboard');
    }
});

router.post('/business-hours/default', async (req, res) => {
    try {
        const { weekdayOpen, weekdayClose, weekendOpen, weekendClose } = req.body;

        // Update weekday hours
        await BusinessHours.upsert({
            dayType: 'weekday',
            openTime: weekdayOpen,
            closeTime: weekdayClose,
            date: null
        });

        // Update weekend hours
        await BusinessHours.upsert({
            dayType: 'weekend',
            openTime: weekendOpen,
            closeTime: weekendClose,
            date: null
        });

        req.flash('success', 'Default business hours updated successfully');
        res.redirect('/admin/business-hours');
    } catch (error) {
        console.error('Default hours update error:', error);
        req.flash('error', 'Failed to update default hours');
        res.redirect('/admin/business-hours');
    }
});

router.post('/business-hours/specific', async (req, res) => {
    try {
        const { id, date, openTime, closeTime, description } = req.body;
        
        if (id) {
            // Update existing specific hours
            await BusinessHours.update(
                {
                    openTime,
                    closeTime,
                    description: description || null
                },
                {
                    where: {
                        id,
                        dayType: 'specific'
                    }
                }
            );
            req.flash('success', 'Specific business hours updated successfully');
        } else {
            // Create new specific hours
            await BusinessHours.create({
                date,
                dayType: 'specific',
                openTime,
                closeTime,
                description: description || null
            });
            req.flash('success', 'Specific business hours added successfully');
        }

        res.redirect('/admin/business-hours');
    } catch (error) {
        console.error('Specific hours update error:', error);
        req.flash('error', 'Failed to manage specific hours');
        res.redirect('/admin/business-hours');
    }
});

router.post('/business-hours/specific/:id/delete', async (req, res) => {
    try {
        await BusinessHours.destroy({
            where: {
                id: req.params.id,
                dayType: 'specific'
            }
        });
        req.flash('success', 'Specific business hours deleted successfully');
        res.redirect('/admin/business-hours');
    } catch (error) {
        console.error('Specific hours delete error:', error);
        req.flash('error', 'Failed to delete specific hours');
        res.redirect('/admin/business-hours');
    }
});

module.exports = router;
