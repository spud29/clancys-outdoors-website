import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function extractProductImages() {
  console.log('🔍 Extracting product images from HTML files...');
  
  const htmlDir = 'html';
  const sourceImageDir = 'images';
  const targetImageDir = 'public/images';
  
  // Get all HTML files
  const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));
  
  const imageSet = new Set<string>();
  const imageUrls = new Map<string, string>(); // filename -> full URL
  
  // Extract all image references from HTML files
  for (const htmlFile of htmlFiles) {
    console.log(`Processing ${htmlFile}...`);
    const content = fs.readFileSync(path.join(htmlDir, htmlFile), 'utf8');
    
    // Find all image src attributes
    const imgRegex = /src="([^"]*\.(jpg|jpeg|png|gif|webp))"/gi;
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      const imageSrc = match[1];
      
      // Extract filename from different URL patterns
      let filename = '';
      
      if (imageSrc.startsWith('../images/')) {
        filename = imageSrc.replace('../images/', '');
        imageSet.add(filename);
      } else if (imageSrc.includes('/wp-content/uploads/')) {
        // Extract filename from WordPress URLs
        const urlParts = imageSrc.split('/');
        filename = urlParts[urlParts.length - 1];
        imageSet.add(filename);
        imageUrls.set(filename, imageSrc);
      }
    }
    
    // Also check srcset attributes for higher quality images
    const srcsetRegex = /srcset="([^"]*\.(jpg|jpeg|png|gif|webp))"/gi;
    while ((match = srcsetRegex.exec(content)) !== null) {
      const imageSrc = match[1];
      if (imageSrc.includes('/wp-content/uploads/')) {
        const urlParts = imageSrc.split('/');
        const filename = urlParts[urlParts.length - 1];
        imageSet.add(filename);
        imageUrls.set(filename, imageSrc);
      }
    }
  }
  
  console.log(`Found ${imageSet.size} unique product images`);
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetImageDir)) {
    fs.mkdirSync(targetImageDir, { recursive: true });
  }
  
  let copiedCount = 0;
  const missingImages: string[] = [];
  
  // Copy images from source to target directory
  for (const filename of Array.from(imageSet)) {
    const sourcePath = path.join(sourceImageDir, filename);
    const targetPath = path.join(targetImageDir, filename);
    
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(targetPath)) {
        try {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Copied: ${filename}`);
          copiedCount++;
        } catch (error) {
          console.error(`❌ Failed to copy ${filename}:`, error);
        }
      }
    } else {
      // Image doesn't exist locally, we'll need to use the full URL
      missingImages.push(filename);
      if (imageUrls.has(filename)) {
        console.log(`🌐 Missing locally, has URL: ${filename} -> ${imageUrls.get(filename)}`);
      } else {
        console.log(`❓ Missing: ${filename}`);
      }
    }
  }
  
  console.log(`✅ Copied ${copiedCount} images to public/images/`);
  console.log(`❓ ${missingImages.length} images are missing locally and will use URLs`);
  
  return { copiedCount, missingImages, imageUrls };
}

async function updateDatabaseImagePaths() {
  console.log('🔧 Updating database image paths...');
  
  try {
    // Get all product images that use relative paths
    const images = await prisma.productImage.findMany({
      where: {
        url: {
          startsWith: '/images/'
        }
      }
    });
    
    console.log(`Found ${images.length} images with relative paths to update`);
    
    let updatedCount = 0;
    
    for (const image of images) {
      const filename = image.url.replace('/images/', '');
      const publicImagePath = path.join('public/images', filename);
      
      if (fs.existsSync(publicImagePath)) {
        // Image exists in public directory, keep the relative path
        // Next.js will serve this from /images/filename
        console.log(`✅ Image exists locally: ${filename}`);
      } else {
        // Image doesn't exist locally, try to use the original URL
        let newUrl = image.url;
        
        // Common patterns for updating to full URLs
        if (filename.includes('-333x')) {
          newUrl = `https://clancysoutdoors.com/wp-content/uploads/2016/10/${filename}`;
        } else if (filename.match(/^\d+.*\.jpg$/)) {
          newUrl = `https://clancysoutdoors.com/wp-content/uploads/2016/10/${filename}`;
        } else {
          newUrl = `https://clancysoutdoors.com/wp-content/uploads/2016/10/${filename}`;
        }
        
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: newUrl }
        });
        
        console.log(`🌐 Updated to URL: ${filename} -> ${newUrl}`);
        updatedCount++;
      }
    }
    
    console.log(`✅ Updated ${updatedCount} image URLs in database`);
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  }
}

async function main() {
  console.log('🚀 Starting Vercel image fix...');
  
  try {
    // Step 1: Extract and copy images from HTML files
    const { copiedCount, missingImages } = await extractProductImages();
    
    // Step 2: Update database image paths
    await updateDatabaseImagePaths();
    
    console.log('\n🎉 Image fix completed!');
    console.log(`✅ ${copiedCount} images copied to public/images/`);
    console.log(`🌐 Missing images will use original URLs from clancysoutdoors.com`);
    console.log('\n📝 Next steps:');
    console.log('1. Commit and push the changes to Git');
    console.log('2. Redeploy to Vercel');
    console.log('3. Images should now display correctly on the deployed site');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 