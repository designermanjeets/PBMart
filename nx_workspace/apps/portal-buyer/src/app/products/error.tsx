'use client';

import ErrorBoundary from '../components/ErrorBoundary';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
} 