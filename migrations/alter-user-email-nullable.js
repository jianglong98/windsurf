/**
 * Migration to make the email field in Users table nullable
 * This allows customers to book with just a phone number
 */

const { sequelize } = require('../models');

async function alterUserEmailNullable() {
  try {
    console.log('Starting migration: Make User.email nullable');
    
    // In SQLite, we need to:
    // 1. Create a new table with the desired schema
    // 2. Copy data from old table to new table
    // 3. Drop old table
    // 4. Rename new table to old table name
    
    // Get the current Users table schema
    const [tableInfo] = await sequelize.query(`PRAGMA table_info(Users);`);
    console.log('Current Users table schema:', tableInfo);
    
    // Create a temporary table with the new schema
    await sequelize.query(`
      CREATE TABLE Users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        phone TEXT,
        isAdmin BOOLEAN DEFAULT 0,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL
      );
    `);
    
    // Copy data from old table to new table
    await sequelize.query(`
      INSERT INTO Users_new (id, name, email, password, phone, isAdmin, createdAt, updatedAt)
      SELECT id, name, email, password, phone, isAdmin, createdAt, updatedAt FROM Users;
    `);
    
    // Drop old table
    await sequelize.query(`DROP TABLE Users;`);
    
    // Rename new table to old table name
    await sequelize.query(`ALTER TABLE Users_new RENAME TO Users;`);
    
    // Create indexes
    await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS Users_email ON Users (email);`);
    
    console.log('Migration completed successfully: User.email is now nullable');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
alterUserEmailNullable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
