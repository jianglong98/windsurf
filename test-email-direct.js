/**
 * Direct Email Test Script
 * 
 * This script directly tests the email notification functionality by:
 * 1. Finding an existing booking (regardless of status)
 * 2. Sending a test email notification for that booking
 */

const { sequelize, User, Service, Booking } = require('./models');
const emailService = require('./utils/emailService');

async function testEmailDirect() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Initialize email service
    const testAccount = await emailService.initializeTransporter();
    console.log('Email service initialized with test account');
    
    // Test email address
    const testEmail = 'rcsiot123456@gmail.com';
    
    // Find any booking with its related user and service
    const booking = await Booking.findOne({
      include: [
        { model: User },
        { model: Service }
      ]
    });
    
    if (!booking) {
      console.error('No bookings found in the database');
      return;
    }
    
    console.log('Using existing booking:', {
      id: booking.id,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      userName: booking.User.name,
      userEmail: booking.User.email,
      serviceName: booking.Service.name
    });
    
    // Create a test user object with the test email
    const testUser = { ...booking.User.dataValues, email: testEmail };
    
    console.log('Sending test email to:', testEmail);
    
    // Send the email notification
    const emailResult = await emailService.sendBookingConfirmation(
      booking,
      testUser,
      booking.Service
    );
    
    console.log('Email sent successfully!');
    console.log('Preview URL:', emailResult.previewUrl);
    console.log('\nTest account credentials for viewing email:');
    console.log('Username:', testAccount.user);
    console.log('Password:', testAccount.pass);
    console.log('Web interface: https://ethereal.email');
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the test
testEmailDirect();
