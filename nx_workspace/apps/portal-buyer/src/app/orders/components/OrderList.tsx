'use client';

import React, { useState } from 'react';
import { Card, Button } from '@b2b/ui-components';
import Link from 'next/link';

export default function OrderList() {
  const [status, setStatus] = useState('all');

  // Mock data - replace with API call
  const orders = [
    {
      id: '1',
      date: '2024-01-15',
      status: 'Processing',
      total: '$1,234.56',
      items: [
        {
          id: '1',
          name: 'Office Chair',
          quantity: 2,
          price: '$199.99',
        },
      ],
    },
    // Add more orders...
  ];

  const statuses = [
    { id: 'all', name: 'All Orders' },
    { id: 'processing', name: 'Processing' },
    { id: 'shipped', name: 'Shipped' },
    { id: 'delivered', name: 'Delivered' },
  ];

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      </div>

      <div className="mt-4">
        <nav className="flex space-x-4" aria-label="Status">
          {statuses.map((stat) => (
            <button
              key={stat.id}
              onClick={() => setStatus(stat.id)}
              className={`${
                status === stat.id
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              {stat.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6 space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Order #{order.id}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">{order.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium text-gray-900">
                    {order.total}
                  </span>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Items</h3>
                <ul className="mt-2 divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <li key={item.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{item.price}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex justify-end">
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
} 