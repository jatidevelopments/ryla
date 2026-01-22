'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthFlow } from '../../app/auth/hooks';
import { AuthFormContent } from '../../app/auth/components';
import { fadeIn } from '../../app/auth/constants';

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

function AuthModalContent() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formHeight, setFormHeight] = useState(0);

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
    handleFacebookAuth,
    handleDiscordAuth,
    handleSwitchToForgotPassword,
    handleForgotPasswordSubmit,
    handleForgotPasswordRetry,
    forgotPasswordSuccess,
    cooldownSeconds,
    canRetry,
    loginData,
    registerData,
  } = useAuthFlow();

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
  }, [mode]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />

      {/* Animated gradient orbs in background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[900px] mx-4 lg:mx-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col lg:flex-row items-stretch justify-center"
        >
          {/* Left Column - Auth Form */}
          <div className="w-full lg:w-[480px]" ref={formRef}>
            {/* Auth Modal Card */}
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
                      Welcome to RYLA
                    </h1>
                    <p className="text-white/50 text-base mt-2">
                      Create stunning AI influencers
                    </p>
                  </div>

                  <AuthFormContent
                    mode={mode}
                    email={email}
                    emailError={emailError}
                    isLoading={isLoading}
                    isChecking={isChecking}
                    submitError={submitError}
                    emailCheckError={emailCheckError}
                    loginData={loginData}
                    registerData={registerData}
                    handleEmailChange={handleEmailChange}
                    handleEmailCheck={handleEmailCheck}
                    handleEmailKeyDown={handleEmailKeyDown}
                    handleLoginChange={handleLoginChange}
                    handleRegisterChange={handleRegisterChange}
                    handleModeSwitch={handleModeSwitch}
                    handleLoginSubmit={handleLoginSubmit}
                    handleRegisterSubmit={handleRegisterSubmit}
                    handleGoogleAuth={handleGoogleAuth}
                    handleFacebookAuth={handleFacebookAuth}
                    handleDiscordAuth={handleDiscordAuth}
                    handleSwitchToForgotPassword={handleSwitchToForgotPassword}
                    handleForgotPasswordSubmit={handleForgotPasswordSubmit}
                    handleForgotPasswordRetry={handleForgotPasswordRetry}
                    forgotPasswordSuccess={forgotPasswordSuccess}
                    cooldownSeconds={cooldownSeconds}
                    canRetry={canRetry}
                  />
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

export function AuthModal() {
  return (
    <Suspense>
      <AuthModalContent />
    </Suspense>
  );
}
