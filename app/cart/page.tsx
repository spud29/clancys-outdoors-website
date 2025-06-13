import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, X, ShoppingCart, Truck, Shield, CreditCard, ArrowLeft } from 'lucide-react';

// Sample cart items
const cartItems = [
  {
    id: 1,
    name: 'Eskimo QuickFlip 2 Ice Shelter',
    price: 299.99,
    originalPrice: 349.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    category: 'Ice Shelters',
    inStock: true,
    sku: 'ESK-QF2-BLU'
  },
  {
    id: 2,
    name: 'St. Croix Legend Ice Rod',
    price: 89.99,
    originalPrice: 109.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
    category: 'Rods & Reels',
    inStock: true,
    sku: 'STC-LGD-28'
  },
  {
    id: 3,
    name: 'Celsius Ice Fishing Gloves',
    price: 24.99,
    originalPrice: null,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    category: 'Accessories',
    inStock: true,
    sku: 'CEL-GLV-XL'
  }
];

function CartItem({ item }: { item: typeof cartItems[0] }) {
  const itemTotal = item.price * item.quantity;
  const savings = item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          width={120}
          height={120}
          className="rounded-lg object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
            <Badge variant="outline" className="mt-1">{item.category}</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <Button variant="ghost" size="sm" className="px-3 py-1">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-center min-w-[3rem]">{item.quantity}</span>
              <Button variant="ghost" size="sm" className="px-3 py-1">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              {item.inStock ? (
                <span className="text-green-600 font-medium">✓ In Stock</span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">${itemTotal.toFixed(2)}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${(item.originalPrice * item.quantity).toFixed(2)}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-sm text-green-600 font-medium">
                You save ${savings.toFixed(2)}
              </p>
            )}
            <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSavings = cartItems.reduce((sum, item) => {
    return sum + (item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0);
  }, 0);
  const shipping = subtotal >= 99 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">{cartItems.length} items in your cart</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
              
              {/* Recommended Products */}
              <Card className="mt-8 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>You might also like</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Humminbird Helix 5', price: 199.99, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=150&fit=crop' },
                      { name: 'Vexilar FL-20 Flasher', price: 329.99, image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=150&fit=crop' }
                    ].map((product, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-orange-600 font-bold">${product.price}</p>
                        </div>
                        <Button size="sm" variant="outline">Add</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Total Savings</span>
                        <span className="font-medium">-${totalSavings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `$${shipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {shipping > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <Truck className="inline h-4 w-4 mr-1" />
                        Add ${(99 - subtotal).toFixed(2)} more for FREE shipping!
                      </p>
                    </div>
                  )}
                  
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Checkout
                  </Button>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Free shipping on orders over $99</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Promo Code */}
              <Card className="mt-4 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter promo code"
                      className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button variant="outline">Apply</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 