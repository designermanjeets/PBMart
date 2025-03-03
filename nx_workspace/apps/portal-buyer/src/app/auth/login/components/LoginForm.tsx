'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, FormField, FormInput } from '@b2b/ui-components';
import { useAuth } from '@b2b/auth';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

export default function LoginForm() {
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        await login(values.email, values.password);
        router.push('/dashboard');
      } catch (err) {
        setError('Invalid email or password');
      }
    },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <Form onSubmit={formik.handleSubmit} className="space-y-6">
          <FormField 
            label="Email" 
            error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
          >
            <FormInput
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormField>

          <FormField 
            label="Password" 
            error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
          >
            <FormInput
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </FormField>

          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {formik.isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </Form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link href="/register" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}