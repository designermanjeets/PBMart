'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@b2b/ui-components';
import { RecentOrdersList } from './RecentOrdersList';
import { PendingRFQsList } from './PendingRFQsList';
import { DashboardStats } from './DashboardStats';

export default function DashboardContent() {
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mt-8">
          <DashboardStats />
        </div>

        {/* Recent Orders and Pending RFQs */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card 
            title="Recent Orders" 
            footer={<Link href="/orders" className="text-blue-600 hover:text-blue-500">View all orders</Link>}
          >
            <RecentOrdersList />
          </Card>

          {/* Pending RFQs */}
          <Card 
            title="Pending RFQs" 
            footer={<Link href="/rfq" className="text-blue-600 hover:text-blue-500">View all RFQs</Link>}
          >
            <PendingRFQsList />
          </Card>
        </div>
      </div>
    </div>
  );
} 