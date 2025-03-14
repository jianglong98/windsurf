/**
 * Admin User Fix Script
 * 
 * This script directly updates the admin user password to fix login issues.
 */

const bcrypt = require('bcrypt');
const { sequelize, User } = require('./models');

async function fixAdminUser() {
  try {
    console.log('Starting admin user fix...');
    
    // Find admin user
    const admin = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!admin) {
      console.log('Admin user not found. Creating new admin user...');
      
      // Create new admin user if not exists
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      console.log('New admin user created:', newAdmin.email);
      console.log('Admin password hash:', hashedPassword);
    } else {
      console.log('Admin user found. Updating password...');
      
      // Update admin password
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Use direct update to bypass hooks
      await User.update(
        { password: hashedPassword },
        { where: { id: admin.id }, individualHooks: false }
      );
      
      // Verify the update
      const updatedAdmin = await User.findByPk(admin.id);
      console.log('Admin user updated:', updatedAdmin.email);
      console.log('New admin password hash:', updatedAdmin.password);
      
      // Test password validation
      const isMatch = await bcrypt.compare(adminPassword, updatedAdmin.password);
      console.log('Password validation test:', isMatch ? 'SUCCESS' : 'FAILED');
    }
    
    console.log('Admin user fix completed!');
    console.log('Admin login credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixAdminUser();
