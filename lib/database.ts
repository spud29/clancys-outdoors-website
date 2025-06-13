import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database utilities
export class DatabaseUtils {
  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }

  // Product utilities
  static async getProductWithDetails(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { priority: 'asc' }
        },
        categories: true,
        tags: true,
        reviews: {
          where: { approved: true },
          include: {
            customer: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  }

  static async getProductsByCategory(categorySlug: string, page = 1, limit = 24) {
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          inStock: true,
          categories: {
            some: { slug: categorySlug }
          }
        },
        include: {
          images: {
            orderBy: { priority: 'asc' },
            take: 1
          },
          categories: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({
        where: {
          status: 'ACTIVE',
          inStock: true,
          categories: {
            some: { slug: categorySlug }
          }
        }
      })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  // Cart utilities
  static async getOrCreateCart(customerId?: string, sessionId?: string) {
    // First try to find existing cart
    let cart = await prisma.cart.findFirst({
      where: customerId 
        ? { customerId }
        : { sessionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                regularPrice: true,
                salePrice: true,
                inStock: true,
                images: {
                  orderBy: { priority: 'asc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    });

    // Create new cart if none exists
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          customerId,
          sessionId,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  regularPrice: true,
                  salePrice: true,
                  inStock: true,
                  images: {
                    orderBy: { priority: 'asc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });
    }

    return cart;
  }

  static async addToCart(cartId: string, productId: string, quantity: number) {
    // Get current price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { regularPrice: true, salePrice: true, inStock: true }
    });

    if (!product || !product.inStock) {
      throw new Error('Product not available');
    }

    const unitPrice = product.salePrice || product.regularPrice;
    const totalPrice = unitPrice.mul(quantity);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId, productId }
      }
    });

    let cartItem;
    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = unitPrice.mul(newQuantity);
      
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice,
          totalPrice: newTotalPrice
        }
      });
    } else {
      // Create new item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          quantity,
          unitPrice,
          totalPrice
        }
      });
    }

    // Recalculate cart totals
    await this.updateCartTotals(cartId);
    
    return cartItem;
  }

  static async updateCartTotals(cartId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      select: { totalPrice: true }
    });

    const subtotal = cartItems.reduce((sum: Prisma.Decimal, item: any) => sum.add(item.totalPrice), new Prisma.Decimal(0));
    const tax = subtotal.mul(0.08); // 8% tax rate
    const shipping = subtotal.gte(50) ? new Prisma.Decimal(0) : new Prisma.Decimal(9.99);
    const total = subtotal.add(tax).add(shipping);

    return prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal,
        tax,
        shipping,
        total
      }
    });
  }

  // Customer utilities
  static async createCustomer(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    passwordHash: string;
  }) {
    return prisma.customer.create({
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        marketingOptIn: true,
        createdAt: true
      }
    });
  }

  static async findCustomerByEmail(email: string) {
    return prisma.customer.findUnique({
      where: { email },
      include: {
        addresses: true
      }
    });
  }

  // Order utilities
  static async createOrder(data: {
    customerId?: string;
    cartId: string;
    shippingAddressId: string;
    billingAddressId: string;
    paymentMethod: string;
    paymentIntentId?: string;
  }) {
    const cart = await prisma.cart.findUnique({
      where: { id: data.cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Generate order number
    const orderNumber = `CO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        shippingAddressId: data.shippingAddressId,
        billingAddressId: data.billingAddressId,
        paymentMethod: data.paymentMethod as any,
        paymentIntentId: data.paymentIntentId,
        items: {
          create: cart.items.map((item: any) => ({
            productId: item.productId,
            productName: item.product.name,
            productSku: item.product.sku,
            productImage: item.product.images[0]?.url,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }))
        }
      },
      include: {
        items: true,
        customer: true,
        shippingAddress: true,
        billingAddress: true
      }
    });

    // Clear the cart
    await prisma.cartItem.deleteMany({
      where: { cartId: data.cartId }
    });

    await prisma.cart.update({
      where: { id: data.cartId },
      data: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      }
    });

    return order;
  }

  // Search utilities
  static async searchProducts(query: string, filters?: {
    categorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }, page = 1, limit = 24) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (filters?.categorySlug) {
      whereClause.categories = {
        some: { slug: filters.categorySlug }
      };
    }

    if (filters?.minPrice || filters?.maxPrice) {
      whereClause.regularPrice = {};
      if (filters.minPrice) whereClause.regularPrice.gte = filters.minPrice;
      if (filters.maxPrice) whereClause.regularPrice.lte = filters.maxPrice;
    }

    if (filters?.inStock !== undefined) {
      whereClause.inStock = filters.inStock;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          images: {
            orderBy: { priority: 'asc' },
            take: 1
          },
          categories: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where: whereClause })
    ]);

    // Log search for analytics
    await prisma.searchLog.create({
      data: {
        query,
        results: total
      }
    });

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    };
  }

  // Additional cart utilities
  static async removeFromCart(cartId: string, productId: string) {
    // Remove the cart item
    await prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId, productId }
      }
    });

    // Recalculate cart totals
    await this.updateCartTotals(cartId);
  }

  static async updateCartItemQuantity(cartId: string, productId: string, quantity: number) {
    // Get current price for the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { regularPrice: true, salePrice: true, inStock: true }
    });

    if (!product || !product.inStock) {
      throw new Error('Product not available');
    }

    const unitPrice = product.salePrice || product.regularPrice;
    const totalPrice = unitPrice.mul(quantity);

    // Update the cart item
    await prisma.cartItem.update({
      where: {
        cartId_productId: { cartId, productId }
      },
      data: {
        quantity,
        unitPrice,
        totalPrice
      }
    });

    // Recalculate cart totals
    await this.updateCartTotals(cartId);
  }

  static async clearCart(cartId: string) {
    // Remove all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId }
    });

    // Reset cart totals
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      }
    });
  }

  // Category utilities
  static async getCategoryHierarchy() {
    return prisma.productCategory.findMany({
      where: { parentId: null }, // Root categories only
      include: {
        children: {
          include: {
            children: true // Support 3-level hierarchy
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  static async getFeaturedProducts(limit = 8) {
    return prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        inStock: true
      },
      include: {
        images: {
          orderBy: { priority: 'asc' },
          take: 1
        },
        categories: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }
} 