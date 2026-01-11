'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GoogleButton } from './google-button';
import { PrimaryButton } from './primary-button';
import { slideIn } from '../constants';

interface EmailStepProps {
  email: string;
  onEmailChange: (value: string) => void;
  onEmailCheck: () => void;
  onEmailKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isChecking: boolean;
  emailError: string | null;
  onGoogleAuth: () => void;
}

export function EmailStep({
  email,
  onEmailCheck,
  isLoading,
  isChecking,
  onGoogleAuth,
}: Omit<EmailStepProps, 'onEmailChange' | 'onEmailKeyDown' | 'emailError'>) {
  return (
    <motion.div
      key="email-form"
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <PrimaryButton
        type="button"
        onClick={onEmailCheck}
        disabled={!email || isChecking}
        loading={isChecking}
      >
        Continue
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </PrimaryButton>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-white/30 uppercase tracking-wider">
          or
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton onClick={onGoogleAuth} disabled={isLoading} />
    </motion.div>
  );
}
