import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    // Replace with actual database call
    const cart = {
      id: '1',
      userId: '1',
      items: [
        {
          id: '1',
          name: 'Office Chair',
          price: '199.99',
          quantity: 2,
          image: '/product-image.jpg',
        },
      ],
    };

    return NextResponse.json(cart);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch cart' }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    // Add item to cart in database
    const updatedCart = {
      id: '1',
      userId: '1',
      items: [
        {
          ...body,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    };

    return NextResponse.json(updatedCart);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update cart' }),
      { status: 500 }
    );
  }
}