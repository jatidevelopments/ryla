'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RylaInput, RylaCheckbox } from '@ryla/ui';
import { PasswordStrength, isPasswordValid } from '../../../components/password-strength';
import { GoogleButton } from './google-button';
import { PrimaryButton } from './primary-button';
import { slideIn } from '../constants';

interface RegisterFormData {
  name: string;
  publicName: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

interface RegisterFormProps {
  registerData: RegisterFormData;
  onRegisterChange: (field: keyof RegisterFormData, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onGoogleAuth: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  registerData,
  onRegisterChange,
  onSubmit,
  isLoading,
  onGoogleAuth,
  onSwitchToLogin,
}: RegisterFormProps) {
  const passwordsMatch =
    registerData.password &&
    registerData.confirmPassword &&
    registerData.password === registerData.confirmPassword;
  const passwordsDontMatch =
    registerData.confirmPassword &&
    registerData.password !== registerData.confirmPassword;

  return (
    <motion.form
      key="register-form"
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={onSubmit}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white/70 mb-2"
          >
            Full Name
          </label>
          <RylaInput
            id="name"
            type="text"
            placeholder="John Doe"
            value={registerData.name}
            onChange={(e) => onRegisterChange('name', e.target.value)}
            disabled={isLoading}
            autoFocus
            aria-label="Full name"
          />
        </div>
        <div>
          <label
            htmlFor="publicName"
            className="block text-sm font-medium text-white/70 mb-2"
          >
            Username
          </label>
          <RylaInput
            id="publicName"
            type="text"
            placeholder="johndoe"
            value={registerData.publicName}
            onChange={(e) => onRegisterChange('publicName', e.target.value)}
            disabled={isLoading}
            aria-label="Username"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-white/70 mb-2"
        >
          Password
        </label>
        <RylaInput
          id="register-password"
          type="password"
          placeholder="Create a strong password"
          value={registerData.password}
          onChange={(e) => onRegisterChange('password', e.target.value)}
          disabled={isLoading}
          aria-label="Password"
        />
        <PasswordStrength password={registerData.password} className="mt-3" />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-white/70 mb-2"
        >
          Confirm Password
        </label>
        <RylaInput
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={registerData.confirmPassword}
          onChange={(e) => onRegisterChange('confirmPassword', e.target.value)}
          disabled={isLoading}
          error={passwordsDontMatch}
          success={passwordsMatch}
          aria-label="Confirm password"
        />
        {registerData.confirmPassword && (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium">
            {passwordsMatch ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-emerald-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-emerald-400">Passwords match</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 text-red-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-400">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      <RylaCheckbox
        id="acceptedTerms"
        checked={registerData.acceptedTerms}
        onChange={(checked) => onRegisterChange('acceptedTerms', checked)}
        disabled={isLoading}
      >
        I agree to the{' '}
        <Link
          href="/terms"
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/privacy"
          className="text-purple-400 hover:text-purple-300 transition-colors"
        >
          Privacy Policy
        </Link>
      </RylaCheckbox>

      <PrimaryButton type="submit" disabled={isLoading} loading={isLoading}>
        Create Account
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
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
        >
          Sign in
        </button>
      </p>
    </motion.form>
  );
}

