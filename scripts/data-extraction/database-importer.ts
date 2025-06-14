import { PrismaClient } from '@prisma/client';
import { ExtractedProduct, ExtractedCategory, ExtractedImage } from './html-parser';
import { promises as fs } from 'fs';
import path from 'path';

export interface ImportResult {
  success: boolean;
  stats: {
    productsImported: number;
    categoriesImported: number;
    imagesImported: number;
    errorsCount: number;
  };
  errors: string[];
}

export class DatabaseImporter {
  private prisma: PrismaClient;
  
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Import extracted data into the database
   */
  async importData(
    products: ExtractedProduct[], 
    categories: ExtractedCategory[]
  ): Promise<ImportResult> {
    const errors: string[] = [];
    let productsImported = 0;
    let categoriesImported = 0;
    let imagesImported = 0;

    try {
      console.log('🚀 Starting database import...');
      
      // Start transaction for data integrity
      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Import categories first (products depend on them)
        console.log('📂 Importing categories...');
        const categoryMap = await this.importCategories(tx, categories, errors);
        categoriesImported = Object.keys(categoryMap).length;

        // 2. Import products
        console.log('📦 Importing products...');
        const productResults = await this.importProducts(tx, products, categoryMap, errors);
        productsImported = productResults.productsImported;
        imagesImported = productResults.imagesImported;

        return {
          categoriesImported,
          productsImported,
          imagesImported
        };
      });

      console.log('✅ Import completed successfully!');
      console.log(`📊 Import Summary:`);
      console.log(`   Categories: ${result.categoriesImported}`);
      console.log(`   Products: ${result.productsImported}`);
      console.log(`   Images: ${result.imagesImported}`);
      console.log(`   Errors: ${errors.length}`);

