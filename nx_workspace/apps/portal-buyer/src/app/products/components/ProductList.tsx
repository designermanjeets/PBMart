'use client';

import React from 'react';
import { Card, Button } from '@b2b/ui-components';
import { useCartStore } from '@b2b/nxt-store';
import { useSearch } from '@b2b/nxt-hooks';
import ProductSearch from './ProductSearch';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
  image: string;
}

export default function ProductList() {
  const { addItem } = useCartStore();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  const categories = [...new Set(products.map((p) => p.category))];

  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredItems: filteredProducts,
  } = useSearch<Product>({
    items: products,
    searchFields: ['name', 'description'],
    initialFilters: { category: '' },
  });

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCategoryChange={(category) => setFilters({ ...filters, category })}
        selectedCategory={filters.category as string}
        categories={categories}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <img
              src={product.image}
              alt={product.name}
              className="h-48 w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-medium text-gray-900">
                  {product.price}
                </span>
                <div className="space-x-2">
                  <Button
                    variant="primary"
                    onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image,
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                  <Link href={`/products/${product.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 