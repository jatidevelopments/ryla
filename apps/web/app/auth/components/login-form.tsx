'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RylaInput, RylaCheckbox } from '@ryla/ui';
import { GoogleButton } from './google-button';
import { PrimaryButton } from './primary-button';
import { slideIn } from '../constants';

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
  onSwitchToRegister: () => void;
}

export function LoginForm({
  loginData,
  onLoginChange,
  onSubmit,
  isLoading,
  onGoogleAuth,
  onSwitchToRegister,
}: Omit<LoginFormProps, 'email'>) {
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
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <PrimaryButton type="submit" disabled={isLoading} loading={isLoading}>
        Sign In
      </PrimaryButton>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-medium text-white/30 uppercase tracking-wider">
          or
        </span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton onClick={onGoogleAuth} disabled={isLoading} />

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
