'use client';

import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className }: MeteorsProps) {
  const [meteors, setMeteors] = useState<
    Array<{ id: number; left: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    const newMeteors = Array.from({ length: number }, (_, i) => ({
      id: i,
      left: Math.floor(Math.random() * (400 - -400) + -400),
      delay: Math.random() * (0.8 - 0.2) + 0.2,
      duration: Math.random() * (10 - 2) + 2,
    }));
    setMeteors(newMeteors);
  }, [number]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          className="absolute top-0 h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]"
          style={{
            left: meteor.left + 'px',
            top: '-50px',
          }}
          animate={{
            translateY: [0, 300],
            translateX: [0, meteor.left],
            opacity: [1, 0],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            repeatType: 'loop',
            repeatDelay: Math.random() * (80 - 20) + 20,
          }}
        />
      ))}
    </div>
  );
}

export default Meteors;
