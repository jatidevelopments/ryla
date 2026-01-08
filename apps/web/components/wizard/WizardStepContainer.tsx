'use client';

import * as React from 'react';

interface WizardStepContainerProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Container component for wizard steps
 * Provides consistent layout, title, and styling matching funnel app design
 */
export function WizardStepContainer({
  children,
  title,
  subtitle,
  className = '',
}: WizardStepContainerProps) {
  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <p className="text-white/70 text-sm font-medium mb-1.5 md:mb-2">
          {subtitle}
        </p>
        <h2 className="text-white text-xl md:text-2xl font-bold">{title}</h2>
      </div>

      {/* Content */}
      <div className="w-full max-w-[450px]">{children}</div>
    </div>
  );
}
