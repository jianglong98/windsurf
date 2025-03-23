/**
 * Fix Admin Login Script
 * 
 * This script fixes the admin login by directly setting the password hash in the database
 * to ensure the admin credentials work properly.
 */

const bcrypt = require('bcrypt');
const { sequelize, User } = require('./models');

async function fixAdminLogin() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    // Admin credentials
    const adminEmail = 'yilinzhang1969@gmail.com';
    const adminPassword = 'admin123';
    
    console.log(`Fixing admin login for ${adminEmail}...`);
    
    // Generate a new password hash
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('Generated new password hash');
    
    // Find the admin user
    const admin = await User.findOne({ where: { email: adminEmail } });
    
    if (!admin) {
      console.log('Admin user not found, creating new admin user...');
      const newAdmin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      console.log(`Admin user created with ID: ${newAdmin.id}`);
    } else {
      console.log(`Found admin user with ID: ${admin.id}`);
      
      // Update the admin password directly
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin password updated successfully');
      
      // Verify the update
      const updatedAdmin = await User.findOne({ where: { email: adminEmail } });
      console.log('Updated admin hash:', updatedAdmin.password.substring(0, 20) + '...');
    }
    
    // Test the password validation
    const testAdmin = await User.findOne({ where: { email: adminEmail } });
    const testPassword = adminPassword;
    
    // Manually test bcrypt compare
    const isMatch = await bcrypt.compare(testPassword, testAdmin.password);
    console.log('Manual bcrypt.compare result:', isMatch);
    
    console.log('\nAdmin login credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\nFix completed successfully!');
    
  } catch (error) {
    console.error('Error fixing admin login:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixAdminLogin();
