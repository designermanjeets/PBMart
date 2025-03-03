'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@b2b/ui-components';
import { useCartStore } from '@b2b/nxt-store';
import Link from 'next/link';
import ProductReviews from './ProductReviews';
import { useRouter } from 'next/navigation';

interface ProductDetailsProps {
  id: string;
}

export default function ProductDetails({ id }: ProductDetailsProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      // Make sure product has all required properties before adding to cart
      // Safely access product properties with optional chaining
      addToCart({
        id: product.id || id,
        name: product.name || 'Unknown Product',
        price: product.price || 0,
        quantity,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
      });
      setShowModal(true);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
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
      setProduct((prev: any) => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Product not found</h2>
        <p className="mt-2 text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
        <Button
          onClick={() => router.push('/products')}
          className="mt-4"
        >
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-500">Category: {product.category}</p>
        </div>
        <div className="text-2xl font-bold text-gray-900">${product.price?.toFixed(2) || '0.00'}</div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="aspect-w-3 aspect-h-2">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
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
                  {product.specifications.map((spec: { name: string; value: string }) => (
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
                <Button variant="outline" className="w-full" onClick={handleBuyNow}>
                  Buy Now
                </Button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Added to Cart</h3>
            <p>
              {product.name} has been added to your cart.
            </p>
            <div className="mt-6 flex justify-end space-x-4">
              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
              >
                Continue Shopping
              </Button>
              <Button
                onClick={() => {
                  setShowModal(false);
                  router.push('/cart');
                }}
                variant="primary"
              >
                View Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 