 'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: string;
}

export function RecentOrdersList() {
  const router = useRouter();
  
  // Mock data - replace with actual API call
  const orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-12345',
      date: '2023-09-10',
      status: 'Shipped',
      total: '$554.98',
    },
    {
      id: '2',
      orderNumber: 'ORD-12346',
      date: '2023-08-25',
      status: 'Delivered',
      total: '$129.99',
    },
    {
      id: '3',
      orderNumber: 'ORD-12347',
      date: '2023-08-15',
      status: 'Processing',
      total: '$899.95',
    },
  ];

  const handleRowClick = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="overflow-hidden">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  Order
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleRowClick(order.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-600 sm:pl-0">
                    {order.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    {order.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}