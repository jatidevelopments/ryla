'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RylaInput } from '@ryla/ui';
import { PrimaryButton } from './primary-button';
import { slideIn } from '../constants';

interface ForgotPasswordFormProps {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  success: boolean;
  onSwitchToLogin: () => void;
  onRetry: () => void;
  canRetry: boolean;
  cooldownSeconds: number;
}

export function ForgotPasswordForm({
  email,
  onEmailChange,
  onSubmit,
  isLoading,
  error,
  success,
  onSwitchToLogin,
  onRetry,
  canRetry,
  cooldownSeconds,
}: ForgotPasswordFormProps) {
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    onEmailChange(value);
    setEmailError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError(null);
    onSubmit(e);
  };

  if (success) {
    return (
      <motion.div
        key="forgot-password-success"
        variants={slideIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6"
      >
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-400 mb-1">
                Check your email
              </h3>
              <p className="text-sm text-white/70">
                If an account exists with this email, a password reset link has been sent.
                Please check your inbox and follow the instructions.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {!canRetry && cooldownSeconds > 0 && (
            <div className="text-center text-sm text-white/50">
              Resend code available in {cooldownSeconds} seconds
            </div>
          )}
          
          {canRetry && (
            <PrimaryButton
              type="button"
              onClick={onRetry}
              disabled={isLoading}
              loading={isLoading}
            >
              Resend Code
            </PrimaryButton>
          )}

          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full text-center text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      key="forgot-password-form"
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-sm text-white/50">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <div>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-white/70 mb-2"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <RylaInput
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={isLoading}
            autoFocus
            aria-label="Email address"
            className="pl-12"
          />
        </div>
        {(emailError || error) && (
          <p className="mt-2 text-sm text-red-400">
            {emailError || error}
          </p>
        )}
      </div>

      <PrimaryButton type="submit" disabled={isLoading} loading={isLoading}>
        Send Reset Link
      </PrimaryButton>

      <button
        type="button"
        onClick={onSwitchToLogin}
        className="w-full text-center text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
      >
        Back to Sign In
      </button>
    </motion.form>
  );
}
