'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Sparkles } from 'lucide-react';

interface LoadingStateProps {
  title?: string;
  message?: string;
  fullPage?: boolean;
  className?: string;
}

/**
 * A premium, mobile-ready loading indicator used across the application.
 * Features a glowing spinner with a centered icon and smooth animations.
 */
export function LoadingState({
  title = 'Loading...',
  message,
  fullPage = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500',
        fullPage ? 'flex-1 min-h-[60vh]' : 'w-full py-12',
        className
      )}
    >
      {/* Animated Spinner Container */}
      <div className="relative mb-8">
        {/* Outer Glow */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
          style={{
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* Rotating Rings */}
        <div className="relative h-20 w-20">
          {/* Static track */}
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />

          {/* Fast outer ring */}
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500"
            style={{ 
              animation: 'spin 0.8s linear infinite',
            }}
          />

          {/* Slower middle ring */}
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-r-pink-500/50"
            style={{ 
              animation: 'spin 1.5s linear infinite reverse',
            }}
          />

          {/* Inner spark icon */}
          <div className="absolute inset-5 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
            <Sparkles 
              className="h-5 w-5 text-purple-400"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-2 max-w-xs transition-all">
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-white/50 leading-relaxed font-medium">
            {message}
          </p>
        )}
      </div>

      {/* Subtle Progress Bar (Decorative) */}
      <div className="mt-8 w-24 h-1 bg-white/5 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-shimmer scale-x-75 origin-left" />
      </div>
    </div>
  );
}
