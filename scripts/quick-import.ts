#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';

/**
 * Quick import script with smaller batches
 */
async function quickImport() {
  console.log('🚀 Quick Import - Processing in small batches...\n');

  const prisma = new PrismaClient();

  try {
    // Read the extracted data
    const extractedData = JSON.parse(await fs.readFile('data/extracted-data.json', 'utf-8'));
    const { products, categories } = extractedData;

    console.log(`📊 Found ${products.length} products and ${categories.length} categories`);

    // Import categories first (small batch)
    console.log('\n📁 Importing categories...');
    let categoryCount = 0;
    
    for (const category of categories.slice(0, 20)) { // First 20 categories
      try {
        await prisma.productCategory.upsert({
          where: { slug: category.slug },
          update: {
            name: category.name,
            description: category.description || null,
          },
          create: {
            name: category.name,
            slug: category.slug,
            description: category.description || null,
          }
        });
        categoryCount++;
        if (categoryCount % 5 === 0) {
          console.log(`   ✅ Imported ${categoryCount} categories...`);
        }
      } catch (error) {
        console.log(`   ⚠️  Skipped category ${category.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Imported ${categoryCount} categories`);

    // Import products in small batches
    console.log('\n📦 Importing products...');
    let productCount = 0;
    const batchSize = 10;

    for (let i = 0; i < Math.min(products.length, 50); i += batchSize) { // First 50 products
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          await prisma.product.upsert({
            where: { slug: product.slug },
            update: {
              name: product.name,
              description: product.description || null,
              regularPrice: product.price.regular,
              salePrice: product.price.sale || null,
              inStock: product.inStock,
            },
            create: {
              name: product.name,
              slug: product.slug,
              sku: product.sku || null,
              description: product.description || null,
              regularPrice: product.price.regular,
              salePrice: product.price.sale || null,
              inStock: product.inStock,
              status: 'ACTIVE',
            }
          });
          productCount++;
        } catch (error) {
          console.log(`   ⚠️  Skipped product ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      console.log(`   ✅ Imported ${productCount} products...`);
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 IMPORT COMPLETE!
    
📊 Results:
   Categories: ${categoryCount}
   Products: ${productCount}
   
🎯 Next Steps:
   1. Check your Supabase dashboard to see the imported data
   2. Run your Next.js app: npm run dev
   3. Import more data by running the full import later
   
Your Clancy's Outdoors store is now live with sample data! 🚀`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  quickImport();
}

export { quickImport }; 