/**
 * Database Seeder for Massage Booking Application
 * 
 * This script populates the database with initial data for testing and development.
 */

const bcrypt = require('bcrypt');
const { sequelize, User, Service, BusinessHours } = require('./models');

// Main seeder function
async function seedDatabase() {
  try {
    // Sync database (force: true will drop tables if they exist)
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create admin user
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      isAdmin: true
    });
    console.log('Admin user created:', admin.email);
    console.log('Admin password hash:', hashedPassword);

    // Create services
    const services = await Service.bulkCreate([
      {
        name: 'Swedish Massage',
        description: 'A gentle type of full-body massage that\'s ideal for people who are new to massage, have a lot of tension, or are sensitive to touch.',
        duration: 60,
        price: 80,
        isActive: true
      },
      {
        name: 'Deep Tissue Massage',
        description: 'A massage technique that focuses on the deeper layers of muscle tissue. It aims to release chronic patterns of tension in the body.',
        duration: 60,
        price: 90,
        isActive: true
      },
      {
        name: 'Hot Stone Massage',
        description: 'A specialty massage where smooth, heated stones are placed on specific parts of your body to help loosen tight muscles.',
        duration: 90,
        price: 110,
        isActive: true
      },
      {
        name: 'Sports Massage',
        description: 'Focuses on areas of the body that are overused and stressed from repetitive movements and activity.',
        duration: 60,
        price: 85,
        isActive: true
      },
      {
        name: 'Prenatal Massage',
        description: 'A therapeutic bodywork that focuses on the special needs of the mother-to-be as her body goes through the dramatic changes of pregnancy.',
        duration: 60,
        price: 85,
        isActive: true
      }
    ]);
    console.log(`${services.length} services created`);

    // Create business hours
    const businessHours = await BusinessHours.bulkCreate([
      { dayOfWeek: 0, openTime: '10:00:00', closeTime: '16:00:00', isActive: true },  // Sunday
      { dayOfWeek: 1, openTime: '09:00:00', closeTime: '18:00:00', isActive: true },  // Monday
      { dayOfWeek: 2, openTime: '09:00:00', closeTime: '18:00:00', isActive: true },  // Tuesday
      { dayOfWeek: 3, openTime: '09:00:00', closeTime: '18:00:00', isActive: true },  // Wednesday
      { dayOfWeek: 4, openTime: '09:00:00', closeTime: '20:00:00', isActive: true },  // Thursday
      { dayOfWeek: 5, openTime: '09:00:00', closeTime: '20:00:00', isActive: true },  // Friday
      { dayOfWeek: 6, openTime: '10:00:00', closeTime: '16:00:00', isActive: true }   // Saturday
    ]);
    console.log(`${businessHours.length} business hours created`);

    console.log('Database seeded successfully!');
    console.log('Admin login credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the seeder
seedDatabase();
