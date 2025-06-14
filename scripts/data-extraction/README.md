# Clancy's Outdoors Data Extraction System

This system extracts product and category data from the original HTML files and imports them into the modern Next.js database.

## Architecture

### Phase 1: HTML Parsing (`html-parser.ts`)
- Parses WordPress/WooCommerce HTML files
- Extracts product information (name, price, images, categories)
- Extracts category hierarchies and metadata
- Validates extracted data with Zod schemas
- Handles multiple HTML structures and fallbacks

### Phase 2: Database Import (`database-importer.ts`)
- Imports extracted data into Prisma database
- Maintains referential integrity with transactions
- Creates category hierarchies
- Links products to categories and creates tags
- Provides validation and backup functionality

### Phase 3: Orchestration (`import-clancys-data.ts`)
- Main entry point for the import process
- CLI interface with multiple options
- Error handling and progress reporting
- Data validation and backup creation

## Data Flow

```
HTML Files → HTML Parser → Database Importer → Prisma Database
    ↓              ↓              ↓               ↓
Original Site  Extracted Data  Import Process  Modern Site
```

## Usage

### Quick Start
```bash
# Install dependencies
npm install

# Test extraction (safe)
npm run import-clancys:validate

# Dry run (see what would be imported)
npm run import-clancys:dry-run

# Full import with backup
npm run import-clancys
```

### Advanced Options
```bash
# Clear database and fresh import (DESTRUCTIVE!)
npm run import-clancys -- --clear-database

# Import without backup
npm run import-clancys -- --no-backup

# Custom HTML directory
npm run import-clancys -- --html-dir /path/to/html/files

# Test single file extraction
tsx scripts/test-extraction.ts
```

## Data Structure

### Extracted Product
```typescript
interface ExtractedProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: {
    regular: number;
    sale?: number;
    currency: string;
  };
  description: string;
  images: ExtractedImage[];
  categories: string[];
  inStock: boolean;
  isOnSale: boolean;
  metaData: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

### Extracted Category
```typescript
interface ExtractedCategory {
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string;
  productCount: number;
  metaData: {
    title?: string;
    description?: string;
  };
}
```

## Error Handling

The system handles various error conditions:

- **Parse Errors**: Invalid HTML structure, missing data
- **Validation Errors**: Data that doesn't match expected schemas
- **Database Errors**: Constraint violations, connection issues
- **File System Errors**: Missing files, permission issues

All errors are collected and reported without stopping the entire process.

## Data Validation

Multiple validation layers ensure data integrity:

1. **Schema Validation**: Zod schemas validate extracted data
2. **Database Constraints**: Prisma enforces referential integrity
3. **Post-Import Validation**: Checks for missing relationships
4. **Business Logic Validation**: Ensures sensible data (positive prices, etc.)

## Performance Considerations

- **Batch Processing**: Products imported in transactions
- **Memory Management**: Large files processed incrementally
- **Error Recovery**: Individual failures don't stop entire import
- **Progress Reporting**: Real-time feedback on import status

## Safety Features

- **Backup Creation**: Automatic backup before destructive operations
- **Dry Run Mode**: Preview imports without database changes
- **Transaction Safety**: All imports wrapped in database transactions
- **Validation Only**: Parse and validate without importing

## Troubleshooting

### Common Issues

1. **No products found**: Check HTML structure matches expected selectors
2. **Price parsing errors**: Verify currency format in HTML
3. **Image path issues**: Ensure image URLs are properly converted
4. **Category hierarchy problems**: Check parent-child relationships

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development`

### Manual Verification
After import, use the validation tools:
```bash
# Check database integrity
npm run import-clancys -- --validate-only

# Export data for manual review
tsx scripts/export-data.ts
```

## Extending the System

### Adding New Data Types
1. Extend the `ExtractedProduct` interface
2. Update HTML parsing logic
3. Modify database import logic
4. Update validation schemas

### Custom HTML Structures
The parser supports multiple selectors and fallback logic. Add new selectors to handle different HTML structures.

### Custom Validation Rules
Add business-specific validation rules to the validation schemas and import logic.

## File Structure

```
scripts/
├── data-extraction/
│   ├── html-parser.ts        # HTML parsing logic
│   ├── database-importer.ts  # Database import logic
│   └── README.md            # This file
├── import-clancys-data.ts   # Main orchestrator
└── test-extraction.ts       # Test script
```

## Next Steps

After successful import:

1. **Review Data**: Check admin panel for imported products
2. **Image Processing**: Optimize and serve images properly
3. **SEO Optimization**: Update meta tags and descriptions
4. **Category Refinement**: Adjust hierarchy and organization
5. **Search Configuration**: Set up search indexing
6. **Performance Optimization**: Index database for fast queries 