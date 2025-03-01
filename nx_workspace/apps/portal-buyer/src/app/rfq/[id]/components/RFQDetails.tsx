'use client';

import React from 'react';
import { Card, Button } from '@b2b/ui-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RFQDetailsProps {
  id: string;
}

export default function RFQDetails({ id }: RFQDetailsProps) {
  const router = useRouter();

  // Mock data - replace with API call
  const rfq = {
    id,
    title: 'Office Supplies RFQ',
    status: 'active',
    createdAt: '2023-12-01',
    deadline: '2023-12-31',
    description: 'Seeking quotes for office supplies including...',
    quantity: 100,
    specifications: 'Additional specifications...',
    responses: [
      {
        id: '1',
        supplierName: 'Supplier A',
        price: '$1000',
        deliveryTime: '2 weeks',
        status: 'pending',
      },
      // Add more responses as needed
    ],
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        // Delete logic here
        console.log('Deleting RFQ:', id);
        router.push('/rfq');
      } catch (error) {
        console.error('Error deleting RFQ:', error);
      }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">{rfq.title}</h1>
        <div className="flex space-x-3">
          <Link href={`/rfq/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="outline" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <Card>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Details</h3>
                <dl className="mt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="text-sm text-gray-900 col-span-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${rfq.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {rfq.status}
                      </span>
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{rfq.createdAt}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Deadline</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{rfq.deadline}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{rfq.quantity}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <p className="mt-4 text-sm text-gray-600">{rfq.description}</p>
                {rfq.specifications && (
                  <>
                    <h3 className="mt-6 text-lg font-medium text-gray-900">Specifications</h3>
                    <p className="mt-4 text-sm text-gray-600">{rfq.specifications}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Responses ({rfq.responses.length})</h3>
            <div className="mt-4">
              {rfq.responses.map((response) => (
                <div key={response.id} className="border-t border-gray-200 pt-4 mt-4 first:border-0 first:pt-0 first:mt-0">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{response.supplierName}</p>
                      <p className="text-sm text-gray-500">Price: {response.price}</p>
                    </div>
                    <div className="flex justify-end items-center space-x-3">
                      <span className="text-sm text-gray-500">Delivery: {response.deliveryTime}</span>
                      <Button variant="primary" size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
} 