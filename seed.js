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
      email: 'yilinzhang1969@gmail.com',
      password: hashedPassword,
      isAdmin: true
    });
    console.log('Admin user created:', admin.email);
    console.log('Admin password hash:', hashedPassword);

    // Create services
    const services = await Service.bulkCreate([
      {
        name: 'Foot Massage - 30 minutes',
        description: 'A relaxing 30-minute foot massage that relieves tension and promotes relaxation through targeted pressure points.',
        duration: 30,
        price: 30,
        isActive: true
      },
      {
        name: 'Foot Massage - 60 minutes',
        description: 'An extended 60-minute foot massage that provides deep relaxation and stress relief through comprehensive foot therapy.',
        duration: 60,
        price: 55,
        isActive: true
      },
      {
        name: 'Combo Massage - 30 min foot + 30 min body',
        description: 'A balanced combination of 30 minutes foot massage followed by 30 minutes of body massage for complete relaxation.',
        duration: 60,
        price: 60,
        isActive: true
      },
      {
        name: 'Combo Massage - 30 min foot + 60 min body',
        description: 'A comprehensive treatment with 30 minutes of foot massage followed by 60 minutes of full body massage for ultimate relaxation.',
        duration: 90,
        price: 85,
        isActive: true
      },
      {
        name: 'Body Massage - 30 minutes',
        description: 'A focused 30-minute full body massage targeting key areas of tension to provide quick relief.',
        duration: 30,
        price: 40,
        isActive: true
      },
      {
        name: 'Body Massage - 60 minutes',
        description: 'A complete 60-minute full body massage that helps reduce stress, relieve muscle tension and promote overall wellness.',
        duration: 60,
        price: 65,
        isActive: true
      },
      {
        name: 'Body Massage - 90 minutes',
        description: 'An extended 90-minute full body massage providing deep relaxation and comprehensive treatment for the entire body.',
        duration: 90,
        price: 90,
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
    console.log('Email: yilinzhang1969@gmail.com');
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
