'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { useEmailCheck } from '../../../lib/hooks/use-email-check';
import { login, register, requestPasswordReset } from '../../../lib/auth';
import { trpc } from '../../../lib/trpc';
import type { AuthMode, LoginFormData, RegisterFormData } from '../constants';

export function useAuthFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated: isAuthenticatedContext, isLoading: authLoading } = useAuth();
  const { checkEmail, isChecking, error: emailCheckError, clearError } = useEmailCheck();
  const utils = trpc.useUtils();

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
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Forgot password state
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [canRetry, setCanRetry] = useState(false);

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
  const handleModeSwitch = useCallback((newMode: 'login' | 'register' | 'forgot-password') => {
    setMode(newMode);
    if (newMode === 'login') {
      setEmailExists(true);
    } else if (newMode === 'register') {
      setEmailExists(false);
    }
    setSubmitError(null);
    setForgotPasswordSuccess(false);
  }, []);
  
  // Handle switch to forgot password
  const handleSwitchToForgotPassword = useCallback(() => {
    handleModeSwitch('forgot-password');
  }, [handleModeSwitch]);

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
        
        // Invalidate all tRPC queries to refetch with new auth token
        await utils.invalidate();
        
        // Refresh router to ensure all components get updated auth state
        router.refresh();
        
        const returnUrl = searchParams.get('returnUrl') || '/dashboard';
        router.push(returnUrl);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setIsLoading(false);
      }
    },
    [email, loginData.password, refreshUser, router, searchParams, utils]
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
        '../../../components/auth/PasswordStrength'
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
        });
        await refreshUser();
        
        // Invalidate all tRPC queries to refetch with new auth token
        await utils.invalidate();
        
        // Refresh router to ensure all components get updated auth state
        router.refresh();
        
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
    [email, registerData, refreshUser, router, searchParams, utils]
  );

  // Check if OAuth provider is available
  const isOAuthAvailable = useCallback((provider: 'google' | 'facebook' | 'discord'): boolean => {
    if (typeof window === 'undefined') return false;
    
    switch (provider) {
      case 'google':
        return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      case 'facebook':
        return !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      case 'discord':
        return !!process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
      default:
        return false;
    }
  }, []);

  // Handle Google OAuth
  const handleGoogleAuth = useCallback(() => {
    if (!isOAuthAvailable('google')) {
      setSubmitError('Google authentication not available yet');
      return;
    }
    // TODO: Implement Google OAuth
    setSubmitError('Google authentication coming soon');
  }, [isOAuthAvailable]);

  // Handle Facebook OAuth
  const handleFacebookAuth = useCallback(() => {
    if (!isOAuthAvailable('facebook')) {
      setSubmitError('Facebook authentication not available yet');
      return;
    }
    // TODO: Implement Facebook OAuth
    setSubmitError('Facebook authentication coming soon');
  }, [isOAuthAvailable]);

  // Handle Discord OAuth
  const handleDiscordAuth = useCallback(() => {
    if (!isOAuthAvailable('discord')) {
      setSubmitError('Discord authentication not available yet');
      return;
    }
    // TODO: Implement Discord OAuth
    setSubmitError('Discord authentication coming soon');
  }, [isOAuthAvailable]);
  
  // Handle forgot password submit
  const handleForgotPasswordSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      
      if (!email.trim()) {
        setSubmitError('Email is required');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setSubmitError('Please enter a valid email address');
        return;
      }
      
      setIsLoading(true);
      
      try {
        await requestPasswordReset(email);
        setForgotPasswordSuccess(true);
        setCooldownSeconds(60); // 60 second cooldown
        setCanRetry(false);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to send reset email');
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );
  
  // Handle retry forgot password
  const handleForgotPasswordRetry = useCallback(
    async () => {
      if (!canRetry || isLoading) return;
      
      setSubmitError(null);
      setIsLoading(true);
      
      try {
        await requestPasswordReset(email);
        setCooldownSeconds(60); // Reset cooldown
        setCanRetry(false);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : 'Failed to send reset email');
      } finally {
        setIsLoading(false);
      }
    },
    [email, canRetry, isLoading]
  );
  
  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (cooldownSeconds === 0 && forgotPasswordSuccess) {
      setCanRetry(true);
    }
  }, [cooldownSeconds, forgotPasswordSuccess]);

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
    forgotPasswordSuccess,
    cooldownSeconds,
    canRetry,

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
    handleFacebookAuth,
    handleDiscordAuth,
    handleSwitchToForgotPassword,
    handleForgotPasswordSubmit,
    handleForgotPasswordRetry,
  };
}

