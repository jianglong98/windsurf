/**
 * Email Service Utility
 * 
 * This module provides functionality to send emails to customers
 * when their bookings are approved or for other notifications.
 */

const nodemailer = require('nodemailer');

// Create a test account for development
// In production, you would use actual SMTP credentials
let transporter;

// Initialize the email transporter
async function initializeTransporter() {
  // For development/testing, create a test account with Ethereal
  const testAccount = await nodemailer.createTestAccount();
  
  // Create a transporter using the test account
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  
  console.log('Email service initialized with test account');
  console.log('Test account credentials:', {
    user: testAccount.user,
    pass: testAccount.pass,
    preview: 'https://ethereal.email'
  });
  
  return testAccount;
}

/**
 * Send booking confirmation email to customer
 * 
 * @param {Object} booking - The booking object with all details
 * @param {Object} user - The user who made the booking
 * @param {Object} service - The service that was booked
 * @returns {Promise} - Promise with the email send info
 */
async function sendBookingConfirmation(booking, user, service) {
  if (!transporter) {
    await initializeTransporter();
  }
  
  // Format date and time for email
  const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format time (assuming time is stored as HH:MM:SS)
  const timeParts = booking.time.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
  
  // Create email content
  const mailOptions = {
    from: '"Quality Massage LLC" <bookings@qualitymassage.com>',
    to: user.email,
    subject: 'Your Massage Booking Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4a6da7;">Quality Massage LLC</h1>
          <p style="font-size: 18px; color: #333;">Your booking has been approved!</p>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h2 style="color: #4a6da7; margin-top: 0;">Booking Details</h2>
          <p><strong>Service:</strong> ${service.name}</p>
          <p><strong>Date:</strong> ${bookingDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
          <p><strong>Duration:</strong> ${service.duration} minutes</p>
          <p><strong>Price:</strong> $${service.price}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4a6da7;">Appointment Location</h3>
          <p>Quality Massage LLC</p>
          <p>123 Relaxation Ave</p>
          <p>Denver, CO 80202</p>
          <p>Phone: (719) 930-9548</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h3 style="color: #4a6da7; margin-top: 0;">Appointment Policies</h3>
          <p><strong>Cancellation Policy:</strong> Please provide at least 24 hours notice for cancellations to avoid a cancellation fee.</p>
          <p><strong>Late Arrival:</strong> If you arrive late, your session may be shortened to accommodate other scheduled appointments.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #777; font-size: 14px;">
          <p>Thank you for choosing Quality Massage LLC!</p>
          <p>If you have any questions, please contact us at (719) 930-9548 or reply to this email.</p>
        </div>
      </div>
    `
  };
  
  // Send the email
  const info = await transporter.sendMail(mailOptions);
  
  console.log('Booking confirmation email sent to:', user.email);
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

// Export the functions
module.exports = {
  initializeTransporter,
  sendBookingConfirmation
};
