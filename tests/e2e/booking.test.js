/**
 * End-to-End Tests for Booking Functionality
 * Using Puppeteer for browser automation
 */

const puppeteer = require('puppeteer');
const { sequelize, User, Service, BusinessHours } = require('../../models');
const bcrypt = require('bcrypt');

describe('Booking Functionality', () => {
  let browser;
  let page;
  let baseUrl = 'http://localhost:3000';

  beforeAll(async () => {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Reset database and create test data
    await sequelize.sync({ force: true });

    // Create test admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: adminPassword,
      isAdmin: true
    });

    // Create test regular user
    const userPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Test User',
      email: 'user@test.com',
      password: userPassword,
      isAdmin: false
    });

    // Create test service
    await Service.create({
      name: 'Test Massage',
      description: 'A test massage service',
      duration: 60,
      price: 75.00,
      isActive: true
    });

    // Create business hours
    const days = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday
    for (const day of days) {
      await BusinessHours.create({
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '17:00',
        isActive: day !== 0 // Closed on Sundays
      });
    }
  });

  beforeEach(async () => {
    // Create new page for each test
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  afterEach(async () => {
    // Close page after each test
    await page.close();
  });

  afterAll(async () => {
    // Close browser and database connection
    await browser.close();
    await sequelize.close();
  });

  test('Home page loads with services', async () => {
    await page.goto(`${baseUrl}/`);
    
    // Check page title
    const title = await page.title();
    expect(title).toContain('Massage Booking');
    
    // Check for service content
    const content = await page.content();
    expect(content).toContain('Test Massage');
  }, 10000);

  test('Booking form loads and can be submitted', async () => {
    await page.goto(`${baseUrl}/booking`);
    
    // Check that booking form is present
    await page.waitForSelector('form#bookingForm');
    
    // Fill out booking form
    await page.select('select[name="serviceId"]', '1'); // Select first service
    
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.type('input[name="date"]', dateString);
    
    // Select a time slot
    await page.click('.time-slot'); // Click first available time slot
    
    // Fill customer information
    await page.type('input[name="name"]', 'Test Customer');
    await page.type('input[name="email"]', 'customer@test.com');
    await page.type('input[name="phone"]', '555-123-4567');
    await page.type('textarea[name="notes"]', 'This is a test booking from E2E test');
    
    // Submit form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Check for success message
    const content = await page.content();
    expect(content).toContain('success');
  }, 15000);

  test('Admin can login and view dashboard', async () => {
    await page.goto(`${baseUrl}/admin/login`);
    
    // Fill login form
    await page.type('input[name="email"]', 'admin@test.com');
    await page.type('input[name="password"]', 'admin123');
    
    // Submit login form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Check that we're on the dashboard
    const url = page.url();
    expect(url).toContain('/admin/dashboard');
    
    // Check for dashboard elements
    const content = await page.content();
    expect(content).toContain('Dashboard');
    expect(content).toContain('Today\'s Bookings');
  }, 10000);

  test('Admin can manage services', async () => {
    // Login as admin
    await page.goto(`${baseUrl}/admin/login`);
    await page.type('input[name="email"]', 'admin@test.com');
    await page.type('input[name="password"]', 'admin123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Navigate to services page
    await page.goto(`${baseUrl}/admin/services`);
    
    // Check that services page loaded
    const content = await page.content();
    expect(content).toContain('Test Massage');
    
    // Open add service modal
    await page.click('button[data-bs-target="#addServiceModal"]');
    await page.waitForSelector('#addServiceModal.show');
    
    // Fill out new service form
    await page.type('#addServiceForm input[name="name"]', 'New Test Service');
    await page.type('#addServiceForm textarea[name="description"]', 'Description for new test service');
    await page.type('#addServiceForm input[name="duration"]', '45');
    await page.type('#addServiceForm input[name="price"]', '60');
    await page.click('#addServiceForm input[name="isActive"]');
    
    // Submit form
    await Promise.all([
      page.click('#addServiceForm button[type="submit"]'),
      page.waitForNavigation()
    ]);
    
    // Check that new service was added
    const updatedContent = await page.content();
    expect(updatedContent).toContain('New Test Service');
  }, 15000);
});
