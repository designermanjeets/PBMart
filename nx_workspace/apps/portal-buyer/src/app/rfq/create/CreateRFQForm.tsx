'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@b2b/ui-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';

export default function CreateRFQForm() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Form validation schemas and handlers from the original page
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      quantity: 0,
      deadline: '',
      specifications: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      quantity: Yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1'),
      deadline: Yup.date().required('Deadline is required').min(new Date(), 'Deadline must be in the future'),
      specifications: Yup.string(),
    }),
    onSubmit: async (values) => {
      // setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('RFQ created:', values);
        // setIsSubmitting(false);
        router.push('/rfq');
      } catch (error) { 
        console.error('Error creating RFQ:', error);
        // setIsSubmitting(false);
      }
    },
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create New RFQ</h1>
        <Link href="/rfq">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <form onSubmit={formik.handleSubmit} className="mt-6 space-y-6">
        {/* Form content */}
      </form>
    </>
  );
} 