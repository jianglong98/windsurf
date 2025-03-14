/**
 * User Model Tests
 */

const bcrypt = require('bcrypt');
const { User } = require('../../models');

describe('User Model', () => {
  beforeEach(async () => {
    // Clear users table before each test
    await User.destroy({ where: {}, truncate: true });
  });

  test('should create a new user with hashed password', async () => {
    // Create a test user
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      isAdmin: false
    };

    const user = await User.create(userData);

    // Check that user was created
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.isAdmin).toBe(userData.isAdmin);

    // Check that password was hashed
    expect(user.password).not.toBe(userData.password);
    
    // Verify password can be compared correctly
    const passwordMatch = await bcrypt.compare(userData.password, user.password);
    expect(passwordMatch).toBe(true);
  });

  test('should not create user with duplicate email', async () => {
    // Create first user
    await User.create({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123',
      isAdmin: false
    });

    // Try to create second user with same email
    try {
      await User.create({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password456',
        isAdmin: false
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  test('should validate required fields', async () => {
    try {
      await User.create({
        // Missing name and email
        password: 'password123'
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });

  test('should validate email format', async () => {
    try {
      await User.create({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'password123'
      });
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      // Expect an error to be thrown
      expect(error).toBeDefined();
    }
  });
});
