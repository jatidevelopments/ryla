'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@ryla/ui';

import { login, register } from '../../lib/auth';
import { useAuth } from '../../lib/auth-context';
import { useEmailCheck } from '../../lib/hooks/use-email-check';
import { PasswordStrength, isPasswordValid } from '../../components/password-strength';

type AuthMode = 'email' | 'login' | 'register';

interface LoginFormData {
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  name: string;
  publicName: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
};

const slideIn = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } },
};

// Custom Input component with Ryla styling
function RylaInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  onBlur,
  onKeyDown,
  disabled,
  error,
  success,
  className,
  autoFocus,
  'aria-label': ariaLabel,
}: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
  className?: string;
  autoFocus?: boolean;
  'aria-label'?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      className={cn(
        'w-full h-14 px-5 rounded-2xl',
        'bg-white/[0.03] backdrop-blur-sm',
        'border-2 transition-all duration-300',
        'text-white placeholder:text-white/30',
        'focus:outline-none focus:ring-0',
        'font-medium text-[15px]',
        disabled && 'opacity-50 cursor-not-allowed',
        error
          ? 'border-red-500/50 focus:border-red-500'
          : success
          ? 'border-emerald-500/50 focus:border-emerald-500'
          : 'border-white/10 focus:border-purple-500/70 hover:border-white/20',
        className
      )}
    />
  );
}

// Checkbox component
function RylaCheckbox({
  id,
  checked,
  onChange,
  disabled,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3 cursor-pointer group',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="relative mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded-md border-2 transition-all duration-200',
            'flex items-center justify-center',
            checked
              ? 'bg-purple-500 border-purple-500'
              : 'border-white/20 group-hover:border-white/40'
          )}
        >
          {checked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-white/60 leading-relaxed">{children}</span>
    </label>
  );
}

