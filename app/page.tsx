import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, Shield, Award, ArrowRight, Snowflake } from 'lucide-react';
import Navigation from '@/components/Navigation';

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

// Featured Categories Component
function FeaturedCategories() {
  const categories = [
    {
      name: 'Ice Shelters',
      description: 'Stay warm and comfortable',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      href: '/categories/ice-shelters',
      badge: 'Popular'
    },
    {
      name: 'Electronics',
      description: 'Fish finders & sonar technology',
      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
      href: '/categories/electronics',
      badge: 'New Arrivals'
    },
    {
      name: 'Rods & Reels',
      description: 'Premium ice fishing gear',
      image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop',
      href: '/categories/rods-reels',
      badge: 'Best Sellers'
    },
    {
      name: 'Accessories',
      description: 'Complete your setup',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      href: '/categories/accessories',
      badge: 'Essential'
    },
  ];

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
          {categories.map((category) => (
            <Card key={category.name} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="p-0">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <Badge className="absolute top-4 left-4 bg-orange-600 text-white">
                    {category.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {category.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Link href={category.href}>
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

// Trust Section Component
function TrustSection() {
  const stats = [
    { number: '15+', label: 'Years in Business', icon: Award },
    { number: '480+', label: 'Products Available', icon: Star },
    { number: '1000+', label: 'Happy Customers', icon: Shield },
    { number: '99%', label: 'Customer Satisfaction', icon: Truck },
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
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        }>
          <FeaturedCategories />
        </Suspense>
        
        <TrustSection />
      </main>
    </>
  );
} 