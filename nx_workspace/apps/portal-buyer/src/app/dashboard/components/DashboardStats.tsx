'use client';

import React from 'react';
import { Card } from '@b2b/ui-components';

export function DashboardStats() {
  // Mock data - replace with actual API call
  const stats = [
    { id: 1, name: 'Total Orders', value: '24' },
    { id: 2, name: 'Open RFQs', value: '12' },
    { id: 3, name: 'Active Contracts', value: '8' },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.id}>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-sm font-medium text-gray-500 truncate">{stat.name}</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stat.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
} 