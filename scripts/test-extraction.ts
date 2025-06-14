#!/usr/bin/env tsx

import { createHTMLParser } from './data-extraction/html-parser';
import { promises as fs } from 'fs';

/**
 * Test script to verify HTML extraction on a single file
 */
async function testExtraction() {
  console.log('🧪 Testing HTML extraction...\n');

  try {
    const parser = createHTMLParser('html');
    
    // Test with a single file first
    const testFile = 'html/ice-fishing-products.html';
    
    console.log(`📄 Reading test file: ${testFile}`);
    const content = await fs.readFile(testFile, 'utf-8');
    
    console.log(`📊 File size: ${Math.round(content.length / 1024)}KB`);
    
    // Test the parsing
    const result = await parser['parseFile'](content, 'ice-fishing-products.html');
    
    console.log('\n✅ Extraction Results:');
    console.log(`   Category: ${result.category?.name || 'None'}`);
    console.log(`   Products found: ${result.products.length}`);
    
    if (result.products.length > 0) {
      console.log('\n📦 Sample Product:');
      const sample = result.products[0];
      console.log(`   Name: ${sample.name}`);
      console.log(`   Price: $${sample.price.regular}${sample.price.sale ? ` (Sale: $${sample.price.sale})` : ''}`);
      console.log(`   Categories: ${sample.categories.join(', ')}`);
      console.log(`   Images: ${sample.images.length}`);
      console.log(`   In Stock: ${sample.inStock}`);
      console.log(`   On Sale: ${sample.isOnSale}`);
      
      if (sample.images.length > 0) {
        console.log('\n🖼️  Sample Image:');
        console.log(`   URL: ${sample.images[0].url}`);
        console.log(`   Alt: ${sample.images[0].alt}`);
      }
    }

    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testExtraction();
} 