export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/auth-options';
import { Session } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Replace with actual database call
    const reviews = [
      {
        id: '1',
        productId: id,
        userId: '1',
        rating: 5,
        comment: 'Great product, highly recommended!',
        userName: 'John Doe',
        createdAt: '2024-01-15T10:00:00Z',
      },
      // Add more reviews...
    ];

    return Response.json(reviews);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const review = {
      id: Math.random().toString(36).substring(2, 9),
      productId: id,
      userId: '1',
      userName: session.user?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      ...body,
    };

    return Response.json(review);
  } catch (error) {
    return Response.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}