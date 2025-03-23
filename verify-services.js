/**
 * Service Verification Script
 * This script verifies that the services have been updated correctly in the database
 */

const { sequelize, Service } = require('./models');

async function verifyServices() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to the database successfully.');

    // Fetch all active services
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });

    console.log('\n===== CURRENT SERVICES IN DATABASE =====');
    console.log(`Total active services: ${services.length}`);
    
    // Display services in a table format
    console.log('\nID | Name | Duration | Price | Active');
    console.log('---|------|----------|-------|-------');
    
    services.forEach(service => {
      console.log(`${service.id} | ${service.name} | ${service.duration} min | $${service.price.toFixed(2)} | ${service.isActive ? 'Yes' : 'No'}`);
    });

    // Verify specific service categories
    const footMassages = services.filter(s => s.name.includes('Foot Massage'));
    const comboMassages = services.filter(s => s.name.includes('Combo Massage'));
    const bodyMassages = services.filter(s => s.name.includes('Body Massage'));

    console.log('\n===== SERVICE CATEGORIES =====');
    console.log(`Foot Massages: ${footMassages.length}`);
    console.log(`Combo Massages: ${comboMassages.length}`);
    console.log(`Body Massages: ${bodyMassages.length}`);

    // Verify specific prices
    console.log('\n===== PRICE VERIFICATION =====');
    
    // Foot Massage prices
    const foot30 = services.find(s => s.name === 'Foot Massage - 30 minutes');
    const foot60 = services.find(s => s.name === 'Foot Massage - 60 minutes');
    
    if (foot30) {
      console.log(`Foot Massage 30min: $${foot30.price.toFixed(2)} ${foot30.price === 30 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Foot Massage 30min: ❌ NOT FOUND');
    }
    
    if (foot60) {
      console.log(`Foot Massage 60min: $${foot60.price.toFixed(2)} ${foot60.price === 55 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Foot Massage 60min: ❌ NOT FOUND');
    }
    
    // Combo Massage prices
    const combo30_30 = services.find(s => s.name.includes('30 min foot + 30 min body'));
    const combo30_60 = services.find(s => s.name.includes('30 min foot + 60 min body'));
    
    if (combo30_30) {
      console.log(`Combo 30+30: $${combo30_30.price.toFixed(2)} ${combo30_30.price === 60 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Combo 30+30: ❌ NOT FOUND');
    }
    
    if (combo30_60) {
      console.log(`Combo 30+60: $${combo30_60.price.toFixed(2)} ${combo30_60.price === 85 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Combo 30+60: ❌ NOT FOUND');
    }
    
    // Body Massage prices
    const body30 = services.find(s => s.name === 'Body Massage - 30 minutes');
    const body60 = services.find(s => s.name === 'Body Massage - 60 minutes');
    const body90 = services.find(s => s.name === 'Body Massage - 90 minutes');
    
    if (body30) {
      console.log(`Body Massage 30min: $${body30.price.toFixed(2)} ${body30.price === 40 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Body Massage 30min: ❌ NOT FOUND');
    }
    
    if (body60) {
      console.log(`Body Massage 60min: $${body60.price.toFixed(2)} ${body60.price === 65 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Body Massage 60min: ❌ NOT FOUND');
    }
    
    if (body90) {
      console.log(`Body Massage 90min: $${body90.price.toFixed(2)} ${body90.price === 90 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('Body Massage 90min: ❌ NOT FOUND');
    }

    console.log('\nVerification completed!');
    
  } catch (error) {
    console.error('Error verifying services:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
}

// Run the verification
verifyServices();
