/**
 * Update Business Hours
 * 
 * This script updates the business hours to match the contact information
 * displayed across the website.
 */

const { sequelize, BusinessHours } = require('./models');

// New business hours based on contact information
const updatedHours = [
  { dayOfWeek: 0, openTime: '10:00', closeTime: '17:00', isActive: true }, // Sunday: 10am-5pm
  { dayOfWeek: 1, openTime: '09:00', closeTime: '19:00', isActive: true }, // Monday: 9am-7pm
  { dayOfWeek: 2, openTime: '09:00', closeTime: '19:00', isActive: true }, // Tuesday: 9am-7pm
  { dayOfWeek: 3, openTime: '09:00', closeTime: '19:00', isActive: true }, // Wednesday: 9am-7pm
  { dayOfWeek: 4, openTime: '09:00', closeTime: '19:00', isActive: true }, // Thursday: 9am-7pm
  { dayOfWeek: 5, openTime: '09:00', closeTime: '19:00', isActive: true }, // Friday: 9am-7pm
  { dayOfWeek: 6, openTime: '10:00', closeTime: '17:00', isActive: true }  // Saturday: 10am-5pm
];

async function updateBusinessHours() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Updating business hours...');
    
    for (const hours of updatedHours) {
      const [businessHours] = await BusinessHours.findOrCreate({
        where: { dayOfWeek: hours.dayOfWeek },
        defaults: hours
      });
      
      if (businessHours) {
        await businessHours.update(hours);
        console.log(`Updated hours for day ${hours.dayOfWeek}: ${hours.isActive ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'}`);
      }
    }
    
    console.log('Business hours updated successfully!');
  } catch (error) {
    console.error('Error updating business hours:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateBusinessHours();