// Primary button
function PrimaryButton({
  type,
  onClick,
  disabled,
  loading,
  children,
}: {
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative w-full h-14 rounded-2xl font-bold text-[15px]',
        'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500',
        'text-white shadow-lg shadow-purple-500/25',
        'transition-all duration-300 overflow-hidden',
        'hover:shadow-purple-500/40 hover:scale-[1.02]',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Please wait...</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

// Google button
function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full h-14 rounded-2xl font-semibold text-[15px]',
        'bg-white/[0.03] border-2 border-white/10',
        'text-white/80 backdrop-blur-sm',
        'transition-all duration-300',
        'hover:bg-white/[0.06] hover:border-white/20',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      )}
    >
      <span className="flex items-center justify-center gap-3">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </span>
    </button>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isAuthenticated: isAuthenticatedContext, isLoading: authLoading } = useAuth();
  const { checkEmail, isChecking, error: emailCheckError, clearError } = useEmailCheck();

  // Get initial mode from URL or default to 'email'
  const initialMode = (searchParams.get('mode') as AuthMode) || 'email';
  const [mode, setMode] = useState<AuthMode>(initialMode === 'login' || initialMode === 'register' ? initialMode : 'email');
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
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email input change
  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(null);
    clearError();
    
    // Reset mode if email is cleared
    if (!value) {
      setMode('email');
      setEmailExists(null);
    }
  };

  // Handle email check (on blur or Enter key)
  const handleEmailCheck = async () => {
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
  };

  // Handle email input key press
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValidEmail(email)) {
      handleEmailCheck();
    }
  };

  // Handle login form change
  const handleLoginChange = (field: keyof LoginFormData, value: string | boolean) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  // Handle registration form change
  const handleRegisterChange = (field: keyof RegisterFormData, value: string | boolean) => {
    setRegisterData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  // Handle mode switching
  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setEmailExists(newMode === 'login');
    setSubmitError(null);
  };

  // Handle login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
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
  };

  // Handle registration submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!isPasswordValid(registerData.password)) {
      setSubmitError('Password must be at least 8 characters with a lowercase letter and number');
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
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth (placeholder)
  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    setSubmitError('Google authentication coming soon');
  };

  const passwordsMatch = registerData.password && registerData.confirmPassword && registerData.password === registerData.confirmPassword;
  const passwordsDontMatch = registerData.confirmPassword && registerData.password !== registerData.confirmPassword;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0b]">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orb */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        {/* Secondary gradient orb */}
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float 18s ease-in-out infinite reverse',
          }}
        />
        {/* Tertiary accent */}
        <div
          className="absolute top-[40%] right-[20%] w-[30%] h-[30%] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[440px] mx-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col"
        >
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block mb-6 group">
              <Image
                src="/logos/Ryla_Logo_white.png"
                alt="RYLA"
                width={120}
                height={40}
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              {mode === 'email' && 'Welcome to RYLA'}
              {mode === 'login' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
            </h1>
            <p className="text-white/50 text-lg">
              {mode === 'email' && 'Start creating AI influencers that earn 24/7'}
              {mode === 'login' && 'Sign in to continue to your dashboard'}
              {mode === 'register' && 'Join thousands of creators worldwide'}
            </p>
          </div>

          {/* Auth Card */}
          <div className="relative">
            {/* Card glow effect */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-50 blur-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
              }}
            />

            <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-10">
              {/* Error Messages */}
              <AnimatePresence mode="wait">
                {(submitError || emailError || emailCheckError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
                  >
                    {submitError || emailError || emailCheckError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input - Always Visible */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-white/70 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
                  <RylaInput
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailCheck}
                    onKeyDown={handleEmailKeyDown}
                    disabled={isLoading || isChecking}
                    error={!!emailError}
                    autoFocus={mode === 'email'}
                    aria-label="Email address"
                  />
                  {isChecking && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Continue Button (email mode) */}
              <AnimatePresence mode="wait">
                {mode === 'email' && (
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
                      onClick={handleEmailCheck}
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

                    <GoogleButton onClick={handleGoogleAuth} disabled={isLoading} />
                  </motion.div>
                )}

                {/* Login Form */}
                {mode === 'login' && (
                  <motion.form
                    key="login-form"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={handleLoginSubmit}
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
                        onChange={(e) => handleLoginChange('password', e.target.value)}
                        disabled={isLoading}
                        autoFocus
                        aria-label="Password"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <RylaCheckbox
                        id="rememberMe"
                        checked={loginData.rememberMe}
                        onChange={(checked) => handleLoginChange('rememberMe', checked)}
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

                    <GoogleButton onClick={handleGoogleAuth} disabled={isLoading} />

                    <p className="text-center text-sm text-white/50">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('register')}
                        className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  </motion.form>
                )}

                {/* Registration Form */}
                {mode === 'register' && (
                  <motion.form
                    key="register-form"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={handleRegisterSubmit}
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
                          onChange={(e) => handleRegisterChange('name', e.target.value)}
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
                          onChange={(e) => handleRegisterChange('publicName', e.target.value)}
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
                        onChange={(e) => handleRegisterChange('password', e.target.value)}
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
                        onChange={(e) => handleRegisterChange('confirmPassword', e.target.value)}
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
                      onChange={(checked) => handleRegisterChange('acceptedTerms', checked)}
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

                    <GoogleButton onClick={handleGoogleAuth} disabled={isLoading} />

                    <p className="text-center text-sm text-white/50">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('login')}
                        className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/30">
              By continuing, you agree to RYLA&apos;s{' '}
              <Link
                href="/terms"
                className="text-white/50 hover:text-white/70 transition-colors"
              >
                Terms
              </Link>{' '}
              &{' '}
              <Link
                href="/privacy"
                className="text-white/50 hover:text-white/70 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(5%, 5%);
          }
          50% {
            transform: translate(0, 10%);
          }
          75% {
            transform: translate(-5%, 5%);
          }
        }
      `}</style>
    </div>
  );
}
