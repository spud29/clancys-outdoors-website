import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('🔧 Fixing image URLs to point to original online images...');
  
  try {
    // Get all product images
    const images = await prisma.productImage.findMany();
    
    console.log(`Found ${images.length} images to update`);
    
    let updatedCount = 0;
    
    for (const image of images) {
      // Skip if already a full URL
      if (image.url.startsWith('http')) {
        continue;
      }
      
      // Extract filename from the path
      const filename = image.url.replace('/images/', '');
      
      // Create the full URL to the original clancysoutdoors.com image
      let newUrl = '';
      
      // Map common image patterns to their original URLs
      if (filename.includes('Resized-Amish-Stainless-Steel-Fishing-Spear')) {
        newUrl = 'https://clancysoutdoors.com/wp-content/uploads/2016/10/Resized-Amish-Stainless-Steel-Fishing-Spear-9-Tine-1000-x-667-px-1-333x222.jpg';
      } else if (filename.match(/^\d+-333x222\.jpg$/)) {
        // For numbered images like "10-333x222.jpg", "4-333x222.jpg"
        const number = filename.split('-')[0];
        newUrl = `https://clancysoutdoors.com/wp-content/uploads/2016/10/${filename}`;
      } else if (filename.match(/^\d+\.jpg$/)) {
        // For simple numbered images like "10.jpg"
        const number = filename.split('.')[0];
        newUrl = `https://clancysoutdoors.com/wp-content/uploads/2016/10/${number}-333x222.jpg`;
      } else {
        // For other images, try the general pattern
        newUrl = `https://clancysoutdoors.com/wp-content/uploads/2016/10/${filename}`;
      }
      
      // Update the image URL
      await prisma.productImage.update({
        where: { id: image.id },
        data: { url: newUrl }
      });
      
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`Updated ${updatedCount} images...`);
      }
    }
    
    console.log(`✅ Successfully updated ${updatedCount} image URLs`);
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls(); 