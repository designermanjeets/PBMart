 'use client';

import React from 'react';
import { FormInput } from '@b2b/ui-components';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
  categories: string[];
}

export default function ProductSearch({
  searchTerm,
  onSearchChange,
  onCategoryChange,
  selectedCategory,
  categories,
}: ProductSearchProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <FormInput
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}