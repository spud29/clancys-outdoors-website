#!/usr/bin/env tsx

import { createHTMLParser } from './data-extraction/html-parser';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Extract data to JSON files without database operations
 */
async function extractToJSON() {
  console.log(`
🏔️  CLANCY'S OUTDOORS DATA EXTRACTION
===================================

Extracting product data to JSON files for review...
`);

  try {
    // Phase 1: Parse HTML files
    console.log('🔍 Parsing HTML files...');
    const parser = createHTMLParser('html');
    const { products, categories, errors } = await parser.parseAllFiles();

    // Create data directory
    await fs.mkdir('data', { recursive: true });

    // Save detailed product data
    const productData = {
      products,
      extractedAt: new Date().toISOString(),
      stats: {
        totalProducts: products.length,
        productsWithImages: products.filter(p => p.images.length > 0).length,
        productsOnSale: products.filter(p => p.isOnSale).length,
        priceRange: {
          min: Math.min(...products.map(p => p.price.regular)),
          max: Math.max(...products.map(p => p.price.regular)),
          average: products.reduce((sum, p) => sum + p.price.regular, 0) / products.length
        }
      }
    };

    await fs.writeFile('data/products.json', JSON.stringify(productData, null, 2));
    console.log(`✅ Saved ${products.length} products to data/products.json`);

    // Save category data
    const categoryData = {
      categories,
      extractedAt: new Date().toISOString(),
      stats: {
        totalCategories: categories.length,
        topCategories: categories
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 10)
          .map(c => ({ name: c.name, productCount: c.productCount }))
      }
    };

    await fs.writeFile('data/categories.json', JSON.stringify(categoryData, null, 2));
    console.log(`✅ Saved ${categories.length} categories to data/categories.json`);

    // Save sample products by category
    const samplesByCategory: Record<string, any[]> = {};
    for (const category of categories.slice(0, 20)) { // Top 20 categories
      const categoryProducts = products.filter(p => 
        p.categories.includes(category.name)
      ).slice(0, 5); // 5 samples per category
      
      if (categoryProducts.length > 0) {
        samplesByCategory[category.name] = categoryProducts.map(p => ({
          name: p.name,
          price: p.price,
          slug: p.slug,
          images: p.images.length,
          inStock: p.inStock,
          isOnSale: p.isOnSale
        }));
      }
    }

    await fs.writeFile('data/samples-by-category.json', JSON.stringify(samplesByCategory, null, 2));
    console.log(`✅ Saved product samples by category to data/samples-by-category.json`);

    // Save error report
    if (errors.length > 0) {
      await fs.writeFile('data/extraction-errors.json', JSON.stringify({ errors, errorCount: errors.length }, null, 2));
      console.log(`⚠️  Saved ${errors.length} errors to data/extraction-errors.json`);
    }

    // Generate summary report
    const summary = {
      extractionDate: new Date().toISOString(),
      totals: {
        products: products.length,
        categories: categories.length,
        errors: errors.length
      },
      productStats: {
        withImages: products.filter(p => p.images.length > 0).length,
        onSale: products.filter(p => p.isOnSale).length,
        inStock: products.filter(p => p.inStock).length,
        averagePrice: Math.round(products.reduce((sum, p) => sum + p.price.regular, 0) / products.length),
        priceRange: `$${Math.min(...products.map(p => p.price.regular))} - $${Math.max(...products.map(p => p.price.regular))}`
      },
      topCategories: categories
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, 15)
        .map(c => ({ name: c.name, products: c.productCount })),
      sampleProducts: products.slice(0, 10).map(p => ({
        name: p.name,
        price: `$${p.price.regular}${p.price.sale ? ` (Sale: $${p.price.sale})` : ''}`,
        categories: p.categories.slice(0, 3),
        images: p.images.length
      }))
    };

    await fs.writeFile('data/extraction-summary.json', JSON.stringify(summary, null, 2));

    console.log(`
🎉 EXTRACTION COMPLETE!
======================

📊 Summary:
   Products: ${products.length}
   Categories: ${categories.length}
   Errors: ${errors.length}
   
💰 Price Analysis:
   Average Price: $${Math.round(products.reduce((sum, p) => sum + p.price.regular, 0) / products.length)}
   Price Range: $${Math.min(...products.map(p => p.price.regular))} - $${Math.max(...products.map(p => p.price.regular))}
   On Sale: ${products.filter(p => p.isOnSale).length} products
   
📂 Files Created:
   📄 data/products.json - All product data
   📄 data/categories.json - All category data
   📄 data/samples-by-category.json - Product samples by category
   📄 data/extraction-summary.json - Human-readable summary
   ${errors.length > 0 ? '📄 data/extraction-errors.json - Error report' : ''}

🎯 Top Categories:
${categories
  .sort((a, b) => b.productCount - a.productCount)
  .slice(0, 10)
  .map(c => `   ${c.name}: ${c.productCount} products`)
  .join('\n')}

🎯 Next Steps:
   1. Review the extracted data in the data/ folder
   2. Set up your database (PostgreSQL recommended)
   3. Run the database import: npm run import-clancys
   
Your original website data is now fully extracted and ready to import! 🚀
`);

  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  extractToJSON();
}

export { extractToJSON }; 