      return {
        success: true,
        stats: {
          ...result,
          errorsCount: errors.length
        },
        errors
      };

    } catch (error) {
      const errorMsg = `Database import failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error('❌', errorMsg);
      errors.push(errorMsg);
      
      return {
        success: false,
        stats: {
          productsImported,
          categoriesImported,
          imagesImported,
          errorsCount: errors.length
        },
        errors
      };
    } finally {
      await this.prisma.$disconnect();
    }
  }

  /**
   * Import categories with hierarchy support
   */
  private async importCategories(
    tx: any,
    categories: ExtractedCategory[],
    errors: string[]
  ): Promise<Record<string, string>> {
    const categoryMap: Record<string, string> = {};

    // Sort categories by hierarchy (parents first)
    const sortedCategories = this.sortCategoriesByHierarchy(categories);

    for (const category of sortedCategories) {
      try {
        // Check if category already exists
        const existing = await tx.productCategory.findUnique({
          where: { slug: category.slug }
        });

        if (existing) {
          categoryMap[category.name] = existing.id;
          console.log(`   ↳ Category already exists: ${category.name}`);
          continue;
        }

        // Find parent category ID if specified
        let parentId: string | undefined;
        if (category.parentCategory) {
          parentId = categoryMap[category.parentCategory];
        }

        // Calculate level based on parent
        const level = parentId ? 1 : 0; // Simple 2-level hierarchy for now

        // Create category
        const created = await tx.productCategory.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            parentId,
            level,
            productCount: category.productCount,
            imageUrl: null // Will be populated later if images are available
          }
        });

        categoryMap[category.name] = created.id;
        console.log(`   ✅ Created category: ${category.name} (${created.id})`);

      } catch (error) {
        const errorMsg = `Failed to import category ${category.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }

    return categoryMap;
  }

  /**
   * Import products with images and category relationships
   */
  private async importProducts(
    tx: any,
    products: ExtractedProduct[],
    categoryMap: Record<string, string>,
    errors: string[]
  ): Promise<{ productsImported: number; imagesImported: number }> {
    let productsImported = 0;
    let imagesImported = 0;

    for (const product of products) {
      try {
        // Check if product already exists
        const existing = await tx.product.findUnique({
          where: { slug: product.slug }
        });

        if (existing) {
          console.log(`   ↳ Product already exists: ${product.name}`);
          continue;
        }

        // Create the product
        const createdProduct = await tx.product.create({
          data: {
            sku: product.sku || `SKU-${product.slug}`,
            name: product.name,
            description: product.description,
            shortDescription: product.shortDescription,
            slug: product.slug,
            status: 'ACTIVE',
            regularPrice: product.price.regular,
            salePrice: product.price.sale,
            currency: product.price.currency,
            trackInventory: true,
            quantity: 100, // Default quantity
            lowStockThreshold: 5,
            inStock: product.inStock,
            metaTitle: product.metaData.title,
            metaDescription: product.metaData.description
          }
        });

        // Import product images
        if (product.images.length > 0) {
          const imageResults = await this.importProductImages(tx, createdProduct.id, product.images, errors);
          imagesImported += imageResults;
        }

        // Link to categories
        await this.linkProductCategories(tx, createdProduct.id, product.categories, categoryMap, errors);

        // Create tags if any keywords exist
        if (product.metaData.keywords && product.metaData.keywords.length > 0) {
          await this.createProductTags(tx, createdProduct.id, product.metaData.keywords, errors);
        }

        productsImported++;
        console.log(`   ✅ Created product: ${product.name} (${createdProduct.id})`);

      } catch (error) {
        const errorMsg = `Failed to import product ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }

    return { productsImported, imagesImported };
  }

  /**
   * Import product images
   */
  private async importProductImages(
    tx: any,
    productId: string,
    images: ExtractedImage[],
    errors: string[]
  ): Promise<number> {
    let imported = 0;

    for (const image of images) {
      try {
        await tx.productImage.create({
          data: {
            productId,
            url: image.url,
            alt: image.alt,
            width: image.width || 800,
            height: image.height || 800,
            priority: image.priority
          }
        });
        imported++;
      } catch (error) {
        const errorMsg = `Failed to import image ${image.url}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.warn(`     ⚠️ ${errorMsg}`);
      }
    }

    return imported;
  }

  /**
   * Link product to categories
   */
  private async linkProductCategories(
    tx: any,
    productId: string,
    categories: string[],
    categoryMap: Record<string, string>,
    errors: string[]
  ): Promise<void> {
    for (const categoryName of categories) {
      const categoryId = categoryMap[categoryName];
      
      if (!categoryId) {
        // Create category on the fly if it doesn't exist
        try {
          const slug = this.generateSlug(categoryName);
          const created = await tx.productCategory.create({
            data: {
              name: categoryName,
              slug,
              level: 0,
              productCount: 1
            }
          });
          categoryMap[categoryName] = created.id;
          
          // Link the product
          await tx.product.update({
            where: { id: productId },
            data: {
              categories: {
                connect: { id: created.id }
              }
            }
          });
          
          console.log(`     📂 Created and linked category: ${categoryName}`);
        } catch (error) {
          const errorMsg = `Failed to create category ${categoryName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
        }
      } else {
        // Link to existing category
        try {
          await tx.product.update({
            where: { id: productId },
            data: {
              categories: {
                connect: { id: categoryId }
              }
            }
          });
          
          // Update category product count
          await tx.productCategory.update({
            where: { id: categoryId },
            data: {
              productCount: {
                increment: 1
              }
            }
          });
          
        } catch (error) {
          const errorMsg = `Failed to link product to category ${categoryName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
        }
      }
    }
  }

  /**
   * Create product tags
   */
  private async createProductTags(
    tx: any,
    productId: string,
    keywords: string[],
    errors: string[]
  ): Promise<void> {
    for (const keyword of keywords) {
      try {
        const slug = this.generateSlug(keyword);
        
        // Find or create tag
        let tag = await tx.productTag.findUnique({
          where: { slug }
        });

        if (!tag) {
          tag = await tx.productTag.create({
            data: {
              name: keyword,
              slug
            }
          });
        }

        // Link tag to product
        await tx.product.update({
          where: { id: productId },
          data: {
            tags: {
              connect: { id: tag.id }
            }
          }
        });

      } catch (error) {
        const errorMsg = `Failed to create tag ${keyword}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
      }
    }
  }

  /**
   * Sort categories by hierarchy (parents first)
   */
  private sortCategoriesByHierarchy(categories: ExtractedCategory[]): ExtractedCategory[] {
    const sorted: ExtractedCategory[] = [];
    const parentCategories = categories.filter(cat => !cat.parentCategory);
    const childCategories = categories.filter(cat => cat.parentCategory);

    // Add parent categories first
    sorted.push(...parentCategories);
    
    // Add child categories
    sorted.push(...childCategories);

    return sorted;
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Clean up existing data (use with caution!)
   */
  async clearDatabase(): Promise<void> {
    console.log('🧹 Clearing existing data...');
    
    await this.prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany();
      await tx.cartItem.deleteMany();
      await tx.orderItem.deleteMany();
      await tx.productReview.deleteMany();
      await tx.product.deleteMany();
      await tx.productCategory.deleteMany();
      await tx.productTag.deleteMany();
    });

    console.log('✅ Database cleared');
  }

  /**
   * Export data to JSON for backup
   */
  async exportData(filePath: string): Promise<void> {
    console.log('💾 Exporting data to JSON...');
    
    const data = {
      products: await this.prisma.product.findMany({
        include: {
          images: true,
          categories: true,
          tags: true
        }
      }),
      categories: await this.prisma.productCategory.findMany({
        include: {
          children: true,
          parent: true
        }
      }),
      exportedAt: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Data exported to ${filePath}`);
  }

  /**
   * Validate imported data integrity
   */
  async validateImport(): Promise<{
    isValid: boolean;
    issues: string[];
    stats: {
      totalProducts: number;
      totalCategories: number;
      totalImages: number;
      productsWithoutImages: number;
      productsWithoutCategories: number;
    };
  }> {
    console.log('🔍 Validating imported data...');
    
    const issues: string[] = [];
    
    const [
      totalProducts,
      totalCategories,
      totalImages,
      productsWithoutImages,
      productsWithoutCategories
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.productCategory.count(),
      this.prisma.productImage.count(),
      this.prisma.product.count({
        where: {
          images: {
            none: {}
          }
        }
      }),
      this.prisma.product.count({
        where: {
          categories: {
            none: {}
          }
        }
      })
    ]);

    // Check for issues
    if (productsWithoutImages > 0) {
      issues.push(`${productsWithoutImages} products have no images`);
    }
    
    if (productsWithoutCategories > 0) {
      issues.push(`${productsWithoutCategories} products have no categories`);
    }

    // Check for duplicate slugs
    const duplicateSlugs = await this.prisma.product.groupBy({
      by: ['slug'],
      having: {
        slug: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (duplicateSlugs.length > 0) {
      issues.push(`${duplicateSlugs.length} duplicate product slugs found`);
    }

    const stats = {
      totalProducts,
      totalCategories,
      totalImages,
      productsWithoutImages,
      productsWithoutCategories
    };

    console.log('📊 Validation Results:');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Categories: ${totalCategories}`);
    console.log(`   Images: ${totalImages}`);
    if (issues.length > 0) {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ No issues found');
    }

    return {
      isValid: issues.length === 0,
      issues,
      stats
    };
  }
}

// Export factory function
export function createDatabaseImporter(): DatabaseImporter {
  return new DatabaseImporter();
} 