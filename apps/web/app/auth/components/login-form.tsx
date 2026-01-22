'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RylaInput, RylaCheckbox } from '@ryla/ui';
import { GoogleButton } from './google-button';
import { FacebookButton } from './facebook-button';
import { DiscordButton } from './discord-button';
import { PrimaryButton } from './primary-button';
import { slideIn } from '../constants';
import { routes } from '@/lib/routes';

interface LoginFormData {
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  email: string;
  loginData: LoginFormData;
  onLoginChange: (field: keyof LoginFormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onGoogleAuth: () => void;
  onFacebookAuth?: () => void;
  onDiscordAuth?: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword?: () => void;
}

export function LoginForm({
  email,
  loginData,
  onLoginChange,
  onSubmit,
  isLoading,
  onGoogleAuth,
  onFacebookAuth,
  onDiscordAuth,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginFormProps) {
  return (
    <motion.form
      key="login-form"
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={onSubmit}
      className="space-y-6"
    >
      {/* Email Display (Read-only) */}
      <div>
        <label
          htmlFor="email-display"
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
            id="email-display"
            type="email"
            value={email}
            disabled
            readOnly
            className="pl-12 bg-white/5 cursor-not-allowed"
            aria-label="Email address"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white/70 mb-2"
        >
          Password
        </label>
        <RylaInput
          id="password"
          type="password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={(e) => onLoginChange('password', e.target.value)}
          disabled={isLoading}
          autoFocus
          aria-label="Password"
        />
      </div>

      <div className="flex items-center justify-between">
        <RylaCheckbox
          id="rememberMe"
          checked={loginData.rememberMe}
          onChange={(checked) => onLoginChange('rememberMe', checked)}
          disabled={isLoading}
        >
          Remember me
        </RylaCheckbox>
        <button
          type="button"
          onClick={onSwitchToForgotPassword}
          className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <PrimaryButton type="submit" disabled={isLoading} loading={isLoading}>
        Sign In
      </PrimaryButton>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs font-medium text-white/25 uppercase tracking-wider">
          or
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="space-y-2.5">
        <GoogleButton onClick={onGoogleAuth} disabled={isLoading} />
        <FacebookButton onClick={onFacebookAuth || (() => {})} disabled={isLoading} />
        <DiscordButton onClick={onDiscordAuth || (() => {})} disabled={isLoading} />
      </div>

      <p className="text-center text-sm text-white/50">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
        >
          Sign up
        </button>
      </p>
    </motion.form>
  );
}
