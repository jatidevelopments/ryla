"use client";

import { useEffect, useRef, useState } from "react";
import { Section } from "@/components/ryla-ui";
import { cn } from "@/lib/utils";

interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const stats: Stat[] = [
  {
    value: 10000,
    suffix: "+",
    label: "Creators",
  },
  {
    value: 1000000,
    suffix: "+",
    label: "Images Generated",
  },
  {
    value: 500000,
    prefix: "$",
    suffix: "+",
    label: "Earnings Paid",
  },
];

/**
 * Formats a number with compact notation (10K, 1M, etc.)
 */
function formatCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

/**
 * AnimatedNumber - Clean animated number with count-up effect
 */
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          
          // Animate the number
          const duration = 2000;
          const startTime = performance.now();
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-expo)
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            setDisplayValue(Math.floor(eased * value));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  const formattedValue = formatCompact(displayValue);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

/**
 * StatsSection Component
 * 
 * Clean, minimal stats display with animated numbers.
 */
export function StatsSection() {
  return (
    <Section background="default" className="py-8 md:py-12 bg-transparent">
      <div className="max-w-5xl mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                "relative flex flex-col items-center text-center",
                // Divider between items
                index < stats.length - 1 &&
                  "after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:h-10 after:w-px after:bg-gradient-to-b after:from-transparent after:via-white/20 after:to-transparent"
              )}
            >
              {/* Number */}
              <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-1">
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </div>

              {/* Label */}
              <p className="text-xs md:text-sm text-white/40 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export default StatsSection;
