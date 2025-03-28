const { sequelize } = require('../models');
const { dynamoose } = require('../config/dynamodb');
const fs = require('fs');
const path = require('path');

// Define DynamoDB models
const ServiceSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true
  },
  name: String,
  description: String,
  price: Number,
  duration: Number,
  image: String,
  createdAt: Date,
  updatedAt: Date
});

const BookingSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true
  },
  serviceId: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  date: String,
  time: String,
  status: {
    type: String,
    default: 'pending'
  },
  notes: String,
  createdAt: Date,
  updatedAt: Date
});

const AdminSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true
  },
  username: String,
  passwordHash: String,
  createdAt: Date,
  updatedAt: Date
});

// Create DynamoDB models
const ServiceModel = dynamoose.model('Service', ServiceSchema);
const BookingModel = dynamoose.model('Booking', BookingSchema);
const AdminModel = dynamoose.model('Admin', AdminSchema);

// Migration function
async function migrateData() {
  try {
    console.log('Starting migration from SQLite to DynamoDB...');
    
    // Get data from SQLite
    const services = await sequelize.models.Service.findAll();
    const bookings = await sequelize.models.Booking.findAll();
    const admins = await sequelize.models.Admin.findAll();
    
    console.log(`Found ${services.length} services, ${bookings.length} bookings, and ${admins.length} admins to migrate.`);
    
    // Migrate services
    for (const service of services) {
      await ServiceModel.create({
        id: service.id.toString(),
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        image: service.image,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      });
    }
    
    // Migrate bookings
    for (const booking of bookings) {
      await BookingModel.create({
        id: booking.id.toString(),
        serviceId: booking.serviceId.toString(),
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      });
    }
    
    // Migrate admins
    for (const admin of admins) {
      await AdminModel.create({
        id: admin.id.toString(),
        username: admin.username,
        passwordHash: admin.passwordHash,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      });
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

// Run migration
migrateData();
