 'use client';

import React, { useState } from 'react';
import { Card, Button, Form, FormField, FormInput } from '@b2b/ui-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'userId' | 'userName' | 'createdAt'>) => void;
}

export default function ProductReviews({ productId, reviews, onAddReview }: ProductReviewsProps) {
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const formik = useFormik({
    initialValues: {
      rating: 5,
      comment: '',
    },
    validationSchema: Yup.object({
      rating: Yup.number().min(1).max(5).required('Required'),
      comment: Yup.string().required('Please provide a review comment'),
    }),
    onSubmit: (values, { resetForm }) => {
      onAddReview({
        productId,
        rating: values.rating,
        comment: values.comment,
      });
      resetForm();
      setIsAddingReview(false);
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive
            ? star <= (hoveredRating || formik.values.rating)
            : star <= rating;

          const StarComponent = isFilled ? StarIcon : StarOutlineIcon;

          return interactive ? (
            <button
              key={star}
              type="button"
              onClick={() => formik.setFieldValue('rating', star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-yellow-400 h-6 w-6"
            >
              <StarComponent className="h-6 w-6" />
            </button>
          ) : (
            <StarComponent
              key={star}
              className={`h-5 w-5 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        {!isAddingReview && (
          <Button variant="outline" onClick={() => setIsAddingReview(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {isAddingReview && (
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Write Your Review</h3>
            <Form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                {renderStars(formik.values.rating, true)}
                {formik.touched.rating && formik.errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.rating}</p>
                )}
              </div>

              <FormField
                label="Review"
                error={formik.touched.comment && formik.errors.comment ? String(formik.errors.comment) : undefined}
              >
                <textarea
                  {...formik.getFieldProps('comment')}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </FormField>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Submit Review
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      )}

      {reviews.length === 0 ? (
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="font-medium text-gray-900">{review.userName}</div>
                    <span className="mx-2 text-gray-300">•</span>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="mt-4 text-gray-600">{review.comment}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}