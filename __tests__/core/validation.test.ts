import { 
  ProductSchema, 
  CartItemSchema, 
  CustomerSchema,
  validateSearchQuery,
  validateCartData,
  validateProductData 
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('ProductSchema', () => {
    it('should validate a complete product', () => {
      const validProduct = {
        id: 'prod_123',
        sku: 'ICE-ROD-001',
        name: 'Premium Ice Fishing Rod',
        description: 'High-quality ice fishing rod for serious anglers',
        slug: 'premium-ice-fishing-rod',
        status: 'active',
        price: {
          regular: 129.99,
          sale: 99.99,
          currency: 'USD'
        },
        inventory: {
          tracked: true,
          quantity: 50,
          lowStockThreshold: 5,
          inStock: true
        },
        images: [],
        categories: [],
        tags: [],
        seo: {
          metaTitle: 'Premium Ice Fishing Rod - Best Quality',
          metaDescription: 'Shop the best ice fishing rod for your next adventure'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = ProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it('should reject product with invalid price', () => {
      const invalidProduct = {
        id: 'prod_123',
        sku: 'ICE-ROD-001',
        name: 'Premium Ice Fishing Rod',
        description: 'High-quality ice fishing rod',
        slug: 'premium-ice-fishing-rod',
        status: 'active',
        price: {
          regular: -10, // Invalid negative price
          currency: 'USD'
        },
        inventory: {
          tracked: true,
          inStock: true
        },
        images: [],
        categories: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = ProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['price', 'regular'],
            code: 'too_small'
          })
        );
      }
    });

    it('should reject product with missing required fields', () => {
      const incompleteProduct = {
        id: 'prod_123',
        // Missing required fields: sku, name, description
        slug: 'test-product',
        status: 'active'
      };

      const result = ProductSchema.safeParse(incompleteProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        const missingFields = result.error.issues.map(issue => issue.path[0]);
        expect(missingFields).toContain('sku');
        expect(missingFields).toContain('name');
        expect(missingFields).toContain('description');
      }
    });
  });

  describe('CartItemSchema', () => {
    it('should validate a valid cart item', () => {
      const validCartItem = {
        productId: 'prod_123',
        quantity: 2,
        addedAt: new Date()
      };

      const result = CartItemSchema.safeParse(validCartItem);
      expect(result.success).toBe(true);
    });

    it('should reject cart item with invalid quantity', () => {
      const invalidCartItem = {
        productId: 'prod_123',
        quantity: 0, // Invalid quantity
        addedAt: new Date()
      };

      const result = CartItemSchema.safeParse(invalidCartItem);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['quantity'],
            code: 'too_small'
          })
        );
      }
    });
  });

  describe('CustomerSchema', () => {
    it('should validate a complete customer', () => {
      const validCustomer = {
        id: 'cust_123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-123-4567',
        preferences: {
          marketing: false,
          currency: 'USD'
        },
        addresses: [],
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = CustomerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
    });

    it('should reject customer with invalid email', () => {
      const invalidCustomer = {
        id: 'cust_123',
        email: 'invalid-email', // Invalid email format
        firstName: 'John',
        lastName: 'Doe',
        preferences: {
          marketing: false,
          currency: 'USD'
        },
        addresses: [],
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = CustomerSchema.safeParse(invalidCustomer);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ['email'],
            code: 'invalid_string'
          })
        );
      }
    });
  });
});

