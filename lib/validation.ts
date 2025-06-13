import { z } from 'zod';

// Product Validation Schemas
export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  priority: z.number().int().min(0),
});

export const ProductCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  level: z.number().int().min(0),
  productCount: z.number().int().min(0),
  image: ProductImageSchema.optional(),
});

export const ProductSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  shortDescription: z.string().optional(),
  slug: z.string().min(1, 'Product slug is required'),
  status: z.enum(['active', 'inactive', 'draft']),
  
  price: z.object({
    regular: z.number().positive('Regular price must be positive'),
    sale: z.number().positive().optional(),
    currency: z.literal('USD'),
  }),
  
  inventory: z.object({
    tracked: z.boolean(),
    quantity: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    inStock: z.boolean(),
  }),
  
  images: z.array(ProductImageSchema),
  featuredImage: ProductImageSchema.optional(),
  
  categories: z.array(ProductCategorySchema),
  tags: z.array(z.string()),
  
  seo: z.object({
    metaTitle: z.string().max(60).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeyword: z.string().optional(),
  }),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Cart Validation Schemas
export const CartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
  addedAt: z.date(),
});

export const CartSchema = z.object({
  id: z.string(),
  items: z.array(CartItemSchema),
  totals: z.object({
    subtotal: z.number().min(0),
    tax: z.number().min(0),
    shipping: z.number().min(0),
    total: z.number().min(0),
  }),
  currency: z.literal('USD'),
  updatedAt: z.date(),
});

// Customer Validation Schemas
export const AddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Valid ZIP code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]{10,}$/, 'Valid phone number is required').optional(),
});

export const CustomerRegistrationSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]{10,}$/, 'Valid phone number is required').optional(),
  preferences: z.object({
    marketing: z.boolean().default(false),
  }).default({ marketing: false }),
});

export const CustomerLoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const CustomerProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]{10,}$/, 'Valid phone number is required').optional(),
  preferences: z.object({
    marketing: z.boolean(),
  }).optional(),
  defaultShippingAddress: AddressSchema.optional(),
  defaultBillingAddress: AddressSchema.optional(),
});

// Base customer schema used in tests and API routes
export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1), 
  phone: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
  addresses: z.array(AddressSchema).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Order Validation Schemas
export const PaymentMethodSchema = z.object({
  type: z.enum(['stripe_card', 'stripe_ach', 'apple_pay', 'google_pay']),
  last4: z.string().optional(),
  brand: z.string().optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(new Date().getFullYear()).optional(),
});

export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productImage: z.string().url().optional(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
});

export const OrderCreateSchema = z.object({
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  paymentMethod: PaymentMethodSchema,
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0),
  total: z.number().positive(),
});

// Search Validation Schemas
export const SearchFiltersSchema = z.object({
  category: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().positive(),
  }).optional(),
  inStock: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popularity']).optional(),
});

export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(24),
  filters: SearchFiltersSchema.optional(),
});

// API Validation Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }).optional(),
  meta: z.object({
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }).optional(),
});

// Form Validation Schemas for UI Components
export const NewsletterSignupSchema = z.object({
  email: z.string().email('Valid email is required'),
  preferences: z.object({
    marketing: z.boolean().default(true),
  }).default({ marketing: true }),
});

export const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]{10,}$/, 'Valid phone number is required').optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const ProductReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating is required').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(100, 'Title too long'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
});

// Utility Validation Functions
export function validateProductData(data: unknown) {
  return ProductSchema.safeParse(data);
}

export function validateCartData(data: unknown) {
  return CartSchema.safeParse(data);
}

export function validateCustomerRegistration(data: unknown) {
  return CustomerRegistrationSchema.safeParse(data);
}

export function validateCustomerLogin(data: unknown) {
  return CustomerLoginSchema.safeParse(data);
}

export function validateOrderCreate(data: unknown) {
  return OrderCreateSchema.safeParse(data);
}

export function validateSearchQuery(data: unknown) {
  return SearchQuerySchema.safeParse(data);
}

// Custom validation helpers
export const phoneRegex = /^\+?[\d\s\-\(\)\.]{10,}$/;
export const zipRegex = /^\d{5}(-\d{4})?$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

export function isValidPhone(phone: string): boolean {
  return phoneRegex.test(phone);
}

export function isValidZip(zip: string): boolean {
  return zipRegex.test(zip);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && passwordRegex.test(password);
}

// Validation error formatter
export function formatValidationErrors(errors: z.ZodError) {
  return errors.errors.reduce((acc, error) => {
    const path = error.path.join('.');
    acc[path] = error.message;
    return acc;
  }, {} as Record<string, string>);
}

// Type exports for use in components
export type ProductFormData = z.infer<typeof ProductSchema>;
export type CartFormData = z.infer<typeof CartSchema>;
export type CustomerRegistrationData = z.infer<typeof CustomerRegistrationSchema>;
export type CustomerLoginData = z.infer<typeof CustomerLoginSchema>;
export type OrderCreateData = z.infer<typeof OrderCreateSchema>;
export type SearchQueryData = z.infer<typeof SearchQuerySchema>;
export type AddressFormData = z.infer<typeof AddressSchema>;
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type NewsletterSignupData = z.infer<typeof NewsletterSignupSchema>; 