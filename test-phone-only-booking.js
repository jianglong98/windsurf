/**
 * Test Phone-Only Booking Script
 * 
 * This script tests the ability to create a booking with only a phone number (no email)
 */

const { sequelize, User, Service, Booking } = require('./models');

async function testPhoneOnlyBooking() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Test phone number
    const testPhone = '555-987-6543';
    const testName = 'Phone Only Customer';
    
    // Get a service for the booking
    const service = await Service.findOne();
    
    if (!service) {
      console.error('No services found in the database');
      process.exit(1);
    }
    
    console.log('Using service:', service.name);
    
    // Create a test user with only phone number (no email)
    console.log('Creating test user with phone only (no email)...');
    const user = await User.create({
      name: testName,
      email: null, // No email provided
      phone: testPhone,
      isAdmin: false
    });
    
    console.log('Test user created:', {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email
    });
    
    // Create a test booking
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    console.log('Creating test booking for date:', bookingDate);
    
    const booking = await Booking.create({
      UserId: user.id,
      ServiceId: service.id,
      date: bookingDate,
      time: '16:00:00', // 4:00 PM
      status: 'pending',
      notes: 'This is a test booking with phone only (no email)'
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
    
    // Now test approving this booking (which should not send an email)
    console.log('\nUpdating booking status to confirmed...');
    await booking.update({ status: 'confirmed' });
    
    // Fetch the booking with user and service details
    const updatedBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: User },
        { model: Service }
      ]
    });
    
    // Import email service
    const emailService = require('./utils/emailService');
    
    // Initialize email service
    await emailService.initializeTransporter();
    
    // Try to send email notification (should be skipped)
    console.log('\nTesting email notification (should be skipped)...');
    const emailResult = await emailService.sendBookingConfirmation(
      updatedBooking,
      updatedBooking.User,
      updatedBooking.Service
    );
    
    if (emailResult === null) {
      console.log('✅ Email notification was correctly skipped for user without email');
    } else {
      console.error('❌ Email notification was sent even though user has no email!');
    }
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testPhoneOnlyBooking();
