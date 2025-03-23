/**
 * Test Email Notification Script
 * 
 * This script tests the email notification functionality by:
 * 1. Creating a test booking in the database
 * 2. Approving the booking (changing status to confirmed)
 * 3. Triggering the email notification to the test email
 */

const { sequelize, User, Service, Booking } = require('./models');
const emailService = require('./utils/emailService');

async function testEmailNotification() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Test email address
    const testEmail = 'rcsiot123456@gmail.com';
    
    // Initialize email service
    const testAccount = await emailService.initializeTransporter();
    console.log('Email service initialized with test account');
    
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
    
    const booking = await Booking.create({
      UserId: testUser.id,
      ServiceId: service.id,
      date: bookingDate,
      time: '14:00:00', // 2:00 PM
      status: 'pending',
      notes: 'This is a test booking for email notification testing'
    });
    
    console.log('Test booking created:', booking.id);
    
    // Simulate approving the booking
    console.log('Approving booking (changing status to confirmed)...');
    await booking.update({ status: 'confirmed' });
    
    // Reload booking with associations
    const approvedBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: User },
        { model: Service }
      ]
    });
    
    // Send confirmation email
    console.log('Sending confirmation email to:', testEmail);
    const emailResult = await emailService.sendBookingConfirmation(
      approvedBooking,
      testUser,
      service
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
testEmailNotification();
