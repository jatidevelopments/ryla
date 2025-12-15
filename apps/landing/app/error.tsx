'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-purple-400">Error</h1>
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-white/60 mb-6">
          An error occurred while loading this page.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-full font-medium transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

