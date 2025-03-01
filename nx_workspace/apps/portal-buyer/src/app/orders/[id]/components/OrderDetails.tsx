'use client';

import React from 'react';
import { Card, Button } from '@b2b/ui-components';
import Link from 'next/link';

interface OrderDetailsProps {
  id: string;
}

export default function OrderDetails({ id }: OrderDetailsProps) {
  // Mock data - replace with API call
  const order = {
    id,
    date: '2024-01-15',
    status: 'Processing',
    total: '$1,234.56',
    shipping: '$29.99',
    items: [
      {
        id: '1',
        name: 'Office Chair',
        quantity: 2,
        price: '$199.99',
        image: '/product-image.jpg',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      company: 'Acme Corp',
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    billingAddress: {
      name: 'John Doe',
      company: 'Acme Corp',
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h1>
          <p className="mt-1 text-sm text-gray-500">Placed on {order.date}</p>
        </div>
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item.id} className="py-6 flex">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>
                            <Link href={`/products/${item.id}`}>{item.name}</Link>
                          </h3>
                          <p className="ml-4">{item.price}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <address className="not-italic">
                  <p className="text-sm text-gray-900">{order.shippingAddress.name}</p>
                  <p className="text-sm text-gray-900">{order.shippingAddress.company}</p>
                  <p className="text-sm text-gray-900">{order.shippingAddress.street}</p>
                  <p className="text-sm text-gray-900">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p className="text-sm text-gray-900">{order.shippingAddress.country}</p>
                </address>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h2>
                <address className="not-italic">
                  <p className="text-sm text-gray-900">{order.billingAddress.name}</p>
                  <p className="text-sm text-gray-900">{order.billingAddress.company}</p>
                  <p className="text-sm text-gray-900">{order.billingAddress.street}</p>
                  <p className="text-sm text-gray-900">
                    {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}
                  </p>
                  <p className="text-sm text-gray-900">{order.billingAddress.country}</p>
                </address>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <dl className="space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">{order.total}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">{order.shipping}</dd>
                </div>
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">{order.total}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  Download Invoice
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
} 