'use client';

import React, { useState } from 'react';
import { Card, Button, Form, FormField, FormInput } from '@b2b/ui-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SecuritySettings from './SecuritySettings';
import PreferencesSettings from './PreferencesSettings';

export default function ProfileContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const formik = useFormik({
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      company: 'Acme Corp',
      phone: '+1234567890',
      address: '123 Business St',
      city: 'New York',
      country: 'USA',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Required'),
      lastName: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      company: Yup.string().required('Required'),
      phone: Yup.string().required('Required'),
      address: Yup.string().required('Required'),
      city: Yup.string().required('Required'),
      country: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        // Update profile logic here
        console.log('Updating profile:', values);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'preferences', label: 'Preferences' },
  ];

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
      </div>

      <div className="mt-4">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 font-medium text-sm rounded-md`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <Card>
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              {isEditing ? (
                <Form onSubmit={formik.handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField label="First Name" error={formik.touched.firstName && formik.errors.firstName}>
                      <FormInput
                        type="text"
                        {...formik.getFieldProps('firstName')}
                        error={!!(formik.touched.firstName && formik.errors.firstName)}
                      />
                    </FormField>

                    <FormField label="Last Name" error={formik.touched.lastName && formik.errors.lastName}>
                      <FormInput
                        type="text"
                        {...formik.getFieldProps('lastName')}
                        error={!!(formik.touched.lastName && formik.errors.lastName)}
                      />
                    </FormField>

                    <FormField label="Email" error={formik.touched.email && formik.errors.email}>
                      <FormInput
                        type="email"
                        {...formik.getFieldProps('email')}
                        error={!!(formik.touched.email && formik.errors.email)}
                      />
                    </FormField>

                    <FormField label="Phone" error={formik.touched.phone && formik.errors.phone}>
                      <FormInput
                        type="tel"
                        {...formik.getFieldProps('phone')}
                        error={!!(formik.touched.phone && formik.errors.phone)}
                      />
                    </FormField>

                    <FormField label="Company" error={formik.touched.company && formik.errors.company}>
                      <FormInput
                        type="text"
                        {...formik.getFieldProps('company')}
                        error={!!(formik.touched.company && formik.errors.company)}
                      />
                    </FormField>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(formik.values).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-gray-500">{key.charAt(0).toUpperCase() + key.slice(1)}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
              <SecuritySettings />
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>
              <PreferencesSettings />
            </div>
          )}
        </Card>
      </div>
    </>
  );
} 