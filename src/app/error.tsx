'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry or console in production
    console.error('[Selsa] Unhandled error:', error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-neutral-600">
        We hit an unexpected error. Please try again — if the problem persists,
        contact our support team.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Back to Home
        </a>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-neutral-400">
          Error ID: {error.digest}
        </p>
      )}
    </main>
  );
}
