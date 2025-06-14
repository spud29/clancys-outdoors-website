import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, Shield, Award, ArrowRight, Snowflake, ShoppingCart } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { prisma } from '@/lib/database';

// Hero Section Component
function HeroSection() {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-slate-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 text-6xl">
          <Snowflake className="animate-pulse" />
        </div>
        <div className="absolute top-40 right-20 text-4xl">
          <Snowflake className="animate-pulse animation-delay-1000" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-5xl">
          <Snowflake className="animate-pulse animation-delay-2000" />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-sm font-semibold">
            🏆 Trusted Since 2008 - 15+ Years of Excellence
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              Clancy's Outdoors
            </span>
            <br />
            <span className="text-2xl md:text-4xl font-semibold text-blue-200">
              Your Ice Fishing Headquarters
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            From premium ice shelters to the latest sonar technology, we've got everything you need to make your ice fishing adventure unforgettable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Shop All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/categories">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                Browse Categories
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-400" />
              <span>Free Shipping on Orders $99+</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Get featured categories from database
async function getFeaturedCategories() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: {
        productCount: {
          gt: 0
        }
      },
      orderBy: {
        productCount: 'desc'
      },
      take: 4
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get featured products from database
async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        inStock: true
      },
      include: {
        images: {
          orderBy: { priority: 'asc' },
          take: 1
        },
        categories: {
          take: 1
        }
      },
      orderBy: [
        { salePrice: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' }
      ],
      take: 8
    });
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Featured Categories Component
async function FeaturedCategories() {
  const categories = await getFeaturedCategories();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find exactly what you need with our carefully curated selection of ice fishing equipment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category: any) => (
            <Card key={category.name} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="p-0">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={category.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <Badge className="absolute top-4 left-4 bg-orange-600 text-white">
                    {category.productCount} Products
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {category.description || 'Discover our selection of quality products'}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Link href={`/categories/${category.slug}`}>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors duration-300"
                  >
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Featured Products Component
async function FeaturedProducts() {
  const products = await getFeaturedProducts();
  
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Check out our most popular ice fishing gear, handpicked for quality and performance
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => {
            const primaryImage = product.images?.[0];
            const primaryCategory = product.categories?.[0];
            const isOnSale = product.salePrice && product.salePrice.lt(product.regularPrice);
            const displayPrice = product.salePrice || product.regularPrice;
            
            return (
              <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={primaryImage?.url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {isOnSale && (
                      <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                        Sale
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">{primaryCategory?.name || 'Product'}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {isOnSale && (
                      <span className="text-lg text-gray-500 line-through">
                        ${product.regularPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <div className="flex gap-2 w-full">
                    <Link href={`/products/${product.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button 
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/products">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
            >
              View All Products <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Trust Section Component
function TrustSection() {
  const stats = [
    { number: '15+', label: 'Years in Business', icon: Award },
    { number: '741', label: 'Products Available', icon: Star },
    { number: '108', label: 'Categories', icon: Shield },
    { number: '274', label: 'Products on Sale', icon: Truck },
  ];

  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose Clancy's Outdoors?
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            We're not just another outdoor retailer. We're passionate ice fishing enthusiasts who understand what you need to succeed on the ice.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="mb-4 flex justify-center">
                  <Icon className="h-12 w-12 text-orange-400" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-200 font-medium">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-blue-800 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Upgrade Your Ice Fishing Game?
          </h3>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Clancy's Outdoors for their ice fishing needs.
          </p>
          <Link href="/products">
            <Button 
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold"
            >
              Start Shopping Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Main Homepage Component
export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        <HeroSection />
        
        <Suspense fallback={
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        }>
          <FeaturedCategories />
        </Suspense>
        
        <Suspense fallback={
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured products...</p>
          </div>
        }>
          <FeaturedProducts />
        </Suspense>
        
        <TrustSection />
      </main>
    </>
  );
} 