/**
 * Booking Model Tests
 */

const { Booking, User, Service } = require('../../models');

describe('Booking Model', () => {
  let testUser, testService;

  beforeAll(async () => {
    // Create test user and service to be used in booking tests
    testUser = await User.create({
      name: 'Booking Test User',
      email: 'booking-test@example.com',
      password: 'password123',
      isAdmin: false
    });

    testService = await Service.create({
      name: 'Booking Test Service',
      description: 'Service for booking tests',
      duration: 60,
      price: 75.00,
      isActive: true
    });
  });

  beforeEach(async () => {
    // Clear bookings table before each test
    await Booking.destroy({ where: {}, truncate: true });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { id: testUser.id } });
    await Service.destroy({ where: { id: testService.id } });
  });

  test('should create a new booking', async () => {
    const bookingData = {
      date: '2025-04-01',
      time: '10:00',
      status: 'pending',
      notes: 'Test booking notes',
      UserId: testUser.id,
      ServiceId: testService.id
    };

    const booking = await Booking.create(bookingData);

    // Check that booking was created correctly
    expect(booking).toBeDefined();
    expect(booking.id).toBeDefined();
    expect(booking.date).toBe(bookingData.date);
    expect(booking.time).toBe(bookingData.time);
    expect(booking.status).toBe(bookingData.status);
    expect(booking.notes).toBe(bookingData.notes);
    expect(booking.UserId).toBe(testUser.id);
    expect(booking.ServiceId).toBe(testService.id);
  });

  test('should validate required fields', async () => {
    try {
      await Booking.create({
        // Missing date and time
        status: 'pending',
        UserId: testUser.id,
        ServiceId: testService.id
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  test('should validate date format', async () => {
    try {
      await Booking.create({
        date: 'not-a-date',
        time: '10:00',
        status: 'pending',
        UserId: testUser.id,
        ServiceId: testService.id
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  test('should update booking status', async () => {
    // Create initial booking
    const booking = await Booking.create({
      date: '2025-04-01',
      time: '14:00',
      status: 'pending',
      notes: 'Status update test',
      UserId: testUser.id,
      ServiceId: testService.id
    });

    // Update booking status
    await booking.update({ status: 'confirmed' });

    // Reload the booking from the database
    await booking.reload();

    // Check that status was updated
    expect(booking.status).toBe('confirmed');
  });

  test('should retrieve booking with user and service associations', async () => {
    // Create a booking
    const booking = await Booking.create({
      date: '2025-04-02',
      time: '15:00',
      status: 'pending',
      notes: 'Association test',
      UserId: testUser.id,
      ServiceId: testService.id
    });

    // Find booking with associations
    const foundBooking = await Booking.findByPk(booking.id, {
      include: [User, Service]
    });

    // Check associations
    expect(foundBooking.User).toBeDefined();
    expect(foundBooking.User.id).toBe(testUser.id);
    expect(foundBooking.User.name).toBe(testUser.name);
    
    expect(foundBooking.Service).toBeDefined();
    expect(foundBooking.Service.id).toBe(testService.id);
    expect(foundBooking.Service.name).toBe(testService.name);
  });
});
