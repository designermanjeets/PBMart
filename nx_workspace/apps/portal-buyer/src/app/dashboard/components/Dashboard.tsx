'use client';

import React from 'react';
import { Card } from '@b2b/ui-components';
import Link from 'next/link';

export default function Dashboard() {
  // Mock data - replace with API calls
  const stats = [
    { name: 'Active RFQs', value: '12', href: '/rfq' },
    { name: 'Orders', value: '24', href: '/orders' },
    { name: 'Cart Items', value: '3', href: '/cart' },
    { name: 'Saved Products', value: '15', href: '/products' },
  ];

  const recentOrders = [
    {
      id: '1',
      date: '2024-01-15',
      status: 'Processing',
      total: '$1,234.56',
    },
    // Add more orders...
  ];

  const recentRFQs = [
    {
      id: '1',
      title: 'Office Supplies RFQ',
      status: 'Active',
      responses: 3,
    },
    // Add more RFQs...
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.name} href={stat.href}>
            <Card className="px-4 py-5 sm:p-6 hover:bg-gray-50">
              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</dd>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <div className="mt-4">
              <ul className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">{order.total}</span>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Recent RFQs</h3>
            <div className="mt-4">
              <ul className="divide-y divide-gray-200">
                {recentRFQs.map((rfq) => (
                  <li key={rfq.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                        <p className="text-sm text-gray-500">{rfq.responses} responses</p>
                      </div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rfq.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 