'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GoogleButton } from './google-button';
import { FacebookButton } from './facebook-button';
import { DiscordButton } from './discord-button';
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
  onFacebookAuth?: () => void;
  onDiscordAuth?: () => void;
}

export function EmailStep({
  onEmailCheck,
  isLoading,
  isChecking,
  onGoogleAuth,
  onFacebookAuth,
  onDiscordAuth,
}: Omit<EmailStepProps, 'email' | 'onEmailChange' | 'onEmailKeyDown' | 'emailError'>) {
  return (
    <motion.div
      key="email-form"
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      {/* Social Login Buttons */}
      <div className="space-y-2.5">
        <GoogleButton onClick={onGoogleAuth} disabled={isLoading || isChecking} />
        <FacebookButton onClick={onFacebookAuth || (() => {})} disabled={isLoading || isChecking} />
        <DiscordButton onClick={onDiscordAuth || (() => {})} disabled={isLoading || isChecking} />
      </div>
    </motion.div>
  );
}
