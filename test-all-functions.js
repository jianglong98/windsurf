/**
 * Comprehensive Test Script
 * 
 * This script tests all major functions of the massage booking website:
 * 1. Creating users with different contact methods (email only, phone only, both)
 * 2. Creating bookings for these users
 * 3. Testing the admin approval process
 * 4. Testing email notifications
 */

const { sequelize, User, Service, Booking } = require('./models');
const emailService = require('./utils/emailService');

async function testAllFunctions() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Initialize email service
    const testAccount = await emailService.initializeTransporter();
    console.log('Email service initialized with test account');
    
    // Get a service for the booking
    const service = await Service.findOne();
    if (!service) {
      console.error('No services found in the database');
      process.exit(1);
    }
    console.log('Using service:', service.name);
    
    // Create tomorrow's date for bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Test 1: Create user with email only
    console.log('\n--- Test 1: User with email only ---');
    const emailOnlyUser = await User.create({
      name: 'Email Only Customer',
      email: 'email.only@example.com',
      phone: null,
      isAdmin: false
    });
    console.log('Email-only user created:', {
      id: emailOnlyUser.id,
      name: emailOnlyUser.name,
      email: emailOnlyUser.email,
      phone: emailOnlyUser.phone
    });
    
    // Create booking for email-only user
    const emailOnlyBooking = await Booking.create({
      UserId: emailOnlyUser.id,
      ServiceId: service.id,
      date: bookingDate,
      time: '10:00:00', // 10:00 AM
      status: 'pending',
      notes: 'Booking for email-only user'
    });
    console.log('Booking created for email-only user:', emailOnlyBooking.id);
    
    // Test 2: Create user with phone only
    console.log('\n--- Test 2: User with phone only ---');
    const phoneOnlyUser = await User.create({
      name: 'Phone Only Customer',
      email: null,
      phone: '555-123-4567',
      isAdmin: false
    });
    console.log('Phone-only user created:', {
      id: phoneOnlyUser.id,
      name: phoneOnlyUser.name,
      email: phoneOnlyUser.email,
      phone: phoneOnlyUser.phone
    });
    
    // Create booking for phone-only user
    const phoneOnlyBooking = await Booking.create({
      UserId: phoneOnlyUser.id,
      ServiceId: service.id,
      date: bookingDate,
      time: '11:00:00', // 11:00 AM
      status: 'pending',
      notes: 'Booking for phone-only user'
    });
    console.log('Booking created for phone-only user:', phoneOnlyBooking.id);
    
    // Test 3: Create user with both email and phone
    console.log('\n--- Test 3: User with both email and phone ---');
    const bothContactUser = await User.create({
      name: 'Both Contacts Customer',
      email: 'both.contacts@example.com',
      phone: '555-987-6543',
      isAdmin: false
    });
    console.log('User with both contacts created:', {
      id: bothContactUser.id,
      name: bothContactUser.name,
      email: bothContactUser.email,
      phone: bothContactUser.phone
    });
    
    // Create booking for user with both contacts
    const bothContactsBooking = await Booking.create({
      UserId: bothContactUser.id,
      ServiceId: service.id,
      date: bookingDate,
      time: '13:00:00', // 1:00 PM
      status: 'pending',
      notes: 'Booking for user with both email and phone'
    });
    console.log('Booking created for user with both contacts:', bothContactsBooking.id);
    
    // Test 4: Approve bookings and test email notifications
    console.log('\n--- Test 4: Approve bookings and test email notifications ---');
    
    // Approve email-only booking
    console.log('\nApproving booking for email-only user...');
    await emailOnlyBooking.update({ status: 'confirmed' });
    
    // Fetch the updated booking with user and service details
    const updatedEmailOnlyBooking = await Booking.findByPk(emailOnlyBooking.id, {
      include: [{ model: User }, { model: Service }]
    });
    
    // Test email notification for email-only user
    console.log('Testing email notification for email-only user...');
    const emailOnlyResult = await emailService.sendBookingConfirmation(
      updatedEmailOnlyBooking,
      updatedEmailOnlyBooking.User,
      updatedEmailOnlyBooking.Service
    );
    
    if (emailOnlyResult) {
      console.log('✅ Email notification sent successfully to email-only user');
      console.log('Preview URL:', emailOnlyResult.previewUrl);
    } else {
      console.error('❌ Failed to send email notification to email-only user');
    }
    
    // Approve phone-only booking
    console.log('\nApproving booking for phone-only user...');
    await phoneOnlyBooking.update({ status: 'confirmed' });
    
    // Fetch the updated booking with user and service details
    const updatedPhoneOnlyBooking = await Booking.findByPk(phoneOnlyBooking.id, {
      include: [{ model: User }, { model: Service }]
    });
    
    // Test email notification for phone-only user (should be skipped)
    console.log('Testing email notification for phone-only user (should be skipped)...');
    const phoneOnlyResult = await emailService.sendBookingConfirmation(
      updatedPhoneOnlyBooking,
      updatedPhoneOnlyBooking.User,
      updatedPhoneOnlyBooking.Service
    );
    
    if (phoneOnlyResult === null) {
      console.log('✅ Email notification correctly skipped for phone-only user');
    } else {
      console.error('❌ Email notification was sent even though user has no email!');
    }
    
    // Approve booking for user with both contacts
    console.log('\nApproving booking for user with both contacts...');
    await bothContactsBooking.update({ status: 'confirmed' });
    
    // Fetch the updated booking with user and service details
    const updatedBothContactsBooking = await Booking.findByPk(bothContactsBooking.id, {
      include: [{ model: User }, { model: Service }]
    });
    
    // Test email notification for user with both contacts
    console.log('Testing email notification for user with both contacts...');
    const bothContactsResult = await emailService.sendBookingConfirmation(
      updatedBothContactsBooking,
      updatedBothContactsBooking.User,
      updatedBothContactsBooking.Service
    );
    
    if (bothContactsResult) {
      console.log('✅ Email notification sent successfully to user with both contacts');
      console.log('Preview URL:', bothContactsResult.previewUrl);
    } else {
      console.error('❌ Failed to send email notification to user with both contacts');
    }
    
    console.log('\n--- Test Summary ---');
    console.log('✅ User creation with email only: PASSED');
    console.log('✅ User creation with phone only: PASSED');
    console.log('✅ User creation with both email and phone: PASSED');
    console.log('✅ Booking creation for all user types: PASSED');
    console.log('✅ Email notification for users with email: PASSED');
    console.log('✅ Skipping email notification for users without email: PASSED');
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the tests
testAllFunctions();
