/**
 * Test Admin Booking Approval Script
 * 
 * This script tests the admin booking approval process by:
 * 1. Logging in as an admin
 * 2. Navigating to the bookings page
 * 3. Approving a pending booking
 * 4. Verifying the email notification is sent
 */

const puppeteer = require('puppeteer');
const { sequelize, User, Service, Booking } = require('./models');

async function testAdminApproveBooking() {
  let browser;
  
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Test email address
    const testEmail = 'rcsiot123456@gmail.com';
    
    // Create a test booking if one doesn't exist
    const pendingBooking = await Booking.findOne({
      where: { status: 'pending' },
      include: [{ model: User }, { model: Service }]
    });
    
    if (!pendingBooking) {
      console.log('No pending bookings found. Creating a test booking...');
      
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
      }
      
      // Get a service for the booking
      const service = await Service.findOne();
      
      // Create a test booking
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const bookingDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      await Booking.create({
        UserId: testUser.id,
        ServiceId: service.id,
        date: bookingDate,
        time: '15:00:00', // 3:00 PM
        status: 'pending',
        notes: 'This is a test booking for admin approval testing'
      });
      
      console.log('Test booking created for tomorrow at 3:00 PM');
    } else {
      console.log('Using existing pending booking:', pendingBooking.id);
    }
    
    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to admin login page
    console.log('Navigating to admin login page...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    // Fill in login form
    console.log('Logging in as admin...');
    await page.type('#email', 'yilinzhang1969@gmail.com');
    await page.type('#password', 'admin123');
    
    // Submit login form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('Successfully logged in as admin');
      
      // Take screenshot of dashboard
      await page.screenshot({ path: 'admin-dashboard.png' });
      console.log('Screenshot saved as admin-dashboard.png');
      
      // Navigate to bookings page by directly going to the URL
      console.log('Navigating to bookings page...');
      await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle2' });
      
      // Take screenshot of bookings page
      await page.screenshot({ path: 'admin-bookings.png' });
      console.log('Screenshot saved as admin-bookings.png');
      
      // Find a pending booking and approve it
      const pendingBookingElements = await page.$$('tr.table-warning');
      
      if (pendingBookingElements.length > 0) {
        console.log(`Found ${pendingBookingElements.length} pending bookings`);
        
        // Click the first pending booking's approve button
        const firstPendingBooking = pendingBookingElements[0];
        
        // Find the approve button within this booking row
        const approveButton = await firstPendingBooking.$('button.btn-success');
        
        if (approveButton) {
          console.log('Clicking approve button...');
          await approveButton.click();
          
          // Wait for the confirmation modal
          await page.waitForSelector('#confirmStatusModal', { visible: true });
          
          // Take screenshot of confirmation modal
          await page.screenshot({ path: 'confirm-modal.png' });
          
          // Click the confirm button in the modal
          console.log('Confirming status change...');
          await Promise.all([
            page.click('#confirmStatusBtn'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
          ]);
          
          // Check for success message
          const successMessage = await page.$('.alert-success');
          if (successMessage) {
            const messageText = await page.evaluate(el => el.textContent, successMessage);
            console.log('Success message:', messageText);
            
            if (messageText.includes('email sent')) {
              console.log('✅ Email notification was sent successfully!');
            } else {
              console.log('⚠️ Booking was approved but no confirmation about email being sent');
            }
          } else {
            console.log('❌ No success message found after approval');
          }
          
          // Take final screenshot
          await page.screenshot({ path: 'after-approval.png' });
          console.log('Final screenshot saved as after-approval.png');
        } else {
          console.log('❌ Could not find approve button for pending booking');
        }
      } else {
        console.log('❌ No pending bookings found on the page');
      }
    } else {
      console.log('❌ Failed to log in as admin');
    }
    
    console.log('Test completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
    await sequelize.close();
  }
}

// Run the test
testAdminApproveBooking();
