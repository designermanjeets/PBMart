'use client';

import React, { useState } from 'react';
import { Button, Card } from '@b2b/ui-components';
import Link from 'next/link';

type RFQDetailsProps = {
  id: string;
};

export default function RFQDetails({ id }: RFQDetailsProps) {
  const [activeTab, setActiveTab] = useState('details');

  // Mock RFQ data - in a real app, you would fetch this using useEffect
  const rfq = {
    id: 'RFQ-567',
    title: 'Office Supplies',
    description: 'Looking for various office supplies for our new branch office.',
    // ... rest of the mock data ...
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{rfq.title}</h1>
          <p className="mt-1 text-sm text-gray-500">RFQ ID: {rfq.id}</p>
        </div>
        {/* ... rest of the component JSX ... */}
      </div>
    </>
  );
} 