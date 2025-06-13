import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Star, ShoppingCart } from 'lucide-react';

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: 'Eskimo QuickFlip 2 Ice Shelter',
    price: 299.99,
    originalPrice: 349.99,
    rating: 4.8,
    reviews: 127,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    category: 'Ice Shelters',
    badge: 'Best Seller',
    inStock: true
  },
  {
    id: 2,
    name: 'Humminbird Helix 5 Fish Finder',
    price: 199.99,
    originalPrice: null,
    rating: 4.6,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    category: 'Electronics',
    badge: 'New',
    inStock: true
  },
  {
    id: 3,
    name: 'St. Croix Legend Ice Rod',
    price: 89.99,
    originalPrice: 109.99,
    rating: 4.9,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
    category: 'Rods & Reels',
    badge: 'Sale',
    inStock: true
  },
  {
    id: 4,
    name: 'Celsius Ice Fishing Gloves',
    price: 24.99,
    originalPrice: null,
    rating: 4.4,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    category: 'Accessories',
    badge: null,
    inStock: true
  },
  {
    id: 5,
    name: 'Striker Ice Predator Jacket',
    price: 179.99,
    originalPrice: 219.99,
    rating: 4.7,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    category: 'Apparel',
    badge: 'Sale',
    inStock: false
  },
  {
    id: 6,
    name: 'Vexilar FL-20 Flasher',
    price: 329.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    category: 'Electronics',
    badge: 'Professional',
    inStock: true
  }
];

function ProductCard({ product }: { product: typeof sampleProducts[0] }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {product.badge && (
            <Badge className="absolute top-4 left-4 bg-orange-600 text-white">
              {product.badge}
            </Badge>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-2">
          <span className="text-sm text-gray-500">{product.category}</span>
        </div>
        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </CardTitle>
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">${product.price}</span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">${product.originalPrice}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          className={`w-full ${
            product.inStock 
              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function ProductsFilter() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Categories</option>
            <option value="ice-shelters">Ice Shelters</option>
            <option value="electronics">Electronics</option>
            <option value="rods-reels">Rods & Reels</option>
            <option value="accessories">Accessories</option>
            <option value="apparel">Apparel</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Any Price</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-500">$200 - $500</option>
            <option value="500+">$500+</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Brands</option>
            <option value="eskimo">Eskimo</option>
            <option value="humminbird">Humminbird</option>
            <option value="st-croix">St. Croix</option>
            <option value="striker">Striker Ice</option>
            <option value="vexilar">Vexilar</option>
          </select>
        </div>
        
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
                <p className="text-gray-600">Discover our complete collection of ice fishing gear</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                <select className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ProductsFilter />
            </div>
            
            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">Showing {sampleProducts.length} of 480+ products</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <Button variant="outline" size="sm" className="bg-blue-600 text-white border-blue-600">Grid</Button>
                  <Button variant="outline" size="sm">List</Button>
                </div>
              </div>
              
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
                  ))}
                </div>
              }>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sampleProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </Suspense>
              
              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex items-center gap-2">
                  <Button variant="outline" disabled>Previous</Button>
                  <Button className="bg-blue-600 text-white">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <span className="px-3 py-2 text-gray-500">...</span>
                  <Button variant="outline">12</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 