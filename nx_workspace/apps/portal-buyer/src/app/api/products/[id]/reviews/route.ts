import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    // Replace with actual database call
    const reviews = [
      {
        id: '1',
        productId: params.id,
        userId: '1',
        rating: 5,
        comment: 'Great product, highly recommended!',
        userName: 'John Doe',
        createdAt: '2024-01-15T10:00:00Z',
      },
      // Add more reviews...
    ];

    return NextResponse.json(reviews);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch reviews' }),
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const review = {
      id: Math.random().toString(36).substr(2, 9),
      productId: params.id,
      userId: '1',
      userName: session.user?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json(review);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create review' }),
      { status: 500 }
    );
  }
}