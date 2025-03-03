'use client';

import React, { useState } from 'react';
import { Button, Card, Form, FormField } from '@b2b/ui-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function PreferencesSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      emailNotifications: true,
      orderUpdates: true,
      marketingEmails: false,
      language: 'en',
      timezone: 'UTC',
    },
    validationSchema: Yup.object({
      emailNotifications: Yup.boolean(),
      orderUpdates: Yup.boolean(),
      marketingEmails: Yup.boolean(),
      language: Yup.string().required('Required'),
      timezone: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        // Update preferences logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        console.log('Updating preferences:', values);
        setSuccess('Preferences updated successfully');
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
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <FormField label="Email Notifications">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps('emailNotifications')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Receive email notifications
                  </label>
                </div>
              </FormField>

              <FormField label="Order Updates">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps('orderUpdates')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Order status updates
                  </label>
                </div>
              </FormField>

              <FormField label="Marketing Emails">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps('marketingEmails')}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Marketing emails
                  </label>
                </div>
              </FormField>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h3>
            <div className="space-y-4">
              <FormField label="Language" error={formik.touched.language && formik.errors.language ? String(formik.errors.language) : undefined}>
                <select
                  {...formik.getFieldProps('language')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </FormField>

              <FormField label="Timezone" error={formik.touched.timezone && formik.errors.timezone ? String(formik.errors.timezone) : undefined}>
                <select
                  {...formik.getFieldProps('timezone')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                </select>
              </FormField>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Form>
    </div>
  );
} 