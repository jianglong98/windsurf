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
    await page.type('#email', 'yilinzhang1969@gmail.com');
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
      
      // Check dashboard content
      const dashboardHeading = await page.$eval('h1', el => el.textContent);
      console.log(`Dashboard heading: ${dashboardHeading}`);
      
      // Test navigation to services page
      console.log('Testing direct navigation to services page...');
      await page.goto('http://localhost:3000/admin/services', { waitUntil: 'networkidle2' });
      
      const servicesTitle = await page.title();
      console.log(`Services page title: ${servicesTitle}`);
      
      if (servicesTitle.includes('Manage Services')) {
        console.log('✅ SUCCESS: Navigation to services page successful!');
        
        // Check if services are displayed
        const serviceRows = await page.$$('table tbody tr');
        console.log(`Number of services found: ${serviceRows.length}`);
        
        if (serviceRows.length > 0) {
          console.log('✅ SUCCESS: Services are displayed in the table!');
        } else {
          console.log('❌ ERROR: No services found in the table');
        }
      } else {
        console.log('❌ ERROR: Navigation to services page failed');
      }
      
      // Test navigation to business hours page
      console.log('Testing navigation to business hours page...');
      await page.goto('http://localhost:3000/admin/business-hours', { waitUntil: 'networkidle2' });
      
      const hoursTitle = await page.title();
      console.log(`Business hours page title: ${hoursTitle}`);
      
      if (hoursTitle.includes('Business Hours')) {
        console.log('✅ SUCCESS: Navigation to business hours page successful!');
      } else {
        console.log('❌ ERROR: Navigation to business hours page failed');
      }
      
      // Test logout
      console.log('Testing logout...');
      await page.goto('http://localhost:3000/admin/logout', { waitUntil: 'networkidle2' });
      
      const logoutTitle = await page.title();
      console.log(`After logout page title: ${logoutTitle}`);
      
      if (logoutTitle.includes('Admin Login')) {
        console.log('✅ SUCCESS: Logout successful!');
      } else {
        console.log('❌ ERROR: Logout failed');
      }
    } else {
      console.log('❌ ERROR: Admin login failed');
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    console.log('Test completed.');
    await browser.close();
  }
}

// Run the test
testAdminLogin();
