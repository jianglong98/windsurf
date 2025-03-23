/**
 * Update Service Images
 * 
 * This script updates the existing services with Asian massage images
 * to make the booking page more attractive to customers in Colorado Springs.
 */

const { sequelize, Service } = require('./models');

// Image URLs for different massage types with Asian massage themes from Getty Images and iStock
const serviceImages = {
  // Exact service names from our database
  'Foot Massage - 30 minutes': 'https://media.gettyimages.com/id/1398228398/photo/reflexology-foot-massage-asian-thai-style-foot-massage.jpg?s=612x612&w=0&k=20&c=qxRQRPRqPXWgzgxEsLOFDNxAOTQyQxZZ1_-YVNGkVYs=',
  'Foot Massage - 60 minutes': 'https://media.gettyimages.com/id/1398228396/photo/reflexology-foot-massage-asian-thai-style-foot-massage.jpg?s=612x612&w=0&k=20&c=Kz-kgXTu-Aq9iKSNBKGPDLxPvKHxJZnUUYvTJQD4Qic=',
  'Combo Massage - 30 min foot + 30 min body': 'https://media.gettyimages.com/id/1398228401/photo/reflexology-foot-massage-asian-thai-style-foot-massage.jpg?s=612x612&w=0&k=20&c=RnLvxGWKBsQPdXc7OwWC5SbGiTAhyPGKzDjpFvbXGEQ=',
  'Combo Massage - 30 min foot + 60 min body': 'https://media.gettyimages.com/id/1312705508/photo/asian-woman-relaxing-while-receiving-back-massage-in-spa-salon.jpg?s=612x612&w=0&k=20&c=lHSUbXWKBpLGXYCgZc7yjwVUJO5TJZ3_gYKQDECWt0M=',
  'Body Massage - 30 minutes': 'https://media.gettyimages.com/id/1312705506/photo/asian-woman-relaxing-while-receiving-back-massage-in-spa-salon.jpg?s=612x612&w=0&k=20&c=dHM9FUDQCYFLtQpGQmUe0_AaVW9Uyl4JKDrvCJSrJQE=',
  'Body Massage - 60 minutes': 'https://media.gettyimages.com/id/1312705505/photo/asian-woman-relaxing-while-receiving-back-massage-in-spa-salon.jpg?s=612x612&w=0&k=20&c=Hy9U8KAHQEbdXgxRMvx4WZlW3-dXDXCOUE_BgMCLVwE=',
  'Body Massage - 90 minutes': 'https://media.gettyimages.com/id/1312705507/photo/asian-woman-relaxing-while-receiving-back-massage-in-spa-salon.jpg?s=612x612&w=0&k=20&c=lHSUbXWKBpLGXYCgZc7yjwVUJO5TJZ3_gYKQDECWt0M=',
  
  // Generic keywords for fallback
  'Foot Massage': 'https://media.gettyimages.com/id/1398228398/photo/reflexology-foot-massage-asian-thai-style-foot-massage.jpg?s=612x612&w=0&k=20&c=qxRQRPRqPXWgzgxEsLOFDNxAOTQyQxZZ1_-YVNGkVYs=',
  'Combo Massage': 'https://media.gettyimages.com/id/1398228401/photo/reflexology-foot-massage-asian-thai-style-foot-massage.jpg?s=612x612&w=0&k=20&c=RnLvxGWKBsQPdXc7OwWC5SbGiTAhyPGKzDjpFvbXGEQ=',
  'Body Massage': 'https://media.gettyimages.com/id/1312705505/photo/asian-woman-relaxing-while-receiving-back-massage-in-spa-salon.jpg?s=612x612&w=0&k=20&c=Hy9U8KAHQEbdXgxRMvx4WZlW3-dXDXCOUE_BgMCLVwE='
};

// Default image if no specific image is found
const defaultImage = 'https://media.gettyimages.com/id/1312705508/photo/asian-woman-relaxing-while-receiving-back-massage-in-spa-salon.jpg?s=612x612&w=0&k=20&c=lHSUbXWKBpLGXYCgZc7yjwVUJO5TJZ3_gYKQDECWt0M=';

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
