/**
 * Direct Fix for Admin Login
 * 
 * This script directly updates the admin user's password in the database
 * using a simpler approach to ensure compatibility with the login system.
 */

const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Admin credentials
const adminEmail = 'yilinzhang1969@gmail.com';
const adminPassword = 'admin123';

// Generate password hash
bcrypt.hash(adminPassword, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('Generated password hash:', hash);
  
  // First check if the admin user exists
  db.get('SELECT id, email, isAdmin FROM Users WHERE email = ?', [adminEmail], (err, row) => {
    if (err) {
      console.error('Error querying user:', err.message);
      db.close();
      process.exit(1);
    }
    
    if (row) {
      console.log(`Found admin user with ID: ${row.id}`);
      
      // Update the password directly in the database
      db.run('UPDATE Users SET password = ? WHERE id = ?', [hash, row.id], function(err) {
        if (err) {
          console.error('Error updating password:', err.message);
          db.close();
          process.exit(1);
        }
        
        console.log(`Password updated successfully for user ID: ${row.id}`);
        
        // Verify the update worked
        db.get('SELECT id, email, password FROM Users WHERE id = ?', [row.id], (err, updatedRow) => {
          if (err) {
            console.error('Error verifying update:', err.message);
          } else {
            console.log('Updated password hash in database:', updatedRow.password.substring(0, 20) + '...');
            
            // Test the password
            bcrypt.compare(adminPassword, updatedRow.password, (err, result) => {
              if (err) {
                console.error('Error comparing passwords:', err);
              } else {
                console.log('Password verification test:', result ? 'SUCCESS ✅' : 'FAILED ❌');
              }
              
              console.log('\nAdmin login credentials:');
              console.log(`Email: ${adminEmail}`);
              console.log(`Password: ${adminPassword}`);
              console.log('\nFix completed!');
              
              db.close();
            });
          }
        });
      });
    } else {
      console.log('Admin user not found, creating new admin user...');
      
      // Get current timestamp
      const now = new Date().toISOString();
      
      // Insert new admin user
      db.run(
        'INSERT INTO Users (name, email, password, isAdmin, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin User', adminEmail, hash, 1, now, now],
        function(err) {
          if (err) {
            console.error('Error creating admin user:', err.message);
            db.close();
            process.exit(1);
          }
          
          console.log(`Admin user created with ID: ${this.lastID}`);
          
          console.log('\nAdmin login credentials:');
          console.log(`Email: ${adminEmail}`);
          console.log(`Password: ${adminPassword}`);
          console.log('\nFix completed!');
          
          db.close();
        }
      );
    }
  });
});
