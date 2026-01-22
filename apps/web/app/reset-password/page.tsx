'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RylaInput } from '@ryla/ui';
import { resetPassword } from '@/lib/auth';
import { routes } from '@/lib/routes';
import { fadeIn } from '../auth/constants';

// Promotional images from existing assets (SFW only - bikini/beach/professional)
const PROMO_IMAGES = [
  '/poses/expressive-laughing.webp',
  '/templates/beach/poolside-luxury.webp',
  '/templates/trending/clean-girl-aesthetic.webp',
  '/templates/professional/boss-mode-office.webp',
  '/templates/beginner/golden-hour-magic.webp',
];

// Promotional Image Carousel Component
function PromotionalImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_IMAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Images */}
      {PROMO_IMAGES.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`RYLA AI Influencer ${index + 1}`}
          fill
          className={`object-cover transition-opacity duration-1000 ${
            currentIndex === index ? 'opacity-100' : 'opacity-0'
          }`}
          priority={index === 0}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#12121A]/40 to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex items-center gap-3 mb-3">
          <Image
            src="/logos/ryla_small_logo_new.png"
            alt="RYLA"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl"
          />
          <div>
            <p className="text-white/90 font-semibold text-sm">RYLA AI</p>
            <p className="text-white/50 text-xs">Powered by AI</p>
          </div>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">
          Create stunning AI influencers
        </h3>
        <p className="text-white/60 text-sm">
          Generate unlimited content that looks 100% real
        </p>

        {/* Carousel indicators */}
        <div className="flex gap-1.5 mt-4">
          {PROMO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(0);

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Measure form height to match image panel
  useEffect(() => {
    if (formRef.current) {
      const updateHeight = () => {
        setFormHeight(formRef.current?.offsetHeight || 0);
      };
      updateHeight();
      const observer = new ResizeObserver(updateHeight);
      observer.observe(formRef.current);
      return () => observer.disconnect();
    }
  }, [success]);

  // Check if token is missing
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  // Validate password strength
  const isPasswordValid = (pwd: string): boolean => {
    if (pwd.length < 8) return false;
    if (!/[a-z]/.test(pwd)) return false;
    if (!/[0-9]/.test(pwd)) return false;
    return true;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(null);
    setError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordError(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    // Validate token
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (!isPasswordValid(password)) {
      setPasswordError(
        'Password must be at least 8 characters with a lowercase letter and number'
      );
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, password });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(routes.auth);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0b]">
        {/* Animated background gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, transparent 60%)',
              filter: 'blur(60px)',
              animation: 'float 12s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 60%)',
              filter: 'blur(60px)',
              animation: 'float 15s ease-in-out infinite reverse',
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[900px] mx-4 lg:mx-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex flex-col lg:flex-row items-stretch justify-center"
          >
            <div className="w-full lg:w-[480px]">
              <div className="relative h-full overflow-hidden">
                <div
                  className="absolute -inset-[1px] rounded-[28px] lg:rounded-r-none opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(168, 85, 247, 0.3) 100%)',
                  }}
                />
                <div className="relative h-full bg-[#12121A] rounded-[28px] lg:rounded-r-none border border-white/[0.08] backdrop-blur-xl p-8 lg:p-10">
                  <div className="mb-8">
                    <Link href="/" className="inline-block mb-6">
                      <Image
                        src="/logos/Ryla_Logo_white.png"
                        alt="RYLA"
                        width={100}
                        height={32}
                        className="h-8 w-auto transition-all duration-300 hover:scale-105 hover:opacity-90"
                        priority
                      />
                    </Link>
                    <h1 className="text-[32px] lg:text-[36px] font-bold text-white leading-tight">
                      Password Reset Successful
                    </h1>
                  </div>

                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 mb-6">
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
                          Password Updated
                        </h3>
                        <p className="text-sm text-white/70">
                          Your password has been successfully reset. Redirecting to login...
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={routes.auth}
                    className="block w-full text-center py-3 px-4 rounded-2xl font-semibold text-[15px] text-white bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Promotional Image (Desktop Only) */}
            <div
              className="hidden lg:block lg:w-[440px]"
              style={{ height: formHeight > 0 ? formHeight : 'auto' }}
            >
              <div className="relative w-full h-full overflow-hidden">
                <div
                  className="absolute -inset-[1px] rounded-r-[28px] opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(236, 72, 153, 0.2) 100%)',
                  }}
                />
                <div className="relative w-full h-full rounded-r-[28px] overflow-hidden border-y border-r border-white/[0.08]">
                  <PromotionalImageCarousel />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0b]">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 60%)',
            filter: 'blur(60px)',
            animation: 'float 15s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute top-[30%] right-[15%] w-[25%] h-[25%] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 60%)',
            filter: 'blur(50px)',
            animation: 'float 10s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[900px] mx-4 lg:mx-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col lg:flex-row items-stretch justify-center"
        >
          {/* Left Column - Reset Password Form */}
          <div className="w-full lg:w-[480px]" ref={formRef}>
            <div className="relative h-full overflow-hidden">
              {/* Card glow effect */}
              <div
                className="absolute -inset-[1px] rounded-[28px] lg:rounded-r-none opacity-60"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(168, 85, 247, 0.3) 100%)',
                }}
              />

              <div className="relative h-full bg-[#12121A] rounded-[28px] lg:rounded-r-none border border-white/[0.08] backdrop-blur-xl">
                <div className="p-8 lg:p-10">
                  {/* RYLA Logo */}
                  <div className="mb-8">
                    <Link href="/" className="inline-block mb-6">
                      <Image
                        src="/logos/Ryla_Logo_white.png"
                        alt="RYLA"
                        width={100}
                        height={32}
                        className="h-8 w-auto transition-all duration-300 hover:scale-105 hover:opacity-90"
                        priority
                      />
                    </Link>
                    <h1 className="text-[32px] lg:text-[36px] font-bold text-white leading-tight">
                      Reset Your Password
                    </h1>
                    <p className="text-white/50 text-base mt-2">
                      Enter your new password below
                    </p>
                  </div>

                  {/* Error Messages */}
                  {(error || passwordError) && (
                    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      {error || passwordError}
                    </div>
                  )}

                  {/* Reset Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-white/70 mb-2"
                      >
                        New Password
                      </label>
                      <RylaInput
                        id="password"
                        type="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        disabled={isLoading || !token}
                        autoFocus
                        aria-label="New password"
                      />
                      <p className="mt-2 text-xs text-white/40">
                        Must be at least 8 characters with a lowercase letter and number
                      </p>
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
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        disabled={isLoading || !token}
                        aria-label="Confirm password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="relative w-full h-14 rounded-2xl font-semibold text-[15px] text-white overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 transition-opacity group-hover:opacity-90" />
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                      {/* Button content */}
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Resetting...</span>
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </span>
                    </button>

                    <div className="text-center">
                      <Link
                        href={routes.auth}
                        className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Back to Sign In
                      </Link>
                    </div>
                  </form>

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
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Promotional Image (Desktop Only) */}
          <div
            className="hidden lg:block lg:w-[440px]"
            style={{ height: formHeight > 0 ? formHeight : 'auto' }}
          >
            <div className="relative w-full h-full overflow-hidden">
              {/* Border glow effect matching left side */}
              <div
                className="absolute -inset-[1px] rounded-r-[28px] opacity-60"
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(236, 72, 153, 0.2) 100%)',
                }}
              />
              <div className="relative w-full h-full rounded-r-[28px] overflow-hidden border-y border-r border-white/[0.08]">
                <PromotionalImageCarousel />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3%, 3%); }
          50% { transform: translate(0, 6%); }
          75% { transform: translate(-3%, 3%); }
        }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
        <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
