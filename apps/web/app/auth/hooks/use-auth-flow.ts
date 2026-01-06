'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { useEmailCheck } from '../../../lib/hooks/use-email-check';
import { login, register } from '../../../lib/auth';
import type { AuthMode, LoginFormData, RegisterFormData } from '../constants';

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated: isAuthenticatedContext, isLoading: authLoading } = useAuth();
  const { checkEmail, isChecking, error: emailCheckError, clearError } = useEmailCheck();

  // Get initial mode from URL or default to 'email'
  const initialMode = (searchParams.get('mode') as AuthMode) || 'email';
  const [mode, setMode] = useState<AuthMode>(
    initialMode === 'login' || initialMode === 'register' ? initialMode : 'email'
  );
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Form data
  const [loginData, setLoginData] = useState<LoginFormData>({
    password: '',
    rememberMe: false,
  });
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    publicName: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticatedContext) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [authLoading, isAuthenticatedContext, router, searchParams]);

  // Handle URL mode parameter
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'login' && email) {
      setMode('login');
      setEmailExists(true);
    } else if (urlMode === 'register' && email) {
      setMode('register');
      setEmailExists(false);
    }
  }, [searchParams, email]);

  // Validate email format
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Handle email input change
  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setEmailError(null);
    clearError();

    // Reset mode if email is cleared
    if (!value) {
      setMode('email');
      setEmailExists(null);
    }
  }, [clearError]);

  // Handle email check (on blur or Enter key)
  const handleEmailCheck = useCallback(async () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError(null);
    const exists = await checkEmail(email);

    if (exists !== null) {
      setEmailExists(exists);
      setMode(exists ? 'login' : 'register');
    }
  }, [email, isValidEmail, checkEmail]);

  // Handle email input key press
  const handleEmailKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && isValidEmail(email)) {
        handleEmailCheck();
      }
    },
    [email, isValidEmail, handleEmailCheck]
  );

  // Handle login form change
  const handleLoginChange = useCallback(
    (field: keyof LoginFormData, value: string | boolean) => {
      setLoginData((prev) => ({ ...prev, [field]: value }));
      setSubmitError(null);
    },
    []
  );

  // Handle registration form change
  const handleRegisterChange = useCallback(
    (field: keyof RegisterFormData, value: string | boolean) => {
      setRegisterData((prev) => ({ ...prev, [field]: value }));
      setSubmitError(null);
    },
    []
  );

  // Handle mode switching
  const handleModeSwitch = useCallback((newMode: 'login' | 'register') => {
    setMode(newMode);
    setEmailExists(newMode === 'login');
    setSubmitError(null);
  }, []);

  // Handle login submit
  const handleLoginSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      if (!email || !loginData.password) {
        setSubmitError('Please fill in all fields');
        return;
      }

      setIsLoading(true);

      try {
        await login({ email, password: loginData.password });
        await refreshUser();
        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        router.push(returnUrl);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setIsLoading(false);
      }
    },
    [email, loginData.password, refreshUser, router, searchParams]
  );

  // Handle registration submit
  const handleRegisterSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Validate passwords match
      if (registerData.password !== registerData.confirmPassword) {
        setSubmitError('Passwords do not match');
        return;
      }

      // Validate password strength
      const { isPasswordValid } = await import(
        '../../../components/password-strength'
      );
      if (!isPasswordValid(registerData.password)) {
        setSubmitError(
          'Password must be at least 8 characters with a lowercase letter and number'
        );
        return;
      }

      if (!registerData.acceptedTerms) {
        setSubmitError('You must accept the Terms of Service');
        return;
      }

      setIsLoading(true);

      try {
        await register({
          email,
          password: registerData.password,
          name: registerData.name,
          publicName: registerData.publicName,
        });
        await refreshUser();
        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        router.push(returnUrl);
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : 'Registration failed'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, registerData, refreshUser, router, searchParams]
  );

  // Handle Google OAuth (placeholder)
  const handleGoogleAuth = useCallback(() => {
    // TODO: Implement Google OAuth
    setSubmitError('Google authentication coming soon');
  }, []);

  return {
    // State
    mode,
    email,
    emailExists,
    emailError,
    loginData,
    registerData,
    isLoading,
    isChecking,
    submitError,
    emailCheckError,
    authLoading,
    isAuthenticated: isAuthenticatedContext,

    // Handlers
    handleEmailChange,
    handleEmailCheck,
    handleEmailKeyDown,
    handleLoginChange,
    handleRegisterChange,
    handleModeSwitch,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleGoogleAuth,
  };
}

