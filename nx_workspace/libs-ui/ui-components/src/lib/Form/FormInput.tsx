'use client';

import React, { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function FormInput({ className = '', ...props }: FormInputProps) {
  return (
    <input
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
      {...props}
    />
  );
} 