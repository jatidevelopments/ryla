'use client';

import * as React from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { RylaInput } from '@ryla/ui';
import { EmailStep, LoginForm, RegisterForm } from './index';
import { ForgotPasswordForm } from './forgot-password-form';
import type { AuthMode, LoginFormData, RegisterFormData } from '../constants';

interface AuthFormContentProps {
  mode: AuthMode;
  email: string;
  emailError: string | null;
  isLoading: boolean;
  isChecking: boolean;
  submitError: string | null;
  emailCheckError: string | null;
  loginData: LoginFormData;
  registerData: RegisterFormData;
  handleEmailChange: (value: string) => void;
  handleEmailCheck: () => void;
  handleEmailKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleLoginChange: (field: keyof LoginFormData, value: string | boolean) => void;
  handleRegisterChange: (field: keyof RegisterFormData, value: string | boolean) => void;
  handleModeSwitch: (newMode: 'login' | 'register' | 'forgot-password') => void;
  handleLoginSubmit: (e: React.FormEvent) => void;
  handleRegisterSubmit: (e: React.FormEvent) => void;
  handleGoogleAuth: () => void;
  handleFacebookAuth: () => void;
  handleDiscordAuth: () => void;
  handleSwitchToForgotPassword?: () => void;
  handleForgotPasswordSubmit?: (e: React.FormEvent) => void;
  handleForgotPasswordRetry?: () => void;
  forgotPasswordSuccess?: boolean;
  cooldownSeconds?: number;
  canRetry?: boolean;
}

export function AuthFormContent({
  mode,
  email,
  emailError,
  isLoading,
  isChecking,
  submitError,
  emailCheckError,
  loginData,
  registerData,
  handleEmailChange,
  handleEmailCheck,
  handleEmailKeyDown,
  handleLoginChange,
  handleRegisterChange,
  handleModeSwitch,
  handleLoginSubmit,
  handleRegisterSubmit,
  handleGoogleAuth,
  handleFacebookAuth,
  handleDiscordAuth,
  handleSwitchToForgotPassword,
  handleForgotPasswordSubmit,
  handleForgotPasswordRetry,
  forgotPasswordSuccess = false,
  cooldownSeconds = 0,
  canRetry = false,
}: AuthFormContentProps) {
  return (
    <>
      {/* Error Messages */}
      <AnimatePresence mode="wait">
        {(submitError || emailError || emailCheckError) && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            {submitError || emailError || emailCheckError}
          </div>
        )}
      </AnimatePresence>

      {/* Email Input */}
      {mode === 'email' && (
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/60 mb-2.5"
          >
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors group-focus-within:text-purple-400">
              <svg
                className="w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors"
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
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailCheck}
              onKeyDown={handleEmailKeyDown}
              disabled={isLoading || isChecking}
              error={!!emailError}
              autoFocus={mode === 'email'}
              aria-label="Email address"
              className="pl-12"
            />
            {isChecking && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* OR Divider with Continue Button (only shown in email mode) */}
      {mode === 'email' && (
        <div className="mb-4">
          {/* Top divider line */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          
          {/* Continue Button - Gradient */}
          <button
            type="button"
            onClick={handleEmailCheck}
            disabled={!email || isChecking || isLoading}
            className="relative w-full h-14 rounded-2xl font-semibold text-[15px] text-white overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group mb-4"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 transition-opacity group-hover:opacity-90" />
            {/* Shimmer effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isChecking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  Continue
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          {/* Bottom divider with "OR" text */}
          <div className="flex items-center gap-4 py-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs font-medium text-white/25 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      )}

      {/* Form Steps */}
      <AnimatePresence mode="wait">
        {mode === 'email' && (
          <div className="space-y-4">
            {/* Social Login Buttons */}
            <EmailStep
              onEmailCheck={handleEmailCheck}
              isLoading={isLoading}
              isChecking={isChecking}
              onGoogleAuth={handleGoogleAuth}
              onFacebookAuth={handleFacebookAuth}
              onDiscordAuth={handleDiscordAuth}
            />
          </div>
        )}

        {mode === 'login' && (
          <LoginForm
            email={email}
            loginData={loginData}
            onLoginChange={handleLoginChange}
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            onGoogleAuth={handleGoogleAuth}
            onFacebookAuth={handleFacebookAuth}
            onDiscordAuth={handleDiscordAuth}
            onSwitchToRegister={() => handleModeSwitch('register')}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            email={email}
            registerData={registerData}
            onRegisterChange={handleRegisterChange}
            onSubmit={handleRegisterSubmit}
            isLoading={isLoading}
            onGoogleAuth={handleGoogleAuth}
            onSwitchToLogin={() => handleModeSwitch('login')}
          />
        )}

        {mode === 'forgot-password' && handleForgotPasswordSubmit && (
          <ForgotPasswordForm
            email={email}
            onEmailChange={handleEmailChange}
            onSubmit={handleForgotPasswordSubmit}
            isLoading={isLoading}
            error={submitError}
            success={forgotPasswordSuccess}
            onSwitchToLogin={() => handleModeSwitch('login')}
            onRetry={handleForgotPasswordRetry || (() => {})}
            canRetry={canRetry}
            cooldownSeconds={cooldownSeconds}
          />
        )}
      </AnimatePresence>

      {/* Footer - Terms & Privacy */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <p className="text-xs text-white/30 text-center leading-relaxed">
          By proceeding, you agree to our{' '}
          <Link
            href="/terms"
            className="text-purple-400/80 hover:text-purple-300 transition-colors"
          >
            Terms of use
          </Link>
          {' '}and{' '}
          <Link
            href="/privacy"
            className="text-purple-400/80 hover:text-purple-300 transition-colors"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </>
  );
}
