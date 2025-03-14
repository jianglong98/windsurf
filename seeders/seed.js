/**
 * Database Seeder for Massage Booking Website
 * This script populates the database with initial data for testing and development.
 */

const bcrypt = require('bcrypt');
const { sequelize, User, Service, BusinessHours, Booking } = require('../models');

async function seed() {
  try {
    // Sync database
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully!');

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      isAdmin: true
    });
    console.log('Admin user created:', admin.email);

    // Create regular users
    console.log('Creating regular users...');
    const regularPassword = await bcrypt.hash('password123', 10);
    const users = await User.bulkCreate([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: regularPassword,
        phone: '555-123-4567',
        isAdmin: false
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: regularPassword,
        phone: '555-987-6543',
        isAdmin: false
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: regularPassword,
        phone: '555-456-7890',
        isAdmin: false
      }
    ]);
    console.log(`${users.length} regular users created`);

    // Create services
    console.log('Creating massage services...');
    const services = await Service.bulkCreate([
      {
        name: 'Swedish Massage',
        description: 'A gentle form of massage that uses long strokes, kneading, deep circular movements, vibration and tapping to help relax and energize you.',
        duration: 60,
        price: 75,
        isActive: true
      },
      {
        name: 'Deep Tissue Massage',
        description: 'A massage technique that focuses on the deeper layers of muscle tissue. It aims to release the chronic patterns of tension in the body through slow strokes and deep finger pressure.',
        duration: 60,
        price: 90,
        isActive: true
      },
      {
        name: 'Hot Stone Massage',
        description: 'A specialty massage where the therapist uses smooth, heated stones as an extension of their own hands, or by placing them on the body while they massage other parts of the body.',
        duration: 90,
        price: 110,
        isActive: true
      },
      {
        name: 'Sports Massage',
        description: 'A massage designed to assist in correcting problems and imbalances in soft tissue that are caused from repetitive and strenuous physical activity and trauma.',
        duration: 60,
        price: 85,
        isActive: true
      },
      {
        name: 'Prenatal Massage',
        description: 'A therapeutic bodywork that focuses on the special needs of the mother-to-be as her body goes through the dramatic changes of pregnancy.',
        duration: 60,
        price: 80,
        isActive: true
      },
      {
        name: 'Aromatherapy Massage',
        description: 'A massage therapy that uses essential oils derived from plants to affect your mood and alleviate pain.',
        duration: 75,
        price: 95,
        isActive: true
      }
    ]);
    console.log(`${services.length} services created`);

    // Create business hours
    console.log('Creating business hours...');
    const days = [
      { day: 0, name: 'Sunday', isActive: false },
      { day: 1, name: 'Monday', isActive: true },
      { day: 2, name: 'Tuesday', isActive: true },
      { day: 3, name: 'Wednesday', isActive: true },
      { day: 4, name: 'Thursday', isActive: true },
      { day: 5, name: 'Friday', isActive: true },
      { day: 6, name: 'Saturday', isActive: true }
    ];

    const businessHours = await BusinessHours.bulkCreate(
      days.map(day => ({
        dayOfWeek: day.day,
        openTime: day.isActive ? '09:00' : '00:00',
        closeTime: day.isActive ? '18:00' : '00:00',
        isActive: day.isActive
      }))
    );
    console.log(`Business hours created for ${businessHours.length} days`);

    // Create sample bookings
    console.log('Creating sample bookings...');
    
    // Get today's date and format it as YYYY-MM-DD
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    // Get tomorrow's date and format it as YYYY-MM-DD
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    // Get a date next week and format it as YYYY-MM-DD
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekFormatted = nextWeek.toISOString().split('T')[0];
    
    const bookings = await Booking.bulkCreate([
      {
        date: todayFormatted,
        time: '10:00',
        status: 'confirmed',
        notes: 'First time client, prefers gentle pressure',
        UserId: 2, // Jane
        ServiceId: 1 // Swedish Massage
      },
      {
        date: todayFormatted,
        time: '14:00',
        status: 'confirmed',
        notes: 'Focus on lower back',
        UserId: 3, // Bob
        ServiceId: 2 // Deep Tissue
      },
      {
        date: tomorrowFormatted,
        time: '11:00',
        status: 'pending',
        notes: '',
        UserId: 4, // John
        ServiceId: 3 // Hot Stone
      },
      {
        date: nextWeekFormatted,
        time: '15:00',
        status: 'pending',
        notes: 'Allergic to lavender',
        UserId: 2, // Jane
        ServiceId: 6 // Aromatherapy
      }
    ]);
    console.log(`${bookings.length} sample bookings created`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

// Run the seed function
seed();
