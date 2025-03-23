/**
 * Update Service Images
 * 
 * This script updates the existing services with Asian massage images
 * to make the booking page more attractive to customers in Colorado Springs.
 */

const { sequelize, Service } = require('./models');

// Image URLs for different massage types with Asian massage themes
const serviceImages = {
  // Exact service names from our database
  'Foot Massage - 30 minutes': 'https://img.freepik.com/premium-photo/asian-woman-giving-traditional-thai-foot-massage-spa_35674-3108.jpg',
  'Foot Massage - 60 minutes': 'https://img.freepik.com/premium-photo/asian-woman-giving-traditional-thai-foot-massage-spa_35674-3109.jpg',
  'Combo Massage - 30 min foot + 30 min body': 'https://img.freepik.com/premium-photo/asian-woman-getting-combination-foot-body-massage-spa_35674-14247.jpg',
  'Combo Massage - 30 min foot + 60 min body': 'https://img.freepik.com/premium-photo/asian-woman-getting-combination-foot-body-massage-spa_35674-14248.jpg',
  'Body Massage - 30 minutes': 'https://img.freepik.com/premium-photo/asian-woman-getting-full-body-massage-spa_35674-14249.jpg',
  'Body Massage - 60 minutes': 'https://img.freepik.com/premium-photo/asian-woman-getting-full-body-massage-spa_35674-14250.jpg',
  'Body Massage - 90 minutes': 'https://img.freepik.com/premium-photo/asian-woman-getting-full-body-massage-spa_35674-14251.jpg',
  
  // Generic keywords for fallback
  'Foot Massage': 'https://img.freepik.com/premium-photo/asian-woman-giving-traditional-thai-foot-massage-spa_35674-3108.jpg',
  'Combo Massage': 'https://img.freepik.com/premium-photo/asian-woman-getting-combination-foot-body-massage-spa_35674-14247.jpg',
  'Body Massage': 'https://img.freepik.com/premium-photo/asian-woman-getting-full-body-massage-spa_35674-14250.jpg'
};

// Default image if no specific image is found
const defaultImage = 'https://img.freepik.com/premium-photo/asian-massage-therapist-welcoming-client-spa_35674-14252.jpg';

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
    
    console.log('All services updated with Asian massage images successfully!');
    
  } catch (error) {
    console.error('Error updating service images:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the update
updateServiceImages();
