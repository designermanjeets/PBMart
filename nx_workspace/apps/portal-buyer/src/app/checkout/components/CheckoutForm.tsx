'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Form, FormField, FormInput } from '@b2b/ui-components';
import { useCartStore } from '@b2b/nxt-store';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const CheckoutSchema = Yup.object().shape({
  shippingName: Yup.string().required('Required'),
  shippingCompany: Yup.string(),
  shippingStreet: Yup.string().required('Required'),
  shippingCity: Yup.string().required('Required'),
  shippingState: Yup.string().required('Required'),
  shippingZip: Yup.string().required('Required'),
  cardNumber: Yup.string().required('Required'),
  cardExpiry: Yup.string().required('Required'),
  cardCvc: Yup.string().required('Required'),
});

export default function CheckoutForm() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotal();
  const tax = subtotal * 0.08;
  const shipping = 15.00;
  const total = subtotal + tax + shipping;

  const formik = useFormik({
    initialValues: {
      shippingName: '',
      shippingCompany: '',
      shippingStreet: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    },
    validationSchema: CheckoutSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      try {
        // Process order
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        console.log('Processing order:', { items, values });
        await clearCart();
        router.push('/orders');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
        <Button variant="primary" onClick={() => router.push('/products')}>
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Form onSubmit={formik.handleSubmit} className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField 
                    label="Full Name" 
                    error={formik.touched.shippingName && formik.errors.shippingName ? formik.errors.shippingName : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('shippingName')}
                    />
                  </FormField>

                  <FormField 
                    label="Company" 
                    error={formik.touched.shippingCompany && formik.errors.shippingCompany ? formik.errors.shippingCompany : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('shippingCompany')}
                    />
                  </FormField>
                </div>

                <div className="mt-6">
                  <FormField 
                    label="Street Address" 
                    error={formik.touched.shippingStreet && formik.errors.shippingStreet ? formik.errors.shippingStreet : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('shippingStreet')}
                    />
                  </FormField>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <FormField 
                    label="City" 
                    error={formik.touched.shippingCity && formik.errors.shippingCity ? formik.errors.shippingCity : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('shippingCity')}
                    />
                  </FormField>

                  <FormField 
                    label="State" 
                    error={formik.touched.shippingState && formik.errors.shippingState ? formik.errors.shippingState : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('shippingState')}
                    />
                  </FormField>

                  <FormField 
                    label="ZIP Code" 
                    error={formik.touched.shippingZip && formik.errors.shippingZip ? formik.errors.shippingZip : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('shippingZip')}
                    />
                  </FormField>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
                <div className="grid grid-cols-1 gap-6">
                  <FormField 
                    label="Card Number" 
                    error={formik.touched.cardNumber && formik.errors.cardNumber ? formik.errors.cardNumber : undefined}
                  >
                    <FormInput
                      type="text"
                      {...formik.getFieldProps('cardNumber')}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField 
                      label="Expiry Date" 
                      error={formik.touched.cardExpiry && formik.errors.cardExpiry ? formik.errors.cardExpiry : undefined}
                    >
                      <FormInput
                        type="text"
                        placeholder="MM/YY"
                        {...formik.getFieldProps('cardExpiry')}
                      />
                    </FormField>

                    <FormField 
                      label="CVC" 
                      error={formik.touched.cardCvc && formik.errors.cardCvc ? formik.errors.cardCvc : undefined}
                    >
                      <FormInput
                        type="text"
                        {...formik.getFieldProps('cardCvc')}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </Card>
          </Form>
        </div>

        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">{item.price}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Tax</dt>
                  <dd className="text-sm font-medium text-gray-900">${tax.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                </div>
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <dt className="text-base font-medium text-gray-900">Total</dt>
                  <dd className="text-base font-medium text-gray-900">${total.toFixed(2)}</dd>
                </div>
              </dl>
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  onClick={() => formik.handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
} 