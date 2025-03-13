const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Booking, Service, BusinessHours } = require('../models');
const { isAdmin } = require('../middleware/auth');

// Admin login routes
router.get('/login', (req, res) => {
    res.render('admin/login');
});

router.post('/login', (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Invalid password' });
    }
});

// Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
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
            group: ['Service.id'],
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
            stats: { total, pending, confirmed, cancelled, thisWeek, revenue },
            popularServices,
            bookings
        });
    } catch (error) {
        req.flash('error', 'Failed to load dashboard');
        res.status(500).render('error', { error: 'Failed to load dashboard' });
    }
});

// Search bookings
router.get('/bookings/search', isAdmin, async (req, res) => {
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
        req.flash('error', 'Failed to search bookings');
        res.status(500).json({ error: 'Failed to search bookings' });
    }
});

// Service management routes
router.get('/services', isAdmin, async (req, res) => {
    try {
        const services = await Service.findAll();
        res.render('admin/services', { services });
    } catch (error) {
        req.flash('error', 'Failed to load services');
        res.status(500).render('error', { error: 'Failed to load services' });
    }
});

router.post('/services', isAdmin, async (req, res) => {
    try {
        const { name, description, duration, price } = req.body;
        await Service.create({ name, description, duration, price });
        req.flash('success', 'Service added successfully');
        res.redirect('/admin/services');
    } catch (error) {
        req.flash('error', 'Failed to add service');
        res.status(500).render('error', { error: 'Failed to add service' });
    }
});

router.post('/services/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, price } = req.body;
        await Service.update(
            { name, description, duration, price },
            { where: { id } }
        );
        req.flash('success', 'Service updated successfully');
        res.redirect('/admin/services');
    } catch (error) {
        req.flash('error', 'Failed to update service');
        res.status(500).render('error', { error: 'Failed to update service' });
    }
});

router.post('/services/:id/delete', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await Service.destroy({ where: { id } });
        req.flash('success', 'Service deleted successfully');
        res.redirect('/admin/services');
    } catch (error) {
        req.flash('error', 'Failed to delete service');
        res.status(500).render('error', { error: 'Failed to delete service' });
    }
});

// Business Hours Management
router.get('/business-hours', isAdmin, async (req, res) => {
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

        res.render('admin/business-hours', { weekday, weekend, specificHours, error: req.flash('error'), success: req.flash('success') });
    } catch (error) {
        console.error('Error loading business hours:', error);
        req.flash('error', 'Failed to load business hours');
        res.redirect('/admin');
    }
});

router.post('/business-hours/default', isAdmin, async (req, res) => {
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
        console.error('Error updating default hours:', error);
        req.flash('error', 'Failed to update default hours');
        res.redirect('/admin/business-hours');
    }
});

router.post('/business-hours/specific', isAdmin, async (req, res) => {
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
        console.error('Error managing specific hours:', error);
        req.flash('error', 'Failed to manage specific hours');
        res.redirect('/admin/business-hours');
    }
});

router.post('/business-hours/specific/:id/delete', isAdmin, async (req, res) => {
    try {
        const result = await BusinessHours.destroy({
            where: {
                id: req.params.id,
                dayType: 'specific'
            }
        });

        if (result > 0) {
            req.flash('success', 'Specific business hours deleted successfully');
        } else {
            req.flash('error', 'Business hours not found');
        }
        res.redirect('/admin/business-hours');
    } catch (error) {
        console.error('Error deleting specific hours:', error);
        req.flash('error', 'Failed to delete specific hours');
        res.redirect('/admin/business-hours');
    }
});

// Update booking status
router.post('/booking/:id/status', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await Booking.update({ status }, { where: { id } });
        req.flash('success', 'Booking status updated successfully');
        res.redirect('/admin/dashboard');
    } catch (error) {
        req.flash('error', 'Failed to update booking status');
        res.status(500).render('error', { error: 'Failed to update booking status' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;
