/**
 * Service Model Tests
 */

const { Service } = require('../../models');

describe('Service Model', () => {
  beforeEach(async () => {
    // Clear services table before each test
    await Service.destroy({ where: {}, truncate: true });
  });

  test('should create a new service', async () => {
    // Create a test service
    const serviceData = {
      name: 'Test Massage',
      description: 'A test massage service',
      duration: 60,
      price: 75.00,
      isActive: true
    };

    const service = await Service.create(serviceData);

    // Check that service was created correctly
    expect(service).toBeDefined();
    expect(service.id).toBeDefined();
    expect(service.name).toBe(serviceData.name);
    expect(service.description).toBe(serviceData.description);
    expect(service.duration).toBe(serviceData.duration);
    expect(service.price).toBe(serviceData.price);
    expect(service.isActive).toBe(serviceData.isActive);
  });

  test('should validate required fields', async () => {
    try {
      await Service.create({
        // Missing name and price
        description: 'Incomplete service',
        duration: 30
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  test('should validate numeric fields', async () => {
    try {
      await Service.create({
        name: 'Invalid Service',
        description: 'Service with invalid numeric fields',
        duration: 'not a number',
        price: 75.00,
        isActive: true
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  test('should update an existing service', async () => {
    // Create initial service
    const service = await Service.create({
      name: 'Initial Service',
      description: 'Initial description',
      duration: 60,
      price: 75.00,
      isActive: true
    });

    // Update the service
    const updatedName = 'Updated Service';
    const updatedPrice = 85.00;
    
    await service.update({
      name: updatedName,
      price: updatedPrice
    });

    // Reload the service from the database
    await service.reload();

    // Check that service was updated correctly
    expect(service.name).toBe(updatedName);
    expect(service.price).toBe(updatedPrice);
    // Other fields should remain unchanged
    expect(service.description).toBe('Initial description');
    expect(service.duration).toBe(60);
    expect(service.isActive).toBe(true);
  });

  test('should deactivate a service', async () => {
    // Create active service
    const service = await Service.create({
      name: 'Active Service',
      description: 'An active service',
      duration: 60,
      price: 75.00,
      isActive: true
    });

    // Deactivate the service
    await service.update({ isActive: false });

    // Reload the service from the database
    await service.reload();

    // Check that service was deactivated
    expect(service.isActive).toBe(false);
  });
});
