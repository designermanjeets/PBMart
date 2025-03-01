'use client';

import React, { useState } from 'react';
import { Card, Button, Table } from '@b2b/ui-components';
import Link from 'next/link';

export default function RFQList() {
  const [status, setStatus] = useState('all');

  // Mock data - replace with API call
  const rfqs = [
    {
      id: '1',
      title: 'Office Supplies RFQ',
      status: 'pending',
      createdAt: '2023-12-01',
      responses: 3,
    },
    {
      id: '2',
      title: 'IT Equipment RFQ',
      status: 'active',
      createdAt: '2023-12-02',
      responses: 5,
    },
  ];

  const headers = ['Title', 'Status', 'Created', 'Responses', 'Actions'];

  const renderRow = (rfq: any) => (
    <tr key={rfq.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{rfq.title}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${rfq.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
        >
          {rfq.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {rfq.createdAt}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {rfq.responses}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <Link href={`/rfq/${rfq.id}`} className="text-blue-600 hover:text-blue-900">
          View
        </Link>
      </td>
    </tr>
  );

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Request for Quotes</h1>
        <Link href="/rfq/create">
          <Button variant="primary">Create New RFQ</Button>
        </Link>
      </div>

      <div className="mt-4">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-end mb-4">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <Table
              headers={headers}
              data={rfqs}
              renderRow={renderRow}
            />
          </div>
        </Card>
      </div>
    </>
  );
} 