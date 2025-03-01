import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchProps<T> {
  items: T[];
  searchFields: (keyof T)[];
  initialFilters?: Partial<Record<keyof T, any>>;
}

export function useSearch<T>({ items, searchFields, initialFilters = {} }: UseSearchProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredItems = useCallback(() => {
    return items.filter((item) => {
      // Apply search
      if (debouncedSearchTerm) {
        const searchMatch = searchFields.some((field) => {
          const value = item[field];
          return value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        });
        if (!searchMatch) return false;
      }

      // Apply filters
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return item[key as keyof T] === value;
      });
    });
  }, [items, debouncedSearchTerm, searchFields, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredItems: filteredItems(),
  };
}