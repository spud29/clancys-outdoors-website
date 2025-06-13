import { NextRequest, NextResponse } from 'next/server';
import { DatabaseUtils } from '@/lib/database';
import { validateCartData } from '@/lib/validation';
import { cookies } from 'next/headers';

// GET /api/cart - Get current cart
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('session-id')?.value;
    const customerId = cookieStore.get('customer-id')?.value;

    if (!sessionId && !customerId) {
      return NextResponse.json({
        success: true,
        data: {
          id: '',
          items: [],
          totals: {
            subtotal: 0,
            tax: 0,
            shipping: 0,
            total: 0
          },
          currency: 'USD',
          updatedAt: new Date()
        }
      });
    }

    const cart = await DatabaseUtils.getOrCreateCart(customerId, sessionId);

    return NextResponse.json({
      success: true,
      data: cart
    });

  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get cart'
      }
    }, { status: 500 });
  }
}

// POST /api/cart - Update cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId, quantity } = body;

    // Validate required fields
    if (!action || !productId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Action and productId are required'
        }
      }, { status: 400 });
    }

    const cookieStore = cookies();
    const sessionId = cookieStore.get('session-id')?.value;
    const customerId = cookieStore.get('customer-id')?.value;

    if (!sessionId && !customerId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session required'
        }
      }, { status: 401 });
    }

    const cart = await DatabaseUtils.getOrCreateCart(customerId, sessionId);

    switch (action) {
      case 'add':
        if (!quantity || quantity < 1) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Valid quantity is required for add action'
            }
          }, { status: 400 });
        }

        await DatabaseUtils.addToCart(cart.id, productId, quantity);
        break;

      case 'remove':
        await DatabaseUtils.removeFromCart(cart.id, productId);
        break;

      case 'update':
        if (!quantity || quantity < 0) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Valid quantity is required for update action'
            }
          }, { status: 400 });
        }

        if (quantity === 0) {
          await DatabaseUtils.removeFromCart(cart.id, productId);
        } else {
          await DatabaseUtils.updateCartItemQuantity(cart.id, productId, quantity);
        }
        break;

      default:
        return NextResponse.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid action. Must be add, remove, or update'
          }
        }, { status: 400 });
    }

    // Get updated cart
    const updatedCart = await DatabaseUtils.getOrCreateCart(customerId, sessionId);

    return NextResponse.json({
      success: true,
      data: updatedCart
    });

  } catch (error) {
    console.error('Cart POST error:', error);
    
    if (error instanceof Error && error.message === 'Product not available') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PRODUCT_UNAVAILABLE',
          message: error.message
        }
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update cart'
      }
    }, { status: 500 });
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('session-id')?.value;
    const customerId = cookieStore.get('customer-id')?.value;

    if (!sessionId && !customerId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session required'
        }
      }, { status: 401 });
    }

    const cart = await DatabaseUtils.getOrCreateCart(customerId, sessionId);
    await DatabaseUtils.clearCart(cart.id);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Cart cleared successfully'
      }
    });

  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear cart'
      }
    }, { status: 500 });
  }
} 