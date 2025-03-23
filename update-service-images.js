/**
 * Update Service Images
 * 
 * This script updates the existing services with Asian massage images
 * to make the booking page more attractive to customers in Colorado Springs.
 */

const { sequelize, Service } = require('./models');

// Image URLs for different massage types with properly sized and formatted images
const serviceImages = {
  // Exact service names from our database
  'Foot Massage - 30 minutes': 'https://images.pexels.com/photos/3865548/pexels-photo-3865548.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Foot Massage - 60 minutes': 'https://images.pexels.com/photos/3865557/pexels-photo-3865557.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Combo Massage - 30 min foot + 30 min body': 'https://images.pexels.com/photos/3865545/pexels-photo-3865545.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Combo Massage - 30 min foot + 60 min body': 'https://images.pexels.com/photos/5240677/pexels-photo-5240677.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Body Massage - 30 minutes': 'https://images.pexels.com/photos/5699516/pexels-photo-5699516.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Body Massage - 60 minutes': 'https://images.pexels.com/photos/5699431/pexels-photo-5699431.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Body Massage - 90 minutes': 'https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=600',
  
  // Generic keywords for fallback
  'Foot Massage': 'https://images.pexels.com/photos/3865548/pexels-photo-3865548.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Combo Massage': 'https://images.pexels.com/photos/3865545/pexels-photo-3865545.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Body Massage': 'https://images.pexels.com/photos/5699431/pexels-photo-5699431.jpeg?auto=compress&cs=tinysrgb&w=600'
};

// Default image if no specific image is found
const defaultImage = 'https://images.pexels.com/photos/5699423/pexels-photo-5699423.jpeg?auto=compress&cs=tinysrgb&w=600';

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
        for (const [keyword, url] of Object.entries(serviceImages)) {
          if (service.name.toLowerCase().includes(keyword.toLowerCase())) {
            imageUrl = url;
            break;
          }
        }
      }
      
      // If still no match, use default image
      if (!imageUrl) {
        imageUrl = defaultImage;
      }
      
      console.log(`Updating service "${service.name}" with image: ${imageUrl}`);
      
      // Update the service with the image URL
      await service.update({ imageUrl });
    }
    
    console.log('All services updated with properly sized and formatted images successfully!');
    
  } catch (error) {
    console.error('Error updating service images:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateServiceImages();
