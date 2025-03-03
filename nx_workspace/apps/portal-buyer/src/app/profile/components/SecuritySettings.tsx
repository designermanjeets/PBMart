'use client';

import React, { useState } from 'react';
import { Button, Form, FormField, FormInput } from '@b2b/ui-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function SecuritySettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Required'),
      newPassword: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        // Update password logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        console.log('Updating password:', values);
        setSuccess('Password updated successfully');
        formik.resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <Form onSubmit={formik.handleSubmit} className="space-y-6">
        <FormField label="Current Password" error={formik.touched.currentPassword && formik.errors.currentPassword ? String(formik.errors.currentPassword) : undefined}>
          <FormInput
            type="password"
            {...formik.getFieldProps('currentPassword')}
          />
        </FormField>

        <FormField label="New Password" error={formik.touched.newPassword && formik.errors.newPassword ? String(formik.errors.newPassword) : undefined}>
          <FormInput
            type="password"
            {...formik.getFieldProps('newPassword')}
          />
        </FormField>

        <FormField label="Confirm Password" error={formik.touched.confirmPassword && formik.errors.confirmPassword ? String(formik.errors.confirmPassword) : undefined}>
          <FormInput
            type="password"
            {...formik.getFieldProps('confirmPassword')}
          />
        </FormField>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Form>
    </div>
  );
} 