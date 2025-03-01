'use client';

import React from 'react';
import { Card } from '@b2b/ui-components';
import Link from 'next/link';

export default function DashboardContent() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats cards */}
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">Total Orders</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">24</div>
          </div>
        </Card>
        {/* ... other stats cards ... */}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card 
          title="Recent Orders" 
          footer={<Link href="/orders" className="text-blue-600 hover:text-blue-500">View all orders</Link>}
        >
          {/* Orders table */}
        </Card>

        {/* Pending RFQs */}
        <Card 
          title="Pending RFQs" 
          footer={<Link href="/rfq" className="text-blue-600 hover:text-blue-500">View all RFQs</Link>}
        >
          {/* RFQs table */}
        </Card>
      </div>
    </>
  );
} 