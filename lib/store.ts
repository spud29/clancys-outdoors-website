import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { StoreState, Cart, Customer, Product, ProductCategory } from '@/types/schema';

// Cart Store - Core E-commerce State
interface CartStore {
  cart: Cart;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        cart: {
          id: '',
          items: [],
          totals: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0,
          },
          currency: 'USD',
          updatedAt: new Date(),
        },

        addToCart: async (productId: string, quantity = 1) => {
          const { cart } = get();
          
          // Check if item already exists
          const existingItemIndex = cart.items.findIndex(
            item => item.productId === productId
          );

          let newItems;
          if (existingItemIndex >= 0) {
            // Update existing item
            newItems = cart.items.map((item, index) => 
              index === existingItemIndex 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            newItems = [...cart.items, {
              productId,
              quantity,
              addedAt: new Date(),
            }];
          }

          // Calculate totals (this would typically call an API)
          const subtotal = await calculateCartSubtotal(newItems);
          const tax = await calculateTax(subtotal);
          const shipping = await calculateShipping(newItems);
          const total = subtotal + tax + shipping;

          set({
            cart: {
              ...cart,
              items: newItems,
              totals: { subtotal, tax, shipping, total },
              updatedAt: new Date(),
            }
          });

          // Sync with server
          await get().syncCart();
        },

        removeFromCart: (productId: string) => {
          const { cart } = get();
          const newItems = cart.items.filter(item => item.productId !== productId);
          
          set({
            cart: {
              ...cart,
              items: newItems,
              updatedAt: new Date(),
            }
          });
        },

        updateQuantity: (productId: string, quantity: number) => {
          if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
          }

          const { cart } = get();
          const newItems = cart.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity }
              : item
          );

          set({
            cart: {
              ...cart,
              items: newItems,
              updatedAt: new Date(),
            }
          });
        },

        clearCart: () => {
          set({
            cart: {
              id: '',
              items: [],
              totals: {
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
              },
              currency: 'USD',
              updatedAt: new Date(),
            }
          });
        },

        loadCart: async () => {
          // Load cart from server if user is authenticated
          try {
            const response = await fetch('/api/cart');
            if (response.ok) {
              const serverCart = await response.json();
              set({ cart: serverCart });
            }
          } catch (error) {
            console.error('Failed to load cart:', error);
          }
        },

        syncCart: async () => {
          // Sync cart with server
          const { cart } = get();
          try {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cart),
            });
          } catch (error) {
            console.error('Failed to sync cart:', error);
          }
        },
      }),
      {
        name: 'cart-storage',
        partialize: (state) => ({
          cart: {
            ...state.cart,
            // Don't persist server-calculated totals
            totals: {
              subtotal: 0,
              tax: 0,
              shipping: 0,
              total: 0,
            }
          }
        }),
      }
    ),
    { name: 'cart-store' }
  )
);

// Customer Store
interface CustomerStore {
  customer: Customer | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Customer>) => Promise<void>;
  loadCustomer: () => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>()(
  devtools(
    persist(
      (set, get) => ({
        customer: null,
        isAuthenticated: false,

        login: async (email: string, password: string) => {
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
              const customer = await response.json();
              set({ customer, isAuthenticated: true });
              
              // Load user's cart after login
              await useCartStore.getState().loadCart();
              
              return true;
            }
            return false;
          } catch (error) {
            console.error('Login failed:', error);
            return false;
          }
        },

        logout: () => {
          set({ customer: null, isAuthenticated: false });
          useCartStore.getState().clearCart();
        },

        updateProfile: async (updates: Partial<Customer>) => {
          const { customer } = get();
          if (!customer) return;

          try {
            const response = await fetch('/api/customers/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });

            if (response.ok) {
              const updatedCustomer = await response.json();
              set({ customer: updatedCustomer });
            }
          } catch (error) {
            console.error('Profile update failed:', error);
          }
        },

        loadCustomer: async () => {
          try {
            const response = await fetch('/api/customers/me');
            if (response.ok) {
              const customer = await response.json();
              set({ customer, isAuthenticated: true });
            }
          } catch (error) {
            console.error('Failed to load customer:', error);
          }
        },
      }),
      {
        name: 'customer-storage',
        partialize: (state) => ({ 
          customer: state.customer,
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    { name: 'customer-store' }
  )
);

// UI Store - Loading states, errors, modals
interface UIStore {
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  modals: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  setModal: (key: string, open: boolean) => void;
  clearErrors: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      loading: {},
      errors: {},
      modals: {},

      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loading: { ...state.loading, [key]: loading }
        }));
      },

      setError: (key: string, error: string | null) => {
        set((state) => {
          const newErrors = { ...state.errors };
          if (error) {
            newErrors[key] = error;
          } else {
            delete newErrors[key];
          }
          return { errors: newErrors };
        });
      },

      setModal: (key: string, open: boolean) => {
        set((state) => ({
          modals: { ...state.modals, [key]: open }
        }));
      },

      clearErrors: () => {
        set({ errors: {} });
      },
    }),
    { name: 'ui-store' }
  )
);

