import { renderHook, act } from '@testing-library/react';
import { useCartStore, useCustomerStore, useUIStore } from '@/lib/store';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.getState().clearCart();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.totals.total).toBe(0);
    expect(result.current.cart.currency).toBe('USD');
  });

  it('should add item to cart', async () => {
    const { result } = renderHook(() => useCartStore());

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await act(async () => {
      await result.current.addToCart('product-1', 2);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].productId).toBe('product-1');
    expect(result.current.cart.items[0].quantity).toBe(2);
  });

  it('should update existing item quantity', async () => {
    const { result } = renderHook(() => useCartStore());

    // Mock successful API responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Add item twice
    await act(async () => {
      await result.current.addToCart('product-1', 1);
      await result.current.addToCart('product-1', 2);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].quantity).toBe(3);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());

    // Manually add item to test removal
    act(() => {
      const newItems = [{
        productId: 'product-1',
        quantity: 1,
        addedAt: new Date(),
      }];
      
      result.current.cart.items = newItems;
      result.current.removeFromCart('product-1');
    });

    expect(result.current.cart.items).toHaveLength(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore());

    // Manually add item to test update
    act(() => {
      const newItems = [{
        productId: 'product-1',
        quantity: 1,
        addedAt: new Date(),
      }];
      
      result.current.cart.items = newItems;
      result.current.updateQuantity('product-1', 5);
    });

    expect(result.current.cart.items[0].quantity).toBe(5);
  });

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCartStore());

    // Manually add item
    act(() => {
      const newItems = [{
        productId: 'product-1',
        quantity: 2,
        addedAt: new Date(),
      }];
      
      result.current.cart.items = newItems;
      result.current.updateQuantity('product-1', 0);
    });

    expect(result.current.cart.items).toHaveLength(0);
  });

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCartStore());

    // Add items manually
    act(() => {
      const newItems = [
        { productId: 'product-1', quantity: 1, addedAt: new Date() },
        { productId: 'product-2', quantity: 3, addedAt: new Date() },
      ];
      
      result.current.cart.items = newItems;
      result.current.clearCart();
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.totals.total).toBe(0);
  });
});

describe('Customer Store', () => {
  beforeEach(() => {
    useCustomerStore.getState().logout();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should initialize with no customer', () => {
    const { result } = renderHook(() => useCustomerStore());
    
    expect(result.current.customer).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useCustomerStore());

    const mockCustomer = {
      id: 'customer-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCustomer,
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password');
    });

    expect(loginResult).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.customer?.email).toBe('test@example.com');
  });

  it('should fail login with invalid credentials', async () => {
    const { result } = renderHook(() => useCustomerStore());

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('invalid@example.com', 'wrongpassword');
    });

    expect(loginResult).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.customer).toBeNull();
  });

  it('should logout and clear cart', () => {
    const { result } = renderHook(() => useCustomerStore());

    // Mock logged in state
    act(() => {
      result.current.customer = {
        id: 'customer-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        preferences: { marketing: false, currency: 'USD' },
        addresses: [],
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      result.current.isAuthenticated = true;
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.customer).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.getState().clearErrors();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useUIStore());
    
    expect(Object.keys(result.current.loading)).toHaveLength(0);
    expect(Object.keys(result.current.errors)).toHaveLength(0);
    expect(Object.keys(result.current.modals)).toHaveLength(0);
  });

  it('should set and clear loading states', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setLoading('products', true);
    });

    expect(result.current.loading.products).toBe(true);

    act(() => {
      result.current.setLoading('products', false);
    });

    expect(result.current.loading.products).toBe(false);
  });

  it('should set and clear errors', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setError('login', 'Invalid credentials');
    });

    expect(result.current.errors.login).toBe('Invalid credentials');

    act(() => {
      result.current.setError('login', null);
    });

    expect(result.current.errors.login).toBeUndefined();
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setError('login', 'Error 1');
      result.current.setError('register', 'Error 2');
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);

    act(() => {
      result.current.clearErrors();
    });

    expect(Object.keys(result.current.errors)).toHaveLength(0);
  });

  it('should toggle modals', () => {
    const { result } = renderHook(() => useUIStore());

    act(() => {
      result.current.setModal('login', true);
    });

    expect(result.current.modals.login).toBe(true);

    act(() => {
      result.current.setModal('login', false);
    });

    expect(result.current.modals.login).toBe(false);
  });
});

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset all stores
    useCartStore.getState().clearCart();
    useCustomerStore.getState().logout();
    useUIStore.getState().clearErrors();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should load cart after customer login', async () => {
    const { result: customerResult } = renderHook(() => useCustomerStore());
    const { result: cartResult } = renderHook(() => useCartStore());

    const mockCustomer = {
      id: 'customer-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    // Mock login response
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      })
      // Mock cart load response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'cart-1',
          items: [{ productId: 'product-1', quantity: 2 }],
          totals: { subtotal: 100, tax: 8, shipping: 10, total: 118 }
        }),
      });

    await act(async () => {
      await customerResult.current.login('test@example.com', 'password');
    });

    expect(customerResult.current.isAuthenticated).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(2); // Login + load cart
  });

  it('should clear cart on logout', () => {
    const { result: customerResult } = renderHook(() => useCustomerStore());
    const { result: cartResult } = renderHook(() => useCartStore());

    // Mock authenticated state with cart items
    act(() => {
      customerResult.current.customer = {
        id: 'customer-1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      } as any;
      customerResult.current.isAuthenticated = true;
      
      cartResult.current.cart.items = [
        { productId: 'product-1', quantity: 2, addedAt: new Date() }
      ];
    });

    act(() => {
      customerResult.current.logout();
    });

    expect(customerResult.current.isAuthenticated).toBe(false);
    expect(cartResult.current.cart.items).toHaveLength(0);
  });
}); 