import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    // Mock orders data - replace with actual database call
    const orders = [
      {
        id: '1',
        orderNumber: 'ORD-12345',
        date: '2023-09-10T14:30:00Z',
        status: 'Shipped',
        total: '554.98',
        items: [
          {
            id: '1',
            name: 'Office Chair',
            price: '199.99',
            quantity: 1,
          },
          {
            id: '2',
            name: 'Office Desk',
            price: '299.99',
            quantity: 1,
          },
        ],
      },
      {
        id: '2',
        orderNumber: 'ORD-12346',
        date: '2023-08-25T10:15:00Z',
        status: 'Delivered',
        total: '129.99',
        items: [
          {
            id: '3',
            name: 'Monitor Stand',
            price: '49.99',
            quantity: 1,
          },
          {
            id: '4',
            name: 'Keyboard',
            price: '79.99',
            quantity: 1,
          },
        ],
      },
    ];

    return NextResponse.json(orders);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch orders' }),
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
    const data = await request.json();
    
    // Mock response - replace with actual database call
    return NextResponse.json({ 
      success: true, 
      message: 'Order created',
      order: {
        id: Math.random().toString(36).substring(2, 11),
        orderNumber: `ORD-${Math.floor(Math.random() * 100000)}`,
        date: new Date().toISOString(),
        status: 'Processing',
        ...data
      }
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create order' }),
      { status: 500 }
    );
  }
}