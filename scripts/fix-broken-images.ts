import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function fixBrokenImages() {
  console.log('🔧 Fixing broken image URLs...');
  
  try {
    // Get all product images
    const images = await prisma.productImage.findMany({
      include: {
        product: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });
    
    console.log(`Found ${images.length} images to check`);
    
    let checkedCount = 0;
    let brokenCount = 0;
    let fixedCount = 0;
    const availableImages = fs.readdirSync('public/images').filter(file => 
      file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.webp')
    );
    
    console.log(`Available local images: ${availableImages.length}`);
    
    for (const image of images) {
      checkedCount++;
      
      if (checkedCount % 10 === 0) {
        console.log(`Progress: ${checkedCount}/${images.length}`);
      }
      
      try {
        // Test if image URL is accessible
        const response = await fetch(image.url, { method: 'HEAD' });
        
        if (!response.ok) {
          console.log(`❌ Broken image (${response.status}): ${image.url}`);
          brokenCount++;
          
          // Try to find a local replacement
          const filename = path.basename(image.url);
          let replacementUrl = null;
          
          // Check if we have this exact file locally
          if (availableImages.includes(filename)) {
            replacementUrl = `/images/${filename}`;
            console.log(`   ✅ Found exact local match: ${filename}`);
          } else {
            // Try to find a similar image or use a placeholder
            const productSlug = image.product.slug;
            const fallbackImage = availableImages.find(img => 
              img.includes(productSlug.split('-')[0]) || 
              img.includes('placeholder') ||
              img.includes('default')
            ) || availableImages[0]; // Use first available image as last resort
            
            if (fallbackImage) {
              replacementUrl = `/images/${fallbackImage}`;
              console.log(`   🔄 Using fallback: ${fallbackImage}`);
            }
          }
          
          // Update the database with the replacement URL
          if (replacementUrl) {
            await prisma.productImage.update({
              where: { id: image.id },
              data: { url: replacementUrl }
            });
            fixedCount++;
          } else {
            // Use a generic placeholder from Unsplash
            const placeholderUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
            await prisma.productImage.update({
              where: { id: image.id },
              data: { url: placeholderUrl }
            });
            fixedCount++;
            console.log(`   🔄 Using generic placeholder`);
          }
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Error checking ${image.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        brokenCount++;
        
        // Use placeholder for network errors
        const placeholderUrl = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: placeholderUrl }
        });
        fixedCount++;
      }
    }
    
    console.log('\n🎉 Image fix completed!');
    console.log(`📊 Results:`);
    console.log(`   Total images checked: ${checkedCount}`);
    console.log(`   Broken images found: ${brokenCount}`);
    console.log(`   Images fixed: ${fixedCount}`);
    console.log(`   Working images: ${checkedCount - brokenCount}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Commit and push changes to Git');
    console.log('2. Redeploy to Vercel');
    console.log('3. Images should now display correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBrokenImages(); 