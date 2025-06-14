import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, Thermometer, Zap, Fish, Shirt, Wrench } from 'lucide-react';
import { prisma } from '@/lib/database';

// Get all categories from database
async function getAllCategories() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: [
        { productCount: 'desc' },
        { name: 'asc' }
      ]
    });
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get total product count
async function getTotalProductCount() {
  try {
    const count = await prisma.product.count({
      where: {
        status: 'ACTIVE'
      }
    });
    return count;
  } catch (error) {
    console.error('Error fetching product count:', error);
    return 0;
  }
}

function CategoryCard({ category }: { category: any }) {
  // Map category names to appropriate icons
  const getIconForCategory = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('shelter') || lowerName.includes('hut')) return Thermometer;
    if (lowerName.includes('electronic') || lowerName.includes('finder') || lowerName.includes('sonar')) return Zap;
    if (lowerName.includes('rod') || lowerName.includes('reel') || lowerName.includes('fishing')) return Fish;
    if (lowerName.includes('apparel') || lowerName.includes('clothing') || lowerName.includes('jacket')) return Shirt;
    if (lowerName.includes('storage') || lowerName.includes('bag') || lowerName.includes('case')) return Package;
    return Wrench; // Default for accessories and other items
  };

  const Icon = getIconForCategory(category.name);
  const isPopular = category.productCount > 20; // Consider categories with 20+ products as popular
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={category.imageUrl || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-6 w-6" />
              {isPopular && (
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
          {category.description || `Discover our selection of ${category.name.toLowerCase()} for your ice fishing needs.`}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/categories/${category.slug}`} className="w-full">
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

export default async function CategoriesPage() {
  const [categories, totalProducts] = await Promise.all([
    getAllCategories(),
    getTotalProductCount()
  ]);

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
                  <span>{totalProducts} Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  <span>{categories.length} Categories</span>
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
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600">Check back later for new categories.</p>
            </div>
          )}
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