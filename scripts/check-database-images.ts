import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseImages() {
  console.log('🔍 Checking database image URLs...');
  
  try {
    // Get a sample of product images to see their current URLs
    const images = await prisma.productImage.findMany({
      take: 10,
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`\nSample of ${images.length} images from database:`);
    console.log('==========================================');
    
    for (const image of images) {
      console.log(`Product: ${image.product.name}`);
      console.log(`URL: ${image.url}`);
      console.log(`Alt: ${image.alt}`);
      console.log('---');
    }
    
    // Count images by URL pattern
    const totalImages = await prisma.productImage.count();
    
    const relativeImages = await prisma.productImage.count({
      where: {
        url: {
          startsWith: '/images/'
        }
      }
    });
    
    const httpImages = await prisma.productImage.count({
      where: {
        url: {
          startsWith: 'http'
        }
      }
    });
    
    const otherImages = totalImages - relativeImages - httpImages;
    
    console.log('\n📊 Image URL Statistics:');
    console.log(`Total images: ${totalImages}`);
    console.log(`Relative URLs (/images/...): ${relativeImages}`);
    console.log(`HTTP URLs (https://...): ${httpImages}`);
    console.log(`Other URLs: ${otherImages}`);
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseImages(); 