describe('API Validation Functions', () => {
  describe('validateSearchQuery', () => {
    it('should validate valid search query', () => {
      const validQuery = {
        q: 'ice fishing rod',
        page: 1,
        limit: 24,
        filters: {
          category: 'fishing-rods',
          minPrice: 50,
          maxPrice: 200,
          inStock: true,
          sortBy: 'newest'
        }
      };

      const result = validateSearchQuery(validQuery);
      expect(result.success).toBe(true);
    });

    it('should reject invalid page number', () => {
      const invalidQuery = {
        q: 'ice fishing rod',
        page: 0, // Invalid page number
        limit: 24,
        filters: {}
      };

      const result = validateSearchQuery(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject excessive limit', () => {
      const invalidQuery = {
        q: 'ice fishing rod',
        page: 1,
        limit: 200, // Exceeds maximum limit
        filters: {}
      };

      const result = validateSearchQuery(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('validateCartData', () => {
    it('should validate valid cart action', () => {
      const validCartData = {
        action: 'add',
        productId: 'prod_123',
        quantity: 2
      };

      const result = validateCartData(validCartData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid action', () => {
      const invalidCartData = {
        action: 'invalid_action',
        productId: 'prod_123',
        quantity: 2
      };

      const result = validateCartData(invalidCartData);
      expect(result.success).toBe(false);
    });

    it('should reject missing productId', () => {
      const invalidCartData = {
        action: 'add',
        quantity: 2
        // Missing productId
      };

      const result = validateCartData(invalidCartData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateProductData', () => {
    it('should validate product creation data', () => {
      const validProductData = {
        sku: 'ICE-ROD-002',
        name: 'Professional Ice Rod',
        description: 'Professional grade ice fishing rod',
        slug: 'professional-ice-rod',
        regularPrice: 149.99,
        salePrice: 129.99,
        trackInventory: true,
        quantity: 25,
        categories: ['ice-fishing', 'rods'],
        tags: ['professional', 'ice', 'fishing']
      };

      const result = validateProductData(validProductData);
      expect(result.success).toBe(true);
    });

    it('should reject duplicate SKU format validation', () => {
      const invalidProductData = {
        sku: 'invalid sku with spaces', // Invalid SKU format
        name: 'Test Product',
        description: 'Test description',
        slug: 'test-product',
        regularPrice: 99.99
      };

      const result = validateProductData(invalidProductData);
      expect(result.success).toBe(false);
    });

    it('should reject price validation', () => {
      const invalidProductData = {
        sku: 'VALID-SKU-001',
        name: 'Test Product',
        description: 'Test description',
        slug: 'test-product',
        regularPrice: -50, // Invalid negative price
        salePrice: 60 // Sale price higher than regular price
      };

      const result = validateProductData(invalidProductData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Error Handling', () => {
  it('should provide meaningful error messages', () => {
    const invalidProduct = {
      sku: '', // Empty SKU
      name: 'A', // Too short name
      description: '', // Empty description
      regularPrice: -10 // Negative price
    };

    const result = ProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errorMessages = result.error.issues.map(issue => issue.message);
      expect(errorMessages).toContain('SKU is required');
      expect(errorMessages).toContain('Product name must be at least 3 characters');
      expect(errorMessages).toContain('Description is required');
      expect(errorMessages).toContain('Price must be positive');
    }
  });

  it('should handle nested validation errors', () => {
    const invalidCustomer = {
      id: 'cust_123',
      email: 'invalid-email',
      firstName: '',
      lastName: '',
      preferences: {
        currency: 'INVALID' // Invalid currency
      }
    };

    const result = CustomerSchema.safeParse(invalidCustomer);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const paths = result.error.issues.map(issue => issue.path.join('.'));
      expect(paths).toContain('email');
      expect(paths).toContain('firstName');
      expect(paths).toContain('lastName');
      expect(paths).toContain('preferences.currency');
    }
  });
});

describe('Schema Integration', () => {
  it('should work with real-world data structures', () => {
    // Simulate data that would come from the database
    const dbProduct = {
      id: 'clr123456789',
      sku: 'ICE-AUGER-ELECTRIC-001',
      name: 'StrikeMaster Lithium 40V Electric Ice Auger',
      description: 'Powerful electric ice auger with lithium battery technology. Cuts through ice quickly and quietly.',
      shortDescription: 'Electric ice auger with 40V lithium battery',
      slug: 'strikemaster-lithium-40v-electric-ice-auger',
      status: 'active',
      regularPrice: 399.99,
      salePrice: 349.99,
      currency: 'USD',
      trackInventory: true,
      quantity: 15,
      lowStockThreshold: 5,
      inStock: true,
      metaTitle: 'StrikeMaster Electric Ice Auger - 40V Lithium Battery',
      metaDescription: 'Shop the StrikeMaster 40V Lithium Electric Ice Auger. Powerful, quiet, and reliable for ice fishing.',
      focusKeyword: 'electric ice auger',
      images: [
        {
          id: 'img_001',
          url: 'https://example.com/images/auger-main.jpg',
          alt: 'StrikeMaster Electric Ice Auger',
          width: 800,
          height: 600,
          priority: 1
        }
      ],
      categories: [
        {
          id: 'cat_ice_augers',
          name: 'Ice Augers',
          slug: 'ice-augers',
          description: 'Electric and gas ice augers',
          parentId: 'cat_ice_fishing',
          level: 2,
          productCount: 12
        }
      ],
      tags: ['electric', 'lithium', 'ice-auger', 'strikemaster'],
      seo: {
        metaTitle: 'StrikeMaster Electric Ice Auger - 40V Lithium Battery',
        metaDescription: 'Shop the StrikeMaster 40V Lithium Electric Ice Auger. Powerful, quiet, and reliable for ice fishing.',
        focusKeyword: 'electric ice auger'
      },
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-20T14:15:00Z')
    };

    const result = ProductSchema.safeParse(dbProduct);
    expect(result.success).toBe(true);
    
    if (result.success) {
      expect(result.data.name).toBe('StrikeMaster Lithium 40V Electric Ice Auger');
      expect(result.data.price.regular).toBe(399.99);
      expect(result.data.price.sale).toBe(349.99);
      expect(result.data.inventory.inStock).toBe(true);
      expect(result.data.categories).toHaveLength(1);
      expect(result.data.images).toHaveLength(1);
    }
  });
}); 