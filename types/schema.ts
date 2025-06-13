// Core Product Schema
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  slug: string;
  status: 'active' | 'inactive' | 'draft';
  
  // Pricing
  price: {
    regular: number;
    sale?: number;
    currency: 'USD';
  };
  
  // Inventory
  inventory: {
    tracked: boolean;
    quantity?: number;
    lowStockThreshold?: number;
    inStock: boolean;
  };
  
  // Media
  images: ProductImage[];
  featuredImage?: ProductImage;
  
  // Categorization
  categories: ProductCategory[];
  tags: string[];
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
  priority: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  productCount: number;
  image?: ProductImage;
}

// Shopping Cart Schema
export interface CartItem {
  productId: string;
  quantity: number;
  variant?: ProductVariant;
  addedAt: Date;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  currency: 'USD';
  updatedAt: Date;
}

// Order Schema
export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  status: OrderStatus;
  
  // Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: 'USD';
  
  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  
  // Fulfillment
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export type FulfillmentStatus = 
  | 'unfulfilled'
  | 'partial'
  | 'fulfilled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: ProductVariant;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  type: 'stripe_card' | 'stripe_ach' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// User Schema
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  
  // Preferences
  preferences: {
    marketing: boolean;
    currency: 'USD';
  };
  
  // Addresses
  defaultShippingAddress?: Address;
  defaultBillingAddress?: Address;
  addresses: Address[];
  
  // Order History
  orders: Order[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Search Schema
export interface SearchResults {
  products: Product[];
  categories: ProductCategory[];
  total: number;
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  tags?: string[];
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popularity';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Store State Types
export interface StoreState {
  cart: Cart;
  customer: Customer | null;
  ui: {
    loading: Record<string, boolean>;
    errors: Record<string, string>;
    modals: Record<string, boolean>;
  };
  products: {
    featured: Product[];
    recent: Product[];
    categories: ProductCategory[];
  };
}

// Component Props Types
export interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list' | 'featured';
  onAddToCart?: (productId: string) => void;
  showQuickView?: boolean;
}

export interface CategoryNavProps {
  categories: ProductCategory[];
  currentCategory?: string;
  onCategorySelect: (categorySlug: string) => void;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  filters?: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

// Product Variants (for future expansion)
export interface ProductVariant {
  id: string;
  name: string;
  options: VariantOption[];
  price?: number;
  sku?: string;
  inventory?: {
    quantity: number;
    inStock: boolean;
  };
}

export interface VariantOption {
  name: string; // e.g., "Size", "Color"
  value: string; // e.g., "Large", "Red"
} 