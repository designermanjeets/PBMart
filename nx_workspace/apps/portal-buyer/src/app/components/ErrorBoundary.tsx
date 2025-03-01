 'use client';

import React from 'react';
import { Card, Button } from '@b2b/ui-components';

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Something went wrong!
          </h2>
          <p className="text-gray-600 mb-6">
            {error.message || 'An unexpected error occurred'}
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button variant="primary" onClick={reset}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}