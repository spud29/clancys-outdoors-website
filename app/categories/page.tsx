import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, Thermometer, Zap, Fish, Shirt, Wrench } from 'lucide-react';

const categories = [
  {
    id: 'ice-shelters',
    name: 'Ice Shelters',
    description: 'Stay warm and comfortable on the ice with our premium selection of ice shelters and huts.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    productCount: 127,
    icon: Thermometer,
    features: ['Portable & Flip-Up', 'Hub Style', 'Premium Materials', 'Wind Resistant'],
    popular: true
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Advanced fish finders, sonar technology, and underwater cameras for successful ice fishing.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop',
    productCount: 89,
    icon: Zap,
    features: ['Fish Finders', 'Underwater Cameras', 'GPS Units', 'Flashers'],
    popular: false
  },
  {
    id: 'rods-reels',
    name: 'Rods & Reels',
    description: 'Premium ice fishing rods and reels designed for sensitivity and durability in cold conditions.',
    image: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop',
    productCount: 156,
    icon: Fish,
    features: ['Ultra-Light Rods', 'Inline Reels', 'Spinning Reels', 'Combo Sets'],
    popular: true
  },
  {
    id: 'accessories',
    name: 'Accessories',
    description: 'Essential ice fishing accessories including augers, bait, tackle, and safety equipment.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    productCount: 203,
    icon: Wrench,
    features: ['Ice Augers', 'Tackle Boxes', 'Jigs & Lures', 'Safety Gear'],
    popular: false
  },
  {
    id: 'apparel',
    name: 'Ice Fishing Apparel',
    description: 'Stay warm and dry with our collection of ice fishing jackets, pants, gloves, and boots.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    productCount: 94,
    icon: Shirt,
    features: ['Insulated Jackets', 'Ice Boots', 'Gloves & Mitts', 'Base Layers'],
    popular: false
  },
  {
    id: 'storage',
    name: 'Storage & Transport',
    description: 'Organize and transport your gear with sleds, bags, and storage solutions.',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
    productCount: 67,
    icon: Package,
    features: ['Ice Sleds', 'Tackle Bags', 'Rod Cases', 'Seat Boxes'],
    popular: false
  }
];

function CategoryCard({ category }: { category: typeof categories[0] }) {
  const Icon = category.icon;
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-6 w-6" />
              {category.popular && (
                <Badge className="bg-orange-600 text-white">Popular</Badge>
              )}
            </div>
            <p className="text-lg font-semibold">{category.productCount} Products</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1">
        <CardTitle className="text-xl font-bold text-gray-900 mb-3">
          {category.name}
        </CardTitle>
        <CardDescription className="text-gray-600 mb-4 line-clamp-3">
          {category.description}
        </CardDescription>
        
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Featured Items:</h4>
          <div className="flex flex-wrap gap-1">
            {category.features.map((feature, index) => (
              <span
                key={index}
                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/categories/${category.id}`} className="w-full">
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors duration-300"
          >
            Browse {category.name} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h1>
              <p className="text-xl text-gray-600 mb-8">
                Browse our complete selection of ice fishing equipment organized by category. 
                From shelters to electronics, we have everything you need for a successful day on the ice.
              </p>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>480+ Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <span>6 Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Fish className="h-4 w-4" />
                  <span>Top Brands</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* Featured Brands Section */}
        <div className="bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Brands</h2>
              <p className="text-gray-600">We carry the most trusted names in ice fishing</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {[
                'Eskimo', 'Striker Ice', 'St. Croix', 'Humminbird', 
                'Vexilar', 'Celsius', 'Clam', 'Frabill',
                'Marcum', 'HT Enterprises', 'Custom Jigs', 'Rapala'
              ].map((brand) => (
                <div key={brand} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="h-12 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <span className="text-gray-500 font-semibold text-sm">{brand}</span>
                  </div>
                  <p className="text-sm text-gray-600">{brand}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link href="/brands">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  View All Brands <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 