/**
 * Update Service Images
 * 
 * This script updates the existing services with appropriate images
 * to make the booking page more attractive to customers.
 */

const { sequelize, Service } = require('./models');

// Image URLs for different massage types
const serviceImages = {
  'Foot Massage': 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?q=80&w=1470&auto=format&fit=crop',
  'Swedish Massage': 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1470&auto=format&fit=crop',
  'Deep Tissue Massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1470&auto=format&fit=crop',
  'Hot Stone Massage': 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=1470&auto=format&fit=crop',
  'Aromatherapy Massage': 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?q=80&w=1470&auto=format&fit=crop',
  'Sports Massage': 'https://images.unsplash.com/photo-1573045619673-a0f8c5b5d53e?q=80&w=1470&auto=format&fit=crop',
  'Prenatal Massage': 'https://images.unsplash.com/photo-1591343395082-e120087004b4?q=80&w=1471&auto=format&fit=crop',
  'Couples Massage': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1470&auto=format&fit=crop',
  'Chair Massage': 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1374&auto=format&fit=crop'
};

// Default image if no specific image is found
const defaultImage = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1470&auto=format&fit=crop';

async function updateServiceImages() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    
    console.log('Fetching all services...');
    const services = await Service.findAll();
    
    console.log(`Found ${services.length} services`);
    
    // Update each service with an appropriate image
    for (const service of services) {
      // Find an image that matches the service name or contains keywords
      let imageUrl = null;
      
      // First try exact match
      for (const [keyword, url] of Object.entries(serviceImages)) {
        if (service.name.includes(keyword)) {
          imageUrl = url;
          break;
        }
      }
      
      // If no match, use default image
      if (!imageUrl) {
        imageUrl = defaultImage;
      }
      
      console.log(`Updating service "${service.name}" with image: ${imageUrl}`);
      
      // Update the service with the image URL
      await service.update({ imageUrl });
    }
    
    console.log('All services updated with images successfully!');
    
  } catch (error) {
    console.error('Error updating service images:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateServiceImages();
