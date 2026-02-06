'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const STAR_COUNT = 54;
const COLUMNS = 9;

export function GlowingStarsBackgroundCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [mouseEnter, setMouseEnter] = useState(false);
  const [glowingStars, setGlowingStars] = useState<number[]>([]);
  const highlightedRef = useRef<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      highlightedRef.current = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * STAR_COUNT)
      );
      setGlowingStars([...highlightedRef.current]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onMouseEnter={() => setMouseEnter(true)}
      onMouseLeave={() => setMouseEnter(false)}
      className={cn(
        'relative h-full w-full overflow-hidden rounded-3xl border border-[var(--nel-border)] bg-[var(--nel-surface)] p-8',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
          gridAutoRows: 'minmax(12px, 1fr)',
        }}
        aria-hidden
      >
        {[...Array(STAR_COUNT)].map((_, starIdx) => {
          const isGlowing = glowingStars.includes(starIdx) || mouseEnter;
          const delay = (starIdx % 10) * 0.05;
          return (
            <motion.div
              key={starIdx}
              className="flex items-center justify-center"
              initial={false}
              animate={{
                scale: isGlowing ? 1.4 : 0.6,
                opacity: isGlowing ? 0.9 : 0.2,
              }}
              transition={{ duration: 0.4, delay: delay * 0.1 }}
            >
              <div
                className="h-1 w-1 rounded-full bg-[var(--nel-accent)]"
                style={{
                  boxShadow: isGlowing
                    ? `0 0 8px 2px rgba(6, 182, 212, 0.5)`
                    : 'none',
                }}
              />
            </motion.div>
          );
        })}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
