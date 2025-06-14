#!/usr/bin/env tsx

import { createHTMLParser } from './data-extraction/html-parser';
import { createDatabaseImporter } from './data-extraction/database-importer';
import { promises as fs } from 'fs';
import path from 'path';

interface ImportOptions {
  htmlDir?: string;
  clearDatabase?: boolean;
  exportBackup?: boolean;
  validateOnly?: boolean;
  dryRun?: boolean;
}

/**
 * Main function to import Clancy's Outdoors data from HTML files
 */
async function importClancysData(options: ImportOptions = {}) {
  const {
    htmlDir = 'html',
    clearDatabase = false,
    exportBackup = true,
    validateOnly = false,
    dryRun = false
  } = options;

  console.log(`
🏔️  CLANCY'S OUTDOORS DATA IMPORT
==================================

Starting data import from ${htmlDir}...
Options:
  - Clear Database: ${clearDatabase}
  - Export Backup: ${exportBackup}
  - Validate Only: ${validateOnly}
  - Dry Run: ${dryRun}

`);

  try {
    // Phase 1: Parse HTML files
    console.log('🔍 PHASE 1: Parsing HTML files...');
    const parser = createHTMLParser(htmlDir);
    const { products, categories, errors: parseErrors } = await parser.parseAllFiles();

    if (parseErrors.length > 0) {
      console.log('\n⚠️  Parse Errors:');
      parseErrors.forEach(error => console.log(`   - ${error}`));
    }

    // Save extracted data for review
    const extractedDataPath = 'data/extracted-data.json';
    await fs.mkdir(path.dirname(extractedDataPath), { recursive: true });
    await fs.writeFile(extractedDataPath, JSON.stringify({
      products,
      categories,
      parseErrors,
      extractedAt: new Date().toISOString(),
      stats: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalParseErrors: parseErrors.length
      }
    }, null, 2));

    console.log(`\n📁 Extracted data saved to: ${extractedDataPath}`);

    if (validateOnly) {
      console.log('\n✅ Validation complete. Use --import to proceed with database import.');
      return;
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN - No changes made to database.');
      console.log(`Would import:`);
      console.log(`  - ${products.length} products`);
      console.log(`  - ${categories.length} categories`);
      return;
    }

    // Phase 2: Database operations
    console.log('\n💾 PHASE 2: Database operations...');
    const importer = createDatabaseImporter();

    // Clear database if requested
    if (clearDatabase) {
      console.log('⚠️  Clearing existing database...');
      await importer.clearDatabase();
    }

    // Export backup before import
    if (exportBackup && !clearDatabase) {
      const backupPath = `data/backup-${new Date().toISOString().split('T')[0]}.json`;
      await importer.exportData(backupPath);
      console.log(`📦 Backup saved to: ${backupPath}`);
    }

    // Import data
    console.log('\n🚀 Starting database import...');
    const importResult = await importer.importData(products, categories);

    if (!importResult.success) {
      console.error('\n❌ Import failed!');
      console.error('Errors:');
      importResult.errors.forEach(error => console.error(`   - ${error}`));
      process.exit(1);
    }

    // Phase 3: Validation
    console.log('\n✅ PHASE 3: Validation...');
    const validation = await importer.validateImport();

    // Final summary
    console.log(`
🎉 IMPORT COMPLETE!
==================

📊 Final Statistics:
   Products Imported: ${importResult.stats.productsImported}
   Categories Imported: ${importResult.stats.categoriesImported}
   Images Imported: ${importResult.stats.imagesImported}
   Parse Errors: ${parseErrors.length}
   Import Errors: ${importResult.stats.errorsCount}

📋 Database Validation:
   Total Products: ${validation.stats.totalProducts}
   Total Categories: ${validation.stats.totalCategories}
   Total Images: ${validation.stats.totalImages}
   
${validation.isValid ? '✅ All validations passed!' : '⚠️  Some issues found:'}
${validation.issues.map(issue => `   - ${issue}`).join('\n')}

🎯 Next Steps:
   1. Review the imported data in your admin panel
   2. Check product images and update any broken links
   3. Review category hierarchy and adjust as needed
   4. Test search and filtering functionality
   5. Update SEO metadata for key products

`);

  } catch (error) {
    console.error(`
❌ IMPORT FAILED!
================

Error: ${error instanceof Error ? error.message : 'Unknown error'}
Stack: ${error instanceof Error ? error.stack : 'No stack trace'}

Please check the error details above and try again.
`);
    process.exit(1);
  }
}

/**
 * Enhanced import with image processing
 */
async function importWithImageProcessing(options: ImportOptions = {}) {
  console.log('🖼️  Starting enhanced import with image processing...');
  
  // First run the basic import
  await importClancysData(options);
  
  // Then process images
  console.log('\n🖼️  PHASE 4: Image processing...');
  
  // We'll implement image processing in the next script
  console.log('Image processing will be implemented in the next phase...');
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: ImportOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--clear-database':
        options.clearDatabase = true;
        break;
      case '--no-backup':
        options.exportBackup = false;
        break;
      case '--validate-only':
        options.validateOnly = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--html-dir':
        options.htmlDir = args[++i];
        break;
      case '--help':
        console.log(`
Clancy's Outdoors Data Import Tool
=================================

Usage: npm run import-clancys [options]

Options:
  --clear-database    Clear existing database before import (DESTRUCTIVE!)
  --no-backup         Skip creating backup before import
  --validate-only     Only parse and validate, don't import to database
  --dry-run          Show what would be imported without making changes
  --html-dir <path>   Specify HTML directory (default: 'html')
  --help             Show this help message

Examples:
  npm run import-clancys                    # Basic import with backup
  npm run import-clancys --validate-only   # Just validate the HTML parsing
  npm run import-clancys --dry-run         # See what would be imported
  npm run import-clancys --clear-database  # Fresh import (destructive!)

`);
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          console.error('Use --help for available options');
          process.exit(1);
        }
        break;
    }
  }

  // Run the import
  importClancysData(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export { importClancysData, importWithImageProcessing };
export type { ImportOptions }; 