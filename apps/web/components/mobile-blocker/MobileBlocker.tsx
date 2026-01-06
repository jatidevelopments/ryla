'use client';

import * as React from 'react';
import Image from 'next/image';

/**
 * Mobile blocker component that displays a message when users access
 * the app on mobile devices, indicating RYLA is currently desktop-only.
 */
export function MobileBlocker({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // Check both viewport width and user agent for better detection
      const isMobileWidth = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isMobileWidth || isMobileUA);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logos/Ryla_Logo_white.png"
              alt="RYLA"
              width={120}
              height={42}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-white/60"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M7 8h10M7 12h10M7 16h6" />
              </svg>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-white">
              Desktop Only
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Currently, RYLA is only available on desktop. Please visit us on a
              computer or tablet to create and manage your AI influencers.
            </p>
          </div>

          {/* Optional: Email signup or link to landing */}
          <div className="pt-4">
            <a
              href="https://ryla.ai"
              className="inline-block text-sm text-white/60 hover:text-white transition-colors underline"
            >
              Visit our website →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

