'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Card, Form, FormField, FormInput } from '@b2b/ui-components';
import { useRouter } from 'next/navigation';

interface EditRFQFormProps {
  id: string;
}

export default function EditRFQForm({ id }: EditRFQFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      title: 'Office Supplies RFQ',
      description: 'Seeking quotes for office supplies including...',
      quantity: 100,
      deadline: '2023-12-31',
      specifications: 'Additional specifications...',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Required'),
      description: Yup.string().required('Required'),
      quantity: Yup.number().required('Required').positive('Must be positive'),
      deadline: Yup.date().required('Required').min(new Date(), 'Must be future date'),
      specifications: Yup.string(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      try {
        // Update RFQ logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        console.log('Updating RFQ:', { id, ...values });
        router.push(`/rfq/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Edit RFQ</h1>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-6">
        <Card>
          <Form onSubmit={formik.handleSubmit} className="space-y-6 p-6">
            <FormField label="Title" error={formik.touched.title && formik.errors.title}>
              <FormInput
                type="text"
                {...formik.getFieldProps('title')}
                error={!!(formik.touched.title && formik.errors.title)}
              />
            </FormField>

            <FormField label="Description" error={formik.touched.description && formik.errors.description}>
              <textarea
                {...formik.getFieldProps('description')}
                rows={4}
                className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md
                  ${formik.touched.description && formik.errors.description ? 'border-red-300' : ''}`}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField label="Quantity" error={formik.touched.quantity && formik.errors.quantity}>
                <FormInput
                  type="number"
                  {...formik.getFieldProps('quantity')}
                  error={!!(formik.touched.quantity && formik.errors.quantity)}
                />
              </FormField>

              <FormField label="Deadline" error={formik.touched.deadline && formik.errors.deadline}>
                <FormInput
                  type="date"
                  {...formik.getFieldProps('deadline')}
                  error={!!(formik.touched.deadline && formik.errors.deadline)}
                />
              </FormField>
            </div>

            <FormField label="Specifications" error={formik.touched.specifications && formik.errors.specifications}>
              <textarea
                {...formik.getFieldProps('specifications')}
                rows={4}
                className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter any additional specifications..."
              />
            </FormField>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
}