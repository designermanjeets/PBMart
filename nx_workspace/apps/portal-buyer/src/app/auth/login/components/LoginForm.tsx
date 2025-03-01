'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, Button, Form, FormField, FormInput } from '@b2b/ui-components';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
        });

        if (result?.error) {
          setError('Invalid email or password');
          return;
        }

        const callbackUrl = searchParams.get('callbackUrl') || '/';
        router.push(callbackUrl);
      } catch (err) {
        setError('An error occurred during sign in');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Card>
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Form onSubmit={formik.handleSubmit} className="space-y-6">
          <FormField label="Email" error={formik.touched.email && formik.errors.email}>
            <FormInput
              type="email"
              {...formik.getFieldProps('email')}
              error={!!(formik.touched.email && formik.errors.email)}
            />
          </FormField>

          <FormField label="Password" error={formik.touched.password && formik.errors.password}>
            <FormInput
              type="password"
              {...formik.getFieldProps('password')}
              error={!!(formik.touched.password && formik.errors.password)}
            />
          </FormField>

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
} 