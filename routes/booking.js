const express = require('express');
const router = express.Router();
const { User, Service, Booking, BusinessHours, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get booking form
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({ where: { isActive: true } });
    const businessHours = await BusinessHours.findAll({ where: { isActive: true } });
    
    res.render('booking/index', { 
      title: 'Book a Massage',
      services,
      businessHours,
      user: req.session.user || null
    });
  } catch (error) {
    console.error('Error loading booking page:', error);
    req.session.error_msg = 'Failed to load booking page. Please try again.';
    res.redirect('/');
  }
});

// Get available time slots for a specific date and service
router.get('/available-slots', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    
    if (!date || !serviceId) {
      return res.status(400).json({ success: false, message: 'Date and service are required' });
    }
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(date).getDay();
    
    // Get business hours for the selected day
    const businessHours = await BusinessHours.findOne({ 
      where: { 
        dayOfWeek,
        isActive: true
      } 
    });
    
    if (!businessHours) {
      return res.json({ success: true, slots: [] }); // No business hours for this day
    }
    
    // Get selected service to determine duration
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    
    // Get existing bookings for the date
    const bookings = await Booking.findAll({
      where: {
        date,
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      include: [{ model: Service }]
    });
    
    // Calculate available time slots
    const slots = generateTimeSlots(
      businessHours.openTime,
      businessHours.closeTime,
      service.duration,
      bookings
    );
    
    res.json({ success: true, slots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available time slots' });
  }
});

// Submit booking
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { name, email, phone, date, time, serviceId, notes } = req.body;
    
    // Validate required fields
    if (!name || !email || !date || !time || !serviceId) {
      req.session.error_msg = 'Please fill in all required fields';
      return res.redirect('/booking');
    }
    
    // Check if the service exists
    const service = await Service.findByPk(serviceId);
    if (!service) {
      req.session.error_msg = 'Selected service is not available';
      return res.redirect('/booking');
    }
    
    // Find or create user
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        phone
      }, { transaction: t });
    } else {
      // Update user information if needed
      await user.update({ name, phone }, { transaction: t });
    }
    
    // Create booking
    await Booking.create({
      date,
      time,
      notes,
      status: 'pending',
      UserId: user.id,
      ServiceId: serviceId
    }, { transaction: t });
    
    await t.commit();
    
    req.session.success_msg = 'Your booking has been submitted successfully. We will confirm your appointment shortly.';
    res.redirect('/');
  } catch (error) {
    await t.rollback();
    console.error('Error creating booking:', error);
    req.session.error_msg = 'Failed to create booking. Please try again.';
    res.redirect('/booking');
  }
});

// Helper function to generate available time slots
function generateTimeSlots(openTime, closeTime, serviceDuration, existingBookings) {
  const slots = [];
  const interval = serviceDuration; // in minutes
  
  // Convert time strings to minutes since midnight
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  
  // Create array of booked time ranges
  const bookedRanges = existingBookings.map(booking => {
    const startMinutes = timeToMinutes(booking.time);
    const endMinutes = startMinutes + booking.Service.duration;
    return { start: startMinutes, end: endMinutes };
  });
  
  // Generate slots
  for (let time = openMinutes; time <= closeMinutes - interval; time += interval) {
    const slotEnd = time + interval;
    
    // Check if slot overlaps with any existing booking
    const isAvailable = !bookedRanges.some(range => 
      (time >= range.start && time < range.end) || 
      (slotEnd > range.start && slotEnd <= range.end) ||
      (time <= range.start && slotEnd >= range.end)
    );
    
    if (isAvailable) {
      slots.push(minutesToTime(time));
    }
  }
  
  return slots;
}

// Helper function to convert time string to minutes since midnight
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes since midnight to time string
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

module.exports = router;
