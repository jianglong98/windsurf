/**
 * API Routes
 * Handles all API endpoints for the application
 */

const express = require('express');
const router = express.Router();
const { User, Service, Booking, BusinessHours, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get available time slots for a specific date and service
router.get('/available-times', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    
    if (!date || !serviceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and service are required' 
      });
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
      return res.json({ 
        success: true, 
        availableTimes: [] 
      }); // No business hours for this day
    }
    
    // Get selected service to determine duration
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid service selected' 
      });
    }
    
    // Get existing bookings for the selected date
    const existingBookings = await Booking.findAll({
      where: {
        date,
        status: {
          [Op.ne]: 'cancelled' // Exclude cancelled bookings
        }
      },
      order: [['time', 'ASC']]
    });
    
    // Generate available time slots
    const slots = generateTimeSlots(
      businessHours.openTime,
      businessHours.closeTime,
      service.duration,
      existingBookings
    );
    
    // Format slots for display
    const availableTimes = slots.map(slot => {
      // Format time for display (e.g., "14:30" to "2:30 PM")
      const [hours, minutes] = slot.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      
      return {
        value: slot,
        display: `${displayHour}:${minutes} ${ampm}`
      };
    });
    
    res.json({ 
      success: true, 
      availableTimes 
    });
    
  } catch (error) {
    console.error('Error fetching available times:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch available times' 
    });
  }
});

// Helper function to generate available time slots
function generateTimeSlots(openTime, closeTime, serviceDuration, existingBookings) {
  // Convert times to minutes since midnight for easier calculation
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  
  // Create slots at 30-minute intervals
  const slots = [];
  const interval = 30; // 30 minutes between slots
  
  for (let time = openMinutes; time <= closeMinutes - serviceDuration; time += interval) {
    // Check if this slot conflicts with any existing booking
    const slotEndTime = time + serviceDuration;
    let isAvailable = true;
    
    for (const booking of existingBookings) {
      const bookingStartTime = timeToMinutes(booking.time);
      const bookingEndTime = bookingStartTime + (booking.serviceDuration || 60); // Default to 60 if not specified
      
      // Check for overlap
      if ((time >= bookingStartTime && time < bookingEndTime) || 
          (slotEndTime > bookingStartTime && slotEndTime <= bookingEndTime) ||
          (time <= bookingStartTime && slotEndTime >= bookingEndTime)) {
        isAvailable = false;
        break;
      }
    }
    
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
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

module.exports = router;
