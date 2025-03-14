/**
 * Admin Routes Tests
 * Tests for admin authentication and dashboard functionality
 */

const request = require('supertest');
const bcrypt = require('bcrypt');
const { User, Service, Booking } = require('../../models');
const app = require('../../app');

describe('Admin Routes', () => {
  let adminUser, regularUser, testService;
  let adminCookies;

  beforeAll(async () => {
    // Create test admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      name: 'Test Admin',
      email: 'admin-routes@test.com',
      password: adminPassword,
      isAdmin: true
    });

    // Create test regular user
    const userPassword = await bcrypt.hash('password123', 10);
    regularUser = await User.create({
      name: 'Regular User',
      email: 'regular-routes@test.com',
      password: userPassword,
      isAdmin: false
    });

    // Create test service
    testService = await Service.create({
      name: 'Admin Test Service',
      description: 'Service for admin route tests',
      duration: 60,
      price: 75.00,
      isActive: true
    });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { id: [adminUser.id, regularUser.id] } });
    await Service.destroy({ where: { id: testService.id } });
  });

  describe('Admin Authentication', () => {
    test('should show login page', async () => {
      const response = await request(app).get('/admin/login');
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Admin Login');
    });

    test('should login with valid admin credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: adminUser.email,
          password: 'admin123'
        })
        .expect(302); // Redirect after successful login

      // Save cookies for authenticated requests
      adminCookies = response.headers['set-cookie'];
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: adminUser.email,
          password: 'wrongpassword'
        });

      expect(response.statusCode).toBe(200); // Returns to login page
      expect(response.text).toContain('Invalid email or password');
    });

    test('should reject login for non-admin users', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({
          email: regularUser.email,
          password: 'password123'
        });

      expect(response.statusCode).toBe(200); // Returns to login page
      expect(response.text).toContain('Invalid email or password');
    });
  });

  describe('Admin Dashboard', () => {
    test('should redirect unauthenticated users to login', async () => {
      const response = await request(app).get('/admin/dashboard');
      expect(response.statusCode).toBe(302); // Redirect to login
      expect(response.headers.location).toContain('/admin/login');
    });

    test('should allow authenticated admin to access dashboard', async () => {
      const response = await request(app)
        .get('/admin/dashboard')
        .set('Cookie', adminCookies);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Dashboard');
    });
  });

  describe('Admin Service Management', () => {
    test('should allow admin to view services', async () => {
      const response = await request(app)
        .get('/admin/services')
        .set('Cookie', adminCookies);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Admin Test Service');
    });

    test('should allow admin to add a new service', async () => {
      const newService = {
        name: 'New Route Test Service',
        description: 'Service added through route test',
        duration: 45,
        price: 60.00,
        isActive: true
      };

      const response = await request(app)
        .post('/admin/services')
        .set('Cookie', adminCookies)
        .send(newService)
        .expect(302); // Redirect after successful creation

      // Verify service was created
      const service = await Service.findOne({ where: { name: newService.name } });
      expect(service).not.toBeNull();
      expect(service.description).toBe(newService.description);
    });

    test('should allow admin to update a service', async () => {
      const updatedName = 'Updated Service Name';
      
      const response = await request(app)
        .post(`/admin/services/${testService.id}`)
        .set('Cookie', adminCookies)
        .send({
          name: updatedName,
          description: testService.description,
          duration: testService.duration,
          price: testService.price,
          isActive: testService.isActive
        })
        .expect(302); // Redirect after successful update

      // Verify service was updated
      await testService.reload();
      expect(testService.name).toBe(updatedName);
    });
  });

  describe('Admin Booking Management', () => {
    let testBooking;

    beforeAll(async () => {
      // Create a test booking
      testBooking = await Booking.create({
        date: '2025-04-01',
        time: '10:00',
        status: 'pending',
        notes: 'Test booking for admin routes',
        UserId: regularUser.id,
        ServiceId: testService.id
      });
    });

    afterAll(async () => {
      // Clean up test booking
      await Booking.destroy({ where: { id: testBooking.id } });
    });

    test('should allow admin to view bookings', async () => {
      const response = await request(app)
        .get('/admin/bookings')
        .set('Cookie', adminCookies);

      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('All Bookings');
    });

    test('should allow admin to update booking status', async () => {
      const response = await request(app)
        .post(`/admin/bookings/${testBooking.id}/status`)
        .set('Cookie', adminCookies)
        .send({ status: 'confirmed' })
        .expect(302); // Redirect after successful update

      // Verify booking status was updated
      await testBooking.reload();
      expect(testBooking.status).toBe('confirmed');
    });
  });
});
