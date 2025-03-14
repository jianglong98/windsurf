const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || path.join(__dirname, '../database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Import models
const User = require('./user')(sequelize);
const Service = require('./service')(sequelize);
const Booking = require('./booking')(sequelize);
const BusinessHours = require('./businessHours')(sequelize);

// Define associations
User.hasMany(Booking);
Booking.belongsTo(User);

Service.hasMany(Booking);
Booking.belongsTo(Service);

// Export models and Sequelize instance
module.exports = {
  sequelize,
  User,
  Service,
  Booking,
  BusinessHours
};
