export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/auth-options';

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
    const product = {
      id,
      name: 'Office Chair',
      price: '199.99',
      description: 'Ergonomic office chair with lumbar support and adjustable height. Perfect for long work sessions and designed for comfort.',
      category: 'Furniture',
      image: '/product-image.jpg',
      specifications: [
        { name: 'Material', value: 'Mesh and Metal' },
        { name: 'Color', value: 'Black' },
        { name: 'Weight Capacity', value: '300 lbs' },
        { name: 'Dimensions', value: '26"W x 26"D x 38-42"H' },
        { name: 'Adjustable Height', value: 'Yes' },
      ],
      relatedProducts: [
        {
          id: '2',
          name: 'Office Desk',
          price: '299.99',
          image: '/product-image.jpg',
        },
        {
          id: '3',
          name: 'Monitor Stand',
          price: '49.99',
          image: '/product-image.jpg',
        },
      ],
      reviews: [
        {
          id: '1',
          productId: id,
          userId: '1',
          userName: 'John Doe',
          rating: 5,
          comment: 'Excellent chair! Very comfortable for long work sessions.',
          createdAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          productId: id,
          userId: '2',
          userName: 'Jane Smith',
          rating: 4,
          comment: 'Good quality chair. The lumbar support is great, but I wish it had more padding on the armrests.',
          createdAt: '2024-02-20T14:30:00Z',
        },
      ],
    };

    return Response.json(product);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 