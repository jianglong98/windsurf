/**
 * Create Pending Booking Script
 * 
 * This script creates a pending booking in the database for testing purposes.
 */

const { sequelize, User, Service, Booking } = require('./models');

async function createPendingBooking() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Test email address
    const testEmail = 'rcsiot123456@gmail.com';
    
    // Find or create a test user
    let testUser = await User.findOne({ where: { email: testEmail } });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Test Customer',
        email: testEmail,
        password: 'password123',
        phone: '555-123-4567',
        isAdmin: false
      });
      console.log('Test user created:', testUser.email);
    } else {
      console.log('Using existing test user:', testUser.email);
    }
    
    // Get a service for the booking
    const service = await Service.findOne();
    
    if (!service) {
      console.error('No services found in the database');
      process.exit(1);
    }
    
    console.log('Using service:', service.name);
    
    // Create a test booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    console.log('Creating test booking for date:', bookingDate);
    
    // First, update any existing pending bookings to cancelled to avoid clutter
    await Booking.update(
      { status: 'cancelled' },
      { where: { status: 'pending' } }
    );
    
    const booking = await Booking.create({
      UserId: testUser.id,
      ServiceId: service.id,
      date: bookingDate,
      time: '14:00:00', // 2:00 PM
      status: 'pending',
      notes: 'This is a test booking for email notification testing'
    });
    
    console.log('Test booking created:', booking.id);
    console.log('Booking details:', {
      id: booking.id,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      userId: booking.UserId,
      serviceId: booking.ServiceId
    });
    
    console.log('\nTest booking created successfully!');
    
  } catch (error) {
    console.error('Error creating test booking:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the function
createPendingBooking();
