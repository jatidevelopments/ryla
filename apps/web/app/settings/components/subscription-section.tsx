'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Label } from '@ryla/ui';
import { routes } from '@/lib/routes';
import { useCredits } from '../../../lib/hooks/use-credits';
import { useSubscription } from '../../../lib/hooks/use-subscription';

export function SubscriptionSection() {
  const { balance, isLoading: isCreditsLoading } = useCredits();
  const {
    tier,
    status: subscriptionStatus,
    isLoading: isSubscriptionLoading,
  } = useSubscription();

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Current Plan</h3>
            <p className="text-sm text-white/60">Manage your subscription</p>
          </div>
          <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
            {isSubscriptionLoading ? '...' : subscriptionStatus}
          </span>
        </div>
        
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 text-blue-400"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {isSubscriptionLoading ? 'Loading...' : `${tier} Plan`}
              </p>
              <p className="text-sm text-white/60">Upgrade for more features</p>
            </div>
          </div>
        </div>

        <Link href={routes.pricing}>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          >
            Upgrade Plan
          </Button>
        </Link>
      </div>

      {/* Credits Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
        <h3 className="mb-6 text-base font-semibold text-white">Credits Balance</h3>
        
        <div className="mb-4 flex items-end justify-between">
          <span className="text-sm text-white/60">Available Credits</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {isCreditsLoading ? '...' : balance.toLocaleString()}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mb-1 h-6 w-6 text-purple-400"
            >
              <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="mb-6 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
            style={{ width: `${Math.min((balance / 1000) * 100, 100)}%` }}
          />
        </div>

        <Link href={routes.buyCredits}>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-purple-500/30 text-purple-300 hover:border-purple-500/50 hover:bg-purple-500/10"
          >
            Buy More Credits
          </Button>
        </Link>
      </div>
    </div>
  );
}
