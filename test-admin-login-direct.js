/**
 * Direct Admin Login Test
 * 
 * This script tests the admin login route directly using axios
 * to identify any issues with the login process.
 */

const axios = require('axios');
const { sequelize, User } = require('./models');

async function testAdminLoginDirect() {
  try {
    console.log('Starting direct admin login test...');
    
    // First, check if the admin user exists and has the correct password
    await sequelize.authenticate();
    console.log('Connected to database');
    
    const adminUser = await User.findOne({ 
      where: { email: 'yilinzhang1969@gmail.com' } 
    });
    
    if (!adminUser) {
      console.error('Admin user not found in database!');
      process.exit(1);
    }
    
    console.log('Admin user found:', {
      id: adminUser.id,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin,
      hasPassword: !!adminUser.password,
      passwordLength: adminUser.password ? adminUser.password.length : 0
    });
    
    // Test password validation directly
    const testPassword = 'admin123';
    const passwordValid = await adminUser.validatePassword(testPassword);
    console.log(`Direct password validation test: ${passwordValid ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    // Make a direct POST request to the login endpoint
    console.log('\nSending direct login request...');
    
    const loginResponse = await axios.post('http://localhost:3000/admin/login', 
      {
        email: 'yilinzhang1969@gmail.com',
        password: 'admin123'
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      }
    ).catch(error => {
      if (error.response) {
        return error.response;
      }
      throw error;
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', loginResponse.headers);
    
    if (loginResponse.headers.location === '/admin/dashboard') {
      console.log('✅ SUCCESS: Login redirected to dashboard!');
    } else {
      console.log('❌ ERROR: Login failed, redirected to:', loginResponse.headers.location);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  } finally {
    await sequelize.close();
    console.log('Test completed');
  }
}

// Run the test
testAdminLoginDirect();
