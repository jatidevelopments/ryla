'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Tooltip({ content, children, className, delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setPosition(null);
  };

  // Calculate position after tooltip is rendered
  React.useLayoutEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Position above the trigger element
      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
      
      // If tooltip would go off the top of the screen, position it below
      if (top < 8) {
        top = triggerRect.bottom + 8;
      }
      
      // Keep tooltip within horizontal bounds
      if (left < 8) {
        left = 8;
      } else if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      
      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>
      {mounted && isVisible && createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-[9999] px-3 py-2 bg-[#1a1a1d] border border-white/10 rounded-lg shadow-xl',
            'text-xs text-white/90 max-w-[280px] pointer-events-none',
            'transition-opacity duration-150',
            position ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{ 
            top: position?.top ?? -9999, 
            left: position?.left ?? -9999 
          }}
        >
          {content}
          {/* Arrow */}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1d]"
            style={{ marginTop: '-1px' }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
