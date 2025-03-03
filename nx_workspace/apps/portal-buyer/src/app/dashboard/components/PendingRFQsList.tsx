 'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface RFQ {
  id: string;
  rfqNumber: string;
  date: string;
  status: string;
  items: number;
}

export function PendingRFQsList() {
  const router = useRouter();
  
  // Mock data - replace with actual API call
  const rfqs: RFQ[] = [
    {
      id: '1',
      rfqNumber: 'RFQ-5678',
      date: '2023-09-12',
      status: 'Pending',
      items: 5,
    },
    {
      id: '2',
      rfqNumber: 'RFQ-5679',
      date: '2023-09-08',
      status: 'Pending',
      items: 2,
    },
    {
      id: '3',
      rfqNumber: 'RFQ-5680',
      date: '2023-09-05',
      status: 'Pending',
      items: 8,
    },
  ];

  const handleRowClick = (rfqId: string) => {
    router.push(`/rfq/${rfqId}`);
  };

  return (
    <div className="overflow-hidden">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                  RFQ
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                  Items
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <tr 
                  key={rfq.id} 
                  onClick={() => handleRowClick(rfq.id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-600 sm:pl-0">
                    {rfq.rfqNumber}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {rfq.date}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                      {rfq.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    {rfq.items}
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