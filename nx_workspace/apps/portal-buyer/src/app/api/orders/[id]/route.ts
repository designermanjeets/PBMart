export const dynamic = "force-dynamic"; // Ensure API runs dynamically, even in static builds

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";

// According to Next.js 15 docs, params is now a Promise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Need to await params
  const { id } = await params;
  
  if (!id) {
    return Response.json({ error: "Order ID is required" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    // Mock order data (Replace this with actual database call)
    const order = {
      id,
      orderNumber: `ORD-${id}`,
      date: "2023-09-10T14:30:00Z",
      status: "Shipped",
      total: "554.98",
      items: [
        { id: "1", name: "Office Chair", price: "199.99", quantity: 1 },
        { id: "2", name: "Office Desk", price: "299.99", quantity: 1 },
      ],
      shipping: {
        address: "123 Business St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      payment: {
        method: "Credit Card",
        cardLast4: "4242",
      },
    };

    return Response.json(order);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
