/**
 * Migration to add imageUrl field to Services table
 * This allows us to display images for each service
 */

const { sequelize } = require('../models');

async function addServiceImagesField() {
  try {
    console.log('Starting migration: Add imageUrl field to Services table');
    
    // Check if the column already exists
    const [columns] = await sequelize.query(`PRAGMA table_info(Services);`);
    const hasImageUrl = columns.some(column => column.name === 'imageUrl');
    
    if (hasImageUrl) {
      console.log('imageUrl column already exists in Services table');
      return;
    }
    
    // Add the imageUrl column to the Services table
    await sequelize.query(`ALTER TABLE Services ADD COLUMN imageUrl TEXT;`);
    
    console.log('Migration completed successfully: Added imageUrl field to Services table');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
addServiceImagesField()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
