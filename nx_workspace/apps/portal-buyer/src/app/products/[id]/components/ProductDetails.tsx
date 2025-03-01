'use client';

import React, { useState } from 'react';
import { Card, Button } from '@b2b/ui-components';
import { useCartStore } from '@b2b/nxt-store';
import Link from 'next/link';
import ProductReviews from './ProductReviews';

interface ProductDetailsProps {
  id: string;
}

export default function ProductDetails({ id }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  // Mock data - replace with API call
  const product = {
    id,
    name: 'Office Chair',
    price: '199.99',
    description: 'Ergonomic office chair with adjustable height...',
    specifications: [
      { name: 'Material', value: 'Mesh and Metal' },
      { name: 'Color', value: 'Black' },
      { name: 'Weight Capacity', value: '300 lbs' },
    ],
    images: ['/product-image.jpg'],
    category: 'Furniture',
    stock: 50,
    reviews: [
      {
        id: '1',
        productId: id,
        userId: '1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent chair! Very comfortable for long work sessions.',
        createdAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        productId: id,
        userId: '2',
        userName: 'Jane Smith',
        rating: 4,
        comment: 'Good quality chair. The lumbar support is great, but I wish it had more padding on the armrests.',
        createdAt: '2024-02-20T14:30:00Z',
      },
    ],
  };

  const handleAddToCart = async () => {
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0],
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  const handleAddReview = async (review: {
    productId: string;
    rating: number;
    comment: string;
  }) => {
    try {
      const response = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) throw new Error('Failed to add review');
      
      const newReview = await response.json();
      
      // Update the product state with the new review
      setProduct((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          reviews: [...prev.reviews, newReview],
        };
      });
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Category: {product.category}</p>
        </div>
        <div className="text-2xl font-bold text-gray-900">${product.price}</div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="aspect-w-3 aspect-h-2">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Product Details</h2>
              <p className="mt-4 text-gray-600">{product.description}</p>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900">Specifications</h3>
                <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                  {product.specifications.map((spec) => (
                    <div key={spec.name} className="py-3 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">{spec.name}</dt>
                      <dd className="text-sm text-gray-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  {product.stock} units available
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button variant="primary" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
                <Link href={`/rfq/create?productId=${id}`}>
                  <Button variant="outline" className="w-full">
                    Create RFQ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {product.reviews && (
        <ProductReviews
          productId={id}
          reviews={product.reviews}
          onAddReview={handleAddReview}
        />
      )}
    </>
  );
} 