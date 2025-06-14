// Test using built-in fetch (Node 18+)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testImageAccess() {
  console.log('🔍 Testing image URL accessibility...');
  
  try {
    // Get a few sample image URLs from database
    const images = await prisma.productImage.findMany({
      take: 5,
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log(`Testing ${images.length} sample images:`);
    console.log('==========================================');
    
    for (const image of images) {
      console.log(`\nProduct: ${image.product.name}`);
      console.log(`URL: ${image.url}`);
      
      try {
        const response = await fetch(image.url, { method: 'HEAD' });
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('✅ Image accessible');
        } else {
          console.log('❌ Image not accessible');
        }
      } catch (error) {
        console.log('❌ Error accessing image:', error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // Test if the original domain is accessible
    console.log('\n🌐 Testing main domain accessibility...');
    try {
      const response = await fetch('https://clancysoutdoors.com', { method: 'HEAD' });
      console.log(`Main site status: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log('❌ Main site not accessible:', error instanceof Error ? error.message : 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Error testing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImageAccess(); 