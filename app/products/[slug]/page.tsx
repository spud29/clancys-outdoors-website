import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Package, Truck, Shield } from 'lucide-react';
import { prisma } from '@/lib/database';

// Get product by slug
async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { priority: 'asc' }
        },
        categories: true
      }
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Get related products
async function getRelatedProducts(productId: string, categoryIds: string[]) {
  try {
    if (categoryIds.length === 0) return [];
    
    const products = await prisma.product.findMany({
      where: {
        id: { not: productId },
        status: 'ACTIVE',
        inStock: true,
        categories: {
          some: {
            id: { in: categoryIds }
          }
        }
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
      take: 4,
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

function ProductImageGallery({ images }: { images: any[] }) {
  const mainImage = images[0];
  
  if (!mainImage) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <Package className="h-16 w-16 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={mainImage.url}
          alt={mainImage.alt}
          width={600}
          height={600}
          className="h-full w-full object-cover object-center"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.slice(1, 5).map((image, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={image.url}
                alt={image.alt}
                width={150}
                height={150}
                className="h-full w-full object-cover object-center cursor-pointer hover:opacity-75"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RelatedProducts({ products }: { products: any[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const primaryImage = product.images?.[0];
            const primaryCategory = product.categories?.[0];
            const isOnSale = product.salePrice && product.salePrice.lt(product.regularPrice);
            const displayPrice = product.salePrice || product.regularPrice;
            
            return (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
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
                      <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                        Sale
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="mb-1">
                    <span className="text-sm text-gray-500">{primaryCategory?.name}</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {isOnSale && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.regularPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 pt-0">
                  <Link href={`/products/${product.slug}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);
  
  if (!product) {
    notFound();
  }

  const categoryIds = product.categories.map(cat => cat.id);
  const relatedProducts = await getRelatedProducts(product.id, categoryIds);
  
  const isOnSale = product.salePrice && product.salePrice.lt(product.regularPrice);
  const displayPrice = product.salePrice || product.regularPrice;
  const savings = isOnSale ? product.regularPrice.sub(product.salePrice!) : null;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              <span className="text-gray-400">/</span>
              <Link href="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
              <span className="text-gray-400">/</span>
              {product.categories[0] && (
                <>
                  <Link href={`/categories/${product.categories[0].slug}`} className="text-gray-500 hover:text-gray-700">
                    {product.categories[0].name}
                  </Link>
                  <span className="text-gray-400">/</span>
                </>
              )}
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <ProductImageGallery images={product.images} />
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.categories.map((category) => (
                    <Badge key={category.id} variant="outline" className="text-blue-600 border-blue-600">
                      {category.name}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {isOnSale && (
                      <>
                        <span className="text-xl text-gray-500 line-through">
                          ${product.regularPrice.toFixed(2)}
                        </span>
                        <Badge className="bg-red-600 text-white">
                          Save ${savings?.toFixed(2)}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`font-medium ${product.inStock ? 'text-green-700' : 'text-red-700'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  {product.quantity && product.quantity <= 5 && product.inStock && (
                    <span className="text-orange-600 font-medium">
                      Only {product.quantity} left!
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="prose prose-sm text-gray-600">
                  <p>{product.description}</p>
                  {product.shortDescription && (
                    <p className="mt-2 font-medium">{product.shortDescription}</p>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className={`flex-1 ${
                      product.inStock 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                  <div className="text-center">
                    <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders $99+</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                    <p className="text-xs text-gray-500">SSL Protected</p>
                  </div>
                  <div className="text-center">
                    <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">30-day policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <Suspense fallback={
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading related products...</p>
          </div>
        }>
          <RelatedProducts products={relatedProducts} />
        </Suspense>
      </main>
    </>
  );
} 