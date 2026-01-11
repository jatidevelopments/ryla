'use client';

import {} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RylaInput } from '@ryla/ui';
import { useAuthFlow } from './hooks';
import { EmailStep, LoginForm, RegisterForm } from './components';
import { fadeIn } from './constants';

import { Suspense } from 'react';

function AuthContent() {
  const {
    mode,
    email,
    emailError,
    isLoading,
    isChecking,
    submitError,
    emailCheckError,
    handleEmailChange,
    handleEmailCheck,
    handleEmailKeyDown,
    handleLoginChange,
    handleRegisterChange,
    handleModeSwitch,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleGoogleAuth,
    loginData,
    registerData,
  } = useAuthFlow();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0b]">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orb */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float 15s ease-in-out infinite',
          }}
        />
        {/* Secondary gradient orb */}
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float 18s ease-in-out infinite reverse',
          }}
        />
        {/* Tertiary accent */}
        <div
          className="absolute top-[40%] right-[20%] w-[30%] h-[30%] opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
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
              {mode === 'email' &&
                'Start creating AI influencers that earn 24/7'}
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
                background:
                  'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
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

              {/* Form Steps */}
              <AnimatePresence mode="wait">
                {mode === 'email' && (
                  <EmailStep
                    email={email}
                    onEmailCheck={handleEmailCheck}
                    isLoading={isLoading}
                    isChecking={isChecking}
                    onGoogleAuth={handleGoogleAuth}
                  />
                )}

                {mode === 'login' && (
                  <LoginForm
                    loginData={loginData}
                    onLoginChange={handleLoginChange}
                    onSubmit={handleLoginSubmit}
                    isLoading={isLoading}
                    onGoogleAuth={handleGoogleAuth}
                    onSwitchToRegister={() => handleModeSwitch('register')}
                  />
                )}

                {mode === 'register' && (
                  <RegisterForm
                    registerData={registerData}
                    onRegisterChange={handleRegisterChange}
                    onSubmit={handleRegisterSubmit}
                    isLoading={isLoading}
                    onGoogleAuth={handleGoogleAuth}
                    onSwitchToLogin={() => handleModeSwitch('login')}
                  />
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
          0%,
          100% {
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

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
