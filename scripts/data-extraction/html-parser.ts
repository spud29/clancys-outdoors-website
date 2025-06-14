import { JSDOM } from 'jsdom';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

// Type definitions for extracted data
export interface ExtractedProduct {
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
  shortDescription?: string;
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

export interface ExtractedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  priority: number;
}

export interface ExtractedCategory {
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

// Validation schemas
const PriceSchema = z.object({
  regular: z.number().positive(),
  sale: z.number().positive().optional(),
  currency: z.string().default('USD')
});

const ImageSchema = z.object({
  url: z.string().min(1), // Allow relative URLs, not just absolute URLs
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  priority: z.number().default(0)
});

const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().optional(),
  price: PriceSchema,
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  images: z.array(ImageSchema),
  categories: z.array(z.string()),
  inStock: z.boolean(),
  isOnSale: z.boolean(),
  metaData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  })
});

export class HTMLParser {
  private htmlDir: string;
  private imageBaseUrl: string;

  constructor(htmlDir: string = 'html', imageBaseUrl: string = '/images') {
    this.htmlDir = htmlDir;
    this.imageBaseUrl = imageBaseUrl;
  }

  /**
   * Parse all HTML files and extract product data
   */
  async parseAllFiles(): Promise<{
    products: ExtractedProduct[];
    categories: ExtractedCategory[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const products: ExtractedProduct[] = [];
    const categories: ExtractedCategory[] = [];

    try {
      const files = await fs.readdir(this.htmlDir);
      const htmlFiles = files.filter(file => file.endsWith('.html'));

      console.log(`Found ${htmlFiles.length} HTML files to process...`);

      for (const file of htmlFiles) {
        try {
          const filePath = path.join(this.htmlDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          
          const result = await this.parseFile(content, file);
          
          if (result.category) {
            categories.push(result.category);
          }
          
          if (result.products.length > 0) {
            products.push(...result.products);
          }

          console.log(`✅ Processed ${file}: ${result.products.length} products`);
        } catch (error) {
          const errorMsg = `Error processing ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      console.log(`\n📊 Extraction Summary:`);
      console.log(`Products: ${products.length}`);
      console.log(`Categories: ${categories.length}`);
      console.log(`Errors: ${errors.length}`);

      return { products, categories, errors };
    } catch (error) {
      throw new Error(`Failed to read HTML directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse individual HTML file
   */
  private async parseFile(content: string, filename: string): Promise<{
    products: ExtractedProduct[];
    category?: ExtractedCategory;
  }> {
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Extract category information
    const category = this.extractCategoryInfo(document, filename);
    
    // Extract products from the page
    const products = this.extractProducts(document, filename);

    return { products, category };
  }

  /**
   * Extract category information from the page
   */
  private extractCategoryInfo(document: Document, filename: string): ExtractedCategory | undefined {
    // Extract from page title
    const titleElement = document.querySelector('title');
    const title = titleElement?.textContent || '';
    
    // Extract from meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract from breadcrumbs or schema.org data
    const schemaScript = document.querySelector('script[type="application/ld+json"]');
    let categoryName = '';
    let productCount = 0;

    if (schemaScript) {
      try {
        const schemaData = JSON.parse(schemaScript.textContent || '');
        if (schemaData['@graph']) {
          const collectionPage = schemaData['@graph'].find((item: any) => item['@type'] === 'CollectionPage');
          if (collectionPage) {
            categoryName = collectionPage.name?.replace(' Archives - Clancy Outdoors', '') || '';
          }
        }
      } catch (error) {
        console.warn(`Failed to parse schema data in ${filename}`);
      }
    }

    // Extract from page heading
    if (!categoryName) {
      const h1 = document.querySelector('h1');
      categoryName = h1?.textContent?.replace(' Archives - Clancy Outdoors', '') || '';
    }

    // Extract product count from the page
    const productElements = document.querySelectorAll('.product, .product-item, li.product');
    productCount = productElements.length;

    if (!categoryName) {
      // Generate from filename
      categoryName = filename
        .replace('.html', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    if (categoryName) {
      return {
        name: categoryName,
        slug: this.generateSlug(categoryName),
        description: metaDesc,
        productCount,
        metaData: {
          title: title,
          description: metaDesc
        }
      };
    }

    return undefined;
  }

  /**
   * Extract products from WooCommerce product listing
   */
  private extractProducts(document: Document, filename: string): ExtractedProduct[] {
    const products: ExtractedProduct[] = [];
    
    // Find product elements - multiple possible selectors
    const productSelectors = [
      'li.product',
      '.product-item',
      '.woocommerce-LoopProduct-link',
      '.product'
    ];

    let productElements: NodeListOf<Element> | null = null;
    
    for (const selector of productSelectors) {
      productElements = document.querySelectorAll(selector);
      if (productElements.length > 0) {
        console.log(`Found ${productElements.length} products using selector: ${selector}`);
        break;
      }
    }

    if (!productElements || productElements.length === 0) {
      console.warn(`No products found in ${filename}`);
      return products;
    }

    productElements.forEach((element, index) => {
      try {
        const product = this.extractSingleProduct(element, index, filename);
        if (product) {
          // Validate the extracted product
          const validated = ProductSchema.safeParse(product);
          if (validated.success) {
            products.push(validated.data);
          } else {
            console.warn(`Validation failed for product in ${filename}:`, validated.error.errors);
          }
        }
      } catch (error) {
        console.error(`Error extracting product ${index} from ${filename}:`, error);
      }
    });

    return products;
  }

  /**
   * Extract single product data from DOM element
   */
  private extractSingleProduct(element: Element, index: number, filename: string): ExtractedProduct | null {
    // Extract product name
    const nameSelectors = [
      '.product-title a',
      '.product-title',
      'h3 a',
      'h2 a',
      '.product-name',
      '.woocommerce-loop-product__title'
    ];
    
    let nameElement: Element | null = null;
    let name = '';
    
    for (const selector of nameSelectors) {
      nameElement = element.querySelector(selector);
      if (nameElement) {
        name = nameElement.textContent?.trim() || '';
        if (name) break;
      }
    }

    if (!name) {
      console.warn(`No product name found for product ${index} in ${filename}`);
      return null;
    }

    // Extract product link/slug
    const linkElement = element.querySelector('a[href]') as HTMLAnchorElement;
    const href = linkElement?.href || '';
    let slug = this.generateSlug(name);
    
    if (href) {
      const urlParts = href.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      if (lastPart && lastPart !== '' && lastPart !== '/') {
        slug = lastPart.replace('.html', '');
      }
    }

    // Extract pricing
    const priceData = this.extractPricing(element);
    if (!priceData) {
      console.warn(`No valid pricing found for ${name} in ${filename}`);
      return null;
    }

    // Extract images
    const images = this.extractImages(element);

    // Extract product ID from data attributes
    const productId = element.getAttribute('data-product_id') || 
                     element.querySelector('[data-product_id]')?.getAttribute('data-product_id') ||
                     `${filename.replace('.html', '')}-${index}`;

    // Extract categories from CSS classes
    const categories = this.extractCategories(element, filename);

    // Check if product is on sale
    const isOnSale = element.querySelector('.onsale, .sale-badge') !== null;

    // Check stock status
    const inStock = !element.classList.contains('outofstock') && 
                   !element.querySelector('.out-of-stock');

    // Extract SKU if available
    const sku = element.getAttribute('data-product_sku') || 
               element.querySelector('[data-product_sku]')?.getAttribute('data-product_sku');

    return {
      id: productId,
      name,
      slug,
      sku: sku || undefined,
      price: priceData,
      description: name, // For now, use name as description
      shortDescription: undefined,
      images,
      categories,
      inStock: Boolean(inStock),
      isOnSale,
      metaData: {
        title: name,
        description: name
      }
    };
  }

  /**
   * Extract pricing information
   */
  private extractPricing(element: Element): { regular: number; sale?: number; currency: string } | null {
    const priceContainer = element.querySelector('.price, .fusion-price-rating, .woocommerce-Price-amount');
    
    if (!priceContainer) return null;

    const priceTexts = Array.from(priceContainer.querySelectorAll('.woocommerce-Price-amount, .amount'))
      .map(el => el.textContent?.trim() || '');

    if (priceTexts.length === 0) {
      // Try to get price from container text directly
      const priceText = priceContainer.textContent?.trim() || '';
      const priceMatch = priceText.match(/\$(\d+(?:\.\d{2})?)/);
      if (priceMatch) {
        return {
          regular: parseFloat(priceMatch[1]),
          currency: 'USD'
        };
      }
      return null;
    }

    // Handle single price
    if (priceTexts.length === 1) {
      const priceMatch = priceTexts[0].match(/\$(\d+(?:\.\d{2})?)/);
      if (priceMatch) {
        return {
          regular: parseFloat(priceMatch[1]),
          currency: 'USD'
        };
      }
    }

    // Handle price range (regular - sale)
    if (priceTexts.length >= 2) {
      const prices = priceTexts
        .map(text => text.match(/\$(\d+(?:\.\d{2})?)/))
        .filter(match => match !== null)
        .map(match => parseFloat(match![1]));

      if (prices.length >= 2) {
        // First price is usually sale price, second is regular price
        return {
          regular: Math.max(...prices),
          sale: Math.min(...prices),
          currency: 'USD'
        };
      } else if (prices.length === 1) {
        return {
          regular: prices[0],
          currency: 'USD'
        };
      }
    }

    return null;
  }

  /**
   * Extract product images
   */
  private extractImages(element: Element): ExtractedImage[] {
    const images: ExtractedImage[] = [];
    
    // Find all images in the product
    const imgElements = element.querySelectorAll('img');
    
    imgElements.forEach((img, index) => {
      const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
      if (!src || src.includes('loading') || src.includes('spinner')) return;

      let url = src;
      
      // Convert relative URLs to absolute
      if (src.startsWith('../images/')) {
        url = src.replace('../images/', '/images/');
      } else if (src.startsWith('http')) {
        // External image - we'll need to download these later
        url = src;
      }

      const alt = img.getAttribute('alt') || '';
      const width = img.getAttribute('width') ? parseInt(img.getAttribute('width')!) : undefined;
      const height = img.getAttribute('height') ? parseInt(img.getAttribute('height')!) : undefined;

      images.push({
        url,
        alt,
        width,
        height,
        priority: index === 0 ? 1 : index + 1
      });
    });

    return images;
  }

  /**
   * Extract categories from CSS classes and filename
   */
  private extractCategories(element: Element, filename: string): string[] {
    const categories: string[] = [];
    
    // Extract from CSS classes
    const classList = Array.from(element.classList);
    const categoryClasses = classList.filter(cls => 
      cls.startsWith('product_cat-') || 
      cls.startsWith('category-')
    );

    categoryClasses.forEach(cls => {
      const category = cls
        .replace('product_cat-', '')
        .replace('category-', '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      if (category && !categories.includes(category)) {
        categories.push(category);
      }
    });

    // Add category from filename
    const fileCategory = filename
      .replace('.html', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    if (!categories.includes(fileCategory)) {
      categories.push(fileCategory);
    }

    return categories;
  }

  /**
   * Generate URL-friendly slug from text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

// Export factory function
export function createHTMLParser(htmlDir?: string, imageBaseUrl?: string): HTMLParser {
  return new HTMLParser(htmlDir, imageBaseUrl);
} 