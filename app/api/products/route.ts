import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUtils } from '@/lib/database';
import { validateSearchQuery } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const queryData = {
      q: searchParams.get('q') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '24'),
      filters: {
        category: searchParams.get('category') || undefined,
        minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
        maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
        inStock: searchParams.get('inStock') ? searchParams.get('inStock') === 'true' : undefined,
        sortBy: searchParams.get('sortBy') as any || 'newest'
      }
    };

    // Validate query parameters
    const validation = validateSearchQuery(queryData);
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: validation.error.errors
        }
      }, { status: 400 });
    }

    // Search or get products
    let result;
    if (queryData.q.trim()) {
      // Search products
      result = await DatabaseUtils.searchProducts(
        queryData.q,
        queryData.filters,
        queryData.page,
        queryData.limit
      );
    } else if (queryData.filters.category) {
      // Get products by category
      result = await DatabaseUtils.getProductsByCategory(
        queryData.filters.category,
        queryData.page,
        queryData.limit
      );
    } else {
      // Get featured products by default
      const products = await DatabaseUtils.getFeaturedProducts(queryData.limit);
      result = {
        products,
        pagination: {
          page: 1,
          limit: queryData.limit,
          total: products.length,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: result.products,
      meta: result.pagination
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch products'
      }
    }, { status: 500 });
  }
} 