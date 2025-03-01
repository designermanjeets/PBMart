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
    const products = [
      {
        id: '1',
        name: 'Office Chair',
        price: '199.99',
        description: 'Ergonomic office chair...',
        category: 'Furniture',
        image: '/product-image.jpg',
      },
      // Add more products...
    ];

    return NextResponse.json(products);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch products' }),
      { status: 500 }
    );
  }
}