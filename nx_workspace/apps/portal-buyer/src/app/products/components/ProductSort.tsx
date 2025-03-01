 'use client';

import React from 'react';
import { ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface ProductSortProps {
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

export default function ProductSort({ onSort, sortConfig }: ProductSortProps) {
  const sortOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Price', value: 'price' },
    { label: 'Category', value: 'category' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Sort by:</span>
      <div className="flex space-x-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSort(option.value)}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
              sortConfig?.key === option.value
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {option.label}
            {sortConfig?.key === option.value && (
              <ArrowsUpDownIcon className="ml-1.5 h-4 w-4" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}