// Products Store - Catalog data
interface ProductsStore {
  featured: Product[];
  categories: ProductCategory[];
  recent: Product[];
  loadFeatured: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadRecent: () => Promise<void>;
}

export const useProductsStore = create<ProductsStore>()(
  devtools(
    (set, get) => ({
      featured: [],
      categories: [],
      recent: [],

      loadFeatured: async () => {
        const setLoading = useUIStore.getState().setLoading;
        const setError = useUIStore.getState().setError;
        
        setLoading('featured-products', true);
        
        try {
          const response = await fetch('/api/products/featured');
          if (response.ok) {
            const featured = await response.json();
            set({ featured });
          } else {
            throw new Error('Failed to load featured products');
          }
        } catch (error) {
          setError('featured-products', error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading('featured-products', false);
        }
      },

      loadCategories: async () => {
        const setLoading = useUIStore.getState().setLoading;
        const setError = useUIStore.getState().setError;
        
        setLoading('categories', true);
        
        try {
          const response = await fetch('/api/categories');
          if (response.ok) {
            const categories = await response.json();
            set({ categories });
          } else {
            throw new Error('Failed to load categories');
          }
        } catch (error) {
          setError('categories', error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setLoading('categories', false);
        }
      },

      loadRecent: async () => {
        try {
          const response = await fetch('/api/products/recent');
          if (response.ok) {
            const recent = await response.json();
            set({ recent });
          }
        } catch (error) {
          console.error('Failed to load recent products:', error);
        }
      },
    }),
    { name: 'products-store' }
  )
);

// Helper functions for cart calculations
async function calculateCartSubtotal(items: any[]): Promise<number> {
  // This would typically call an API to get current product prices
  // For now, return a mock calculation
  return items.reduce((total, item) => total + (item.quantity * 50), 0);
}

async function calculateTax(subtotal: number): Promise<number> {
  // This would call a tax calculation service
  return subtotal * 0.08; // 8% tax rate
}

async function calculateShipping(items: any[]): Promise<number> {
  // This would call a shipping calculation service
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  return totalItems > 5 ? 0 : 9.99; // Free shipping over 5 items
}

// Store initialization hook
export function useStoreInitialization() {
  const loadCustomer = useCustomerStore(state => state.loadCustomer);
  const loadCart = useCartStore(state => state.loadCart);
  const loadCategories = useProductsStore(state => state.loadCategories);
  const loadFeatured = useProductsStore(state => state.loadFeatured);

  const initializeStores = async () => {
    try {
      // Load customer first (if authenticated)
      await loadCustomer();
      
      // Then load cart (which may sync with server if authenticated)
      await loadCart();
      
      // Load catalog data
      await Promise.all([
        loadCategories(),
        loadFeatured(),
      ]);
    } catch (error) {
      console.error('Store initialization failed:', error);
    }
  };

  return { initializeStores };
} 