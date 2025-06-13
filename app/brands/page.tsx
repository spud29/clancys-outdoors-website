import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowRight, Award, TrendingUp } from 'lucide-react';

const brands = [
  {
    name: 'Eskimo',
    category: 'Ice Shelters',
    description: 'Leading manufacturer of portable ice fishing shelters and accessories.',
    productCount: 47,
    rating: 4.8,
    founded: '1960',
    specialty: 'QuickFlip & FatFish shelters',
    popular: true,
    featured: true
  },
  {
    name: 'Striker Ice',
    category: 'Apparel',
    description: 'Premium ice fishing clothing designed for extreme cold weather conditions.',
    productCount: 32,
    rating: 4.7,
    founded: '2005',
    specialty: 'Predator & Hardwater gear',
    popular: true,
    featured: true
  },
  {
    name: 'St. Croix',
    category: 'Rods & Reels',
    description: 'Handcrafted fishing rods with superior sensitivity and performance.',
    productCount: 28,
    rating: 4.9,
    founded: '1948',
    specialty: 'Legend & Avid ice rods',
    popular: true,
    featured: true
  },
  {
    name: 'Humminbird',
    category: 'Electronics',
    description: 'Advanced fish finding technology and marine electronics.',
    productCount: 23,
    rating: 4.6,
    founded: '1971',
    specialty: 'Helix & PiranhaMAX series',
    popular: true,
    featured: false
  },
  {
    name: 'Vexilar',
    category: 'Electronics',
    description: 'Specialized sonar systems and flashers for ice fishing.',
    productCount: 19,
    rating: 4.8,
    founded: '1970',
    specialty: 'FL series flashers',
    popular: true,
    featured: false
  },
  {
    name: 'Clam',
    category: 'Ice Shelters',
    description: 'Innovative ice fishing shelters and thermal hub designs.',
    productCount: 35,
    rating: 4.5,
    founded: '1997',
    specialty: 'Thermal & Stealth shelters',
    popular: false,
    featured: false
  },
  {
    name: 'Frabill',
    category: 'Accessories',
    description: 'Complete line of ice fishing accessories and storage solutions.',
    productCount: 41,
    rating: 4.4,
    founded: '1948',
    specialty: 'Aqua-Life & Straight Line',
    popular: false,
    featured: false
  },
  {
    name: 'Celsius',
    category: 'Apparel',
    description: 'High-performance cold weather clothing and accessories.',
    productCount: 26,
    rating: 4.6,
    founded: '1999',
    specialty: 'Base layers & gloves',
    popular: false,
    featured: false
  },
  {
    name: 'Marcum',
    category: 'Electronics',
    description: 'Advanced underwater cameras and sonar technology.',
    productCount: 15,
    rating: 4.7,
    founded: '1999',
    specialty: 'VS series cameras',
    popular: false,
    featured: false
  },
  {
    name: 'HT Enterprises',
    category: 'Accessories',
    description: 'Wide range of ice fishing tools and accessories.',
    productCount: 38,
    rating: 4.3,
    founded: '1988',
    specialty: 'Ice augers & tackle',
    popular: false,
    featured: false
  },
  {
    name: 'Custom Jigs & Spins',
    category: 'Tackle',
    description: 'Hand-tied jigs and premium ice fishing lures.',
    productCount: 52,
    rating: 4.9,
    founded: '1973',
    specialty: 'Ratso & Purist jigs',
    popular: false,
    featured: false
  },
  {
    name: 'Rapala',
    category: 'Tackle',
    description: 'World-renowned fishing lures and ice fishing tackle.',
    productCount: 29,
    rating: 4.5,
    founded: '1936',
    specialty: 'Jigging Rap & Rippin Rap',
    popular: false,
    featured: false
  }
];

const categories = [
  { name: 'Ice Shelters', count: 3, icon: '🏠' },
  { name: 'Electronics', count: 3, icon: '📱' },
  { name: 'Apparel', count: 2, icon: '🧥' },
  { name: 'Rods & Reels', count: 1, icon: '🎣' },
  { name: 'Accessories', count: 2, icon: '🔧' },
  { name: 'Tackle', count: 2, icon: '🎯' }
];

function BrandCard({ brand }: { brand: typeof brands[0] }) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-bold text-gray-900">{brand.name}</CardTitle>
            {brand.featured && (
              <Badge className="bg-orange-600 text-white">Featured</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{brand.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{brand.category}</span>
          <span>Since {brand.founded}</span>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-600 mb-4 line-clamp-3">
          {brand.description}
        </CardDescription>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Products Available:</span>
            <span className="font-semibold text-gray-900">{brand.productCount}</span>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Specialty: </span>
            <span className="text-sm font-medium text-gray-900">{brand.specialty}</span>
          </div>
          
          {brand.popular && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">Popular Brand</span>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <Link href={`/brands/${brand.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <Button 
              variant="outline" 
              className="w-full group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-colors duration-300"
            >
              Shop {brand.name} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BrandsPage() {
  const featuredBrands = brands.filter(brand => brand.featured);
  const allBrands = brands.filter(brand => !brand.featured);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-blue-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Our Brands</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              We partner with the most trusted names in ice fishing to bring you the highest quality 
              equipment and gear. From industry pioneers to innovative newcomers, discover the brands 
              that serious ice anglers rely on.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>12 Premium Brands</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>4.6+ Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>480+ Products</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Categories Filter */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Card key={category.name} className="text-center p-4 border-0 shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-0">
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.count} brands</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Featured Brands */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Brands</h2>
              <Badge className="bg-orange-600 text-white px-3 py-1">Most Popular</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBrands.map((brand) => (
                <BrandCard key={brand.name} brand={brand} />
              ))}
            </div>
          </div>

          {/* All Brands */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">All Brands</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allBrands.map((brand) => (
                <BrandCard key={brand.name} brand={brand} />
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-white rounded-2xl p-8 md:p-12 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always adding new brands and products. Contact us if you have a specific 
              brand or product request.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                  Contact Us
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="px-8 py-3">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 