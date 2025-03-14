/**
 * Admin Login Test Script
 * 
 * This script tests the admin login functionality using Puppeteer.
 */

const puppeteer = require('puppeteer');

async function testAdminLogin() {
  console.log('Starting admin login test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the login page
    console.log('Navigating to admin login page...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    // Check if we're on the login page
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    if (!title.includes('Admin Login')) {
      throw new Error('Failed to load admin login page');
    }
    
    // Fill in the login form
    console.log('Filling login form...');
    await page.type('#email', 'admin@example.com');
    await page.type('#password', 'admin123');
    
    // Submit the form
    console.log('Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }),
      page.click('button[type="submit"]')
    ]);
    
    // Check if we're redirected to the dashboard
    const dashboardTitle = await page.title();
    console.log(`After login page title: ${dashboardTitle}`);
    
    if (dashboardTitle.includes('Admin Dashboard')) {
      console.log('✅ SUCCESS: Admin login successful!');
      
      // Check for admin dashboard elements
      const dashboardHeading = await page.$eval('h1', el => el.textContent);
      console.log(`Dashboard heading: ${dashboardHeading}`);
      
      // Test direct navigation to services page
      console.log('Testing direct navigation to services page...');
      await page.goto('http://localhost:3000/admin/services', { waitUntil: 'networkidle2' });
      
      const servicesTitle = await page.title();
      console.log(`Services page title: ${servicesTitle}`);
      
      if (servicesTitle.includes('Manage Services')) {
        console.log('✅ SUCCESS: Navigation to services page successful!');
        
        // Check for services table
        const servicesCount = await page.$$eval('table tbody tr', rows => rows.length);
        console.log(`Number of services found: ${servicesCount}`);
        
        if (servicesCount > 0) {
          console.log('✅ SUCCESS: Services are displayed in the table!');
        } else {
          console.log('❌ ERROR: No services found in the table');
        }
      } else {
        console.log('❌ ERROR: Failed to navigate to services page');
      }
      
      // Test navigation to business hours page
      console.log('Testing navigation to business hours page...');
      await page.goto('http://localhost:3000/admin/business-hours', { waitUntil: 'networkidle2' });
      
      const hoursTitle = await page.title();
      console.log(`Business hours page title: ${hoursTitle}`);
      
      if (hoursTitle.includes('Business Hours')) {
        console.log('✅ SUCCESS: Navigation to business hours page successful!');
      } else {
        console.log('❌ ERROR: Failed to navigate to business hours page');
      }
      
      // Test logout
      console.log('Testing logout...');
      await page.goto('http://localhost:3000/admin/logout', { waitUntil: 'networkidle2' });
      
      const afterLogoutTitle = await page.title();
      console.log(`After logout page title: ${afterLogoutTitle}`);
      
      if (afterLogoutTitle.includes('Admin Login')) {
        console.log('✅ SUCCESS: Logout successful!');
      } else {
        console.log('❌ ERROR: Failed to logout properly');
      }
      
    } else {
      console.log('❌ ERROR: Admin login failed!');
      
      // Check if there's an error message
      const errorMessage = await page.evaluate(() => {
        const errorEl = document.querySelector('.alert-danger');
        return errorEl ? errorEl.textContent.trim() : null;
      });
      
      if (errorMessage) {
        console.log(`Error message: ${errorMessage}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close browser
    await browser.close();
    console.log('Test completed.');
  }
}

// Run the test
testAdminLogin();
