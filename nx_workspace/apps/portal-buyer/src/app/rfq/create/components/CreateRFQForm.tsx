'use client';

import React, { FormEvent } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Button, Card, Form, FormField, FormInput } from '@b2b/ui-components';
import { useRouter } from 'next/navigation';

export default function CreateRFQForm() {
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      quantity: '',
      deadline: '',
      specifications: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Required'),
      description: Yup.string().required('Required'),
      quantity: Yup.number().required('Required').positive('Must be positive'),
      deadline: Yup.date().required('Required').min(new Date(), 'Must be future date'),
      specifications: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        // Submit RFQ logic here
        console.log('Submitting RFQ:', values);
        router.push('/rfq');
      } catch (error) {
        console.error('Error creating RFQ:', error);
      }
    },
  });

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create New RFQ</h1>
      </div>

      <div className="mt-6">
        <Card>
          <Form onSubmit={(e: FormEvent<Element>) => formik.handleSubmit(e as FormEvent<HTMLFormElement>)} className="space-y-6 p-6">
            <FormField label="Title" error={formik.touched.title && formik.errors.title ? formik.errors.title : undefined}>
              <FormInput
                type="text"
                {...formik.getFieldProps('title')}
              />
            </FormField>

            <FormField label="Description" error={formik.touched.description && formik.errors.description ? formik.errors.description : undefined}>
              <textarea
                {...formik.getFieldProps('description')}
                rows={4}
                className={`shadow-sm block w-full sm:text-sm border-gray-300 rounded-md
                  ${formik.touched.description && formik.errors.description ? 'border-red-300' : ''}`}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField label="Quantity" error={formik.touched.quantity && formik.errors.quantity ? formik.errors.quantity : undefined}>
                <FormInput
                  type="number"
                  {...formik.getFieldProps('quantity')}
                />
              </FormField>

              <FormField label="Deadline" error={formik.touched.deadline && formik.errors.deadline ? formik.errors.deadline : undefined}>
                <FormInput
                  type="date"
                  {...formik.getFieldProps('deadline')}
                />
              </FormField>
            </div>

            <FormField label="Specifications" error={formik.touched.specifications && formik.errors.specifications ? formik.errors.specifications : undefined}>
              <textarea
                {...formik.getFieldProps('specifications')}
                rows={4}
                className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Enter any additional specifications..."
              />
            </FormField>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create RFQ
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </>
  );
} 