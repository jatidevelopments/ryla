'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

interface GoogleGeminiEffectProps {
  title?: string;
  description?: string;
  className?: string;
}

const PATHS = [
  'M 0 80 Q 200 0 400 80 T 800 80',
  'M 0 160 Q 300 80 600 160 T 800 160',
  'M 0 240 Q 250 160 500 240 T 800 240',
  'M 0 320 Q 350 240 700 320 T 800 320',
];

export function GoogleGeminiEffect({
  title = 'Build with NEL',
  description = 'Scroll to see the effect. AI-powered products and growth.',
  className,
}: GoogleGeminiEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const pathProgress1 = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const pathProgress2 = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const pathProgress3 = useTransform(scrollYProgress, [0.4, 0.7], [0, 1]);
  const pathProgress4 = useTransform(scrollYProgress, [0.5, 0.8], [0, 1]);

  return (
    <section
      ref={containerRef}
      className={cn('relative overflow-hidden py-24 md:py-32', className)}
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--nel-text)] md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-[17px] text-[var(--nel-text-secondary)]">
          {description}
        </p>
      </div>
      <div className="relative mx-auto mt-16 max-w-4xl px-6">
        <svg
          className="h-64 w-full md:h-80"
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <motion.path
            d={PATHS[0]}
            stroke="var(--nel-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.6"
            style={{
              pathLength: pathProgress1,
            }}
          />
          <motion.path
            d={PATHS[1]}
            stroke="var(--nel-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.5"
            style={{
              pathLength: pathProgress2,
            }}
          />
          <motion.path
            d={PATHS[2]}
            stroke="var(--nel-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.4"
            style={{
              pathLength: pathProgress3,
            }}
          />
          <motion.path
            d={PATHS[3]}
            stroke="var(--nel-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            strokeOpacity="0.3"
            style={{
              pathLength: pathProgress4,
            }}
          />
        </svg>
      </div>
    </section>
  );
}
