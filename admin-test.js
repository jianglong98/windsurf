const puppeteer = require('puppeteer');

async function testAdminPages() {
  console.log('Starting admin pages test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to false to see the browser
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the login page
    console.log('Navigating to admin login page...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle2' });
    
    // Fill in the login form
    console.log('Filling login form with yilinzhang1969@gmail.com / admin123...');
    await page.type('#email', 'yilinzhang1969@gmail.com');
    await page.type('#password', 'admin123');
    
    // Submit the form
    console.log('Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
      page.click('button[type="submit"]')
    ]);
    
    // Check if we're redirected to the dashboard
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    // Wait for 5 seconds to see the result
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Navigate to services page
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('Successfully logged in! Checking services page...');
      await page.goto('http://localhost:3000/admin/services', { waitUntil: 'networkidle2' });
      console.log('On services page, checking content...');
      
      // Wait for 5 seconds to see the services page
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Take a screenshot
      await page.screenshot({ path: 'admin-services.png' });
      console.log('Screenshot saved as admin-services.png');
    } else {
      console.log('Login failed. Current page:', await page.title());
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close the browser after 10 seconds
    setTimeout(async () => {
      await browser.close();
      console.log('Test completed and browser closed.');
    }, 10000);
  }
}

// Run the test
testAdminPages();
