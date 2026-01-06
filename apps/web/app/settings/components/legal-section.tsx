'use client';

import * as React from 'react';
import Link from 'next/link';

export function LegalSection() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-white">Legal</h2>
      <div className="space-y-2">
        <Link
          href="/legal"
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
        >
          <span className="text-white">Terms of Service</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-white/40"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <Link
          href="/legal"
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
        >
          <span className="text-white">Privacy Policy</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-white/40"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

