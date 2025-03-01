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
  // ... rest of the component logic ...

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