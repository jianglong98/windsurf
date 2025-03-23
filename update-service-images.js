/**
 * Update Service Images
 * 
 * This script updates the existing services with properly sized and formatted massage images
 * that match the service descriptions.
 */

const { sequelize, Service } = require('./models');

// Image URLs for different massage types with normalized dimensions (600x400) and consistent format
const serviceImages = {
  // Foot Massage Images - showing feet/lower legs with consistent style
  'Foot Massage - 30 minutes': 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vdCUyMG1hc3NhZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&h=400&q=80',
  'Foot Massage - 60 minutes': 'https://images.pexels.com/photos/4506108/pexels-photo-4506108.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
  
  // Combo Massage Images - showing combination of techniques
  'Combo Massage - 30 min foot + 30 min body': 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fG1hc3NhZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&h=400&q=80',
  'Combo Massage - 30 min foot + 60 min body': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG1hc3NhZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&h=400&q=80',
  
  // Body Massage Images - showing full body massage with consistent style
  'Body Massage - 30 minutes': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8Ym9keSUyMG1hc3NhZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&h=400&q=80',
  'Body Massage - 60 minutes': 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
  'Body Massage - 90 minutes': 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
  
  // Generic keywords for fallback - all with same dimensions
  'Foot Massage': 'https://images.pexels.com/photos/4506108/pexels-photo-4506108.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
  'Combo Massage': 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzB8fG1hc3NhZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&h=400&q=80',
  'Body Massage': 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=600&h=400'
};

// Default image if no specific image is found - same dimensions as others
const defaultImage = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzc2FnZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&h=400&q=80';

async function updateServiceImages() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Fetching all services...');
    const services = await Service.findAll();
    
    console.log(`Found ${services.length} services`);
    
    // Update each service with an appropriate image
    for (const service of services) {
      // Find an image that matches the service name exactly first
      let imageUrl = serviceImages[service.name];
      
      // If no exact match, try partial match
      if (!imageUrl) {
        // Check for partial matches in the service name
        for (const [key, url] of Object.entries(serviceImages)) {
          if (service.name.includes(key)) {
            imageUrl = url;
            break;
          }
        }
      }
      
      // If still no match, use default image
      if (!imageUrl) {
        imageUrl = defaultImage;
      }
      
      // Update the service with the new image URL
      console.log(`Updating service "${service.name}" with image: ${imageUrl}`);
      await service.update({ imageUrl });
    }
    
    console.log('All service images updated successfully!');
  } catch (error) {
    console.error('Error updating service images:', error);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the update
updateServiceImages();
