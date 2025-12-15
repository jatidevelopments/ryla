"use client";

import { useRef } from "react";
import { SectionHeader } from "@/components/ryla-ui";
import { FadeInUp } from "@/components/animations";
import { cn } from "@/lib/utils";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { Star, TrendingUp, DollarSign } from "lucide-react";

type Platform = "instagram" | "tiktok" | "fanvue" | "onlyfans";

interface Testimonial {
  quote: string;
  name: string;
  earnings: string;
  platform: Platform;
  rating: number;
  highlight?: string;
}

// Expanded testimonials with more detail
const testimonialsRowA: Testimonial[] = [
  {
    quote: "Character consistency is absolutely unreal. Same face across 100+ posts.",
    name: "Sarah M.",
    earnings: "$5.2K/mo",
    platform: "fanvue",
    rating: 5,
    highlight: "5.2K",
  },
  {
    quote: "My followers genuinely can't tell she's AI. The engagement is insane.",
    name: "Jake T.",
    earnings: "$8.1K/mo",
    platform: "onlyfans",
    rating: 5,
    highlight: "8.1K",
  },
  {
    quote: "The courses helped me find my niche. Made ROI in the first week.",
    name: "Maria L.",
    earnings: "$10K in 3mo",
    platform: "instagram",
    rating: 5,
    highlight: "10K",
  },
  {
    quote: "Went from 0 to 15K followers in 2 months. The viral prompts work.",
    name: "Alex R.",
    earnings: "$3.8K/mo",
    platform: "tiktok",
    rating: 5,
    highlight: "15K",
  },
  {
    quote: "Best investment I've made. My AI influencer runs while I sleep.",
    name: "Emma K.",
    earnings: "$12K/mo",
    platform: "fanvue",
    rating: 5,
    highlight: "12K",
  },
];

const testimonialsRowB: Testimonial[] = [
  {
    quote: "The hyper-realistic skin is what sold me. No uncanny valley here.",
    name: "Chris D.",
    earnings: "$4.5K/mo",
    platform: "onlyfans",
    rating: 5,
    highlight: "4.5K",
  },
  {
    quote: "Switched from manual posting. Now I schedule a week in advance.",
    name: "Nina P.",
    earnings: "$6.7K/mo",
    platform: "instagram",
    rating: 5,
    highlight: "6.7K",
  },
  {
    quote: "Community support is incredible. Got advice that doubled my income.",
    name: "Marcus J.",
    earnings: "$9.2K/mo",
    platform: "tiktok",
    rating: 5,
    highlight: "9.2K",
  },
  {
    quote: "Perfect hands, perfect everything. No more awkward AI artifacts.",
    name: "Lisa W.",
    earnings: "$7.3K/mo",
    platform: "fanvue",
    rating: 5,
    highlight: "7.3K",
  },
  {
    quote: "Three AI influencers, three income streams. This is the future.",
    name: "David K.",
    earnings: "$22K/mo",
    platform: "onlyfans",
    rating: 5,
    highlight: "22K",
  },
];

// Platform badge component
const platformConfig: Record<Platform, { color: string; label: string }> = {
  instagram: { color: "from-purple-500 to-pink-500", label: "IG" },
  tiktok: { color: "from-gray-700 to-black", label: "TT" },
  fanvue: { color: "from-blue-500 to-purple-600", label: "FV" },
  onlyfans: { color: "from-sky-400 to-blue-500", label: "OF" },
};

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

function RichTestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const platform = platformConfig[testimonial.platform];

  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-[340px] p-5 rounded-2xl overflow-hidden",
        // Glassmorphism
        "bg-white/[0.03] backdrop-blur-md",
        "border border-white/10",
        // Hover
        "hover:bg-white/[0.06] hover:border-white/20",
        "transition-all duration-300",
        className
      )}
    >
      {/* Subtle glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Avatar, Name, Platform Badge */}
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar with initial */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
          {testimonial.name.charAt(0)}
        </div>

        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{testimonial.name}</p>
          {/* Stars */}
          <div className="flex gap-0.5">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* Platform badge */}
        <div
          className={cn(
            "px-2 py-1 rounded-md text-xs font-bold text-white",
            "bg-gradient-to-r",
            platform.color
          )}
        >
          {platform.label}
        </div>
      </div>

      {/* Quote */}
      <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
        "{testimonial.quote}"
      </p>

      {/* Earnings highlight */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wide">Earning</p>
          <p className="text-lg font-bold text-green-400">{testimonial.earnings}</p>
        </div>
        <TrendingUp className="w-4 h-4 text-green-400 ml-auto" />
      </div>
    </div>
  );
}

// Marquee row component
interface MarqueeRowProps {
  children: React.ReactNode;
  direction?: 1 | -1;
  speed?: number;
  className?: string;
}

function MarqueeRow({ children, direction = 1, speed = 20, className }: MarqueeRowProps) {
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  };

  useAnimationFrame((_, delta) => {
    const moveBy = direction * speed * (delta / 1000);
    baseX.set(wrap(-50, 0, baseX.get() + moveBy));
  });

  return (
    <div ref={containerRef} className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex gap-6"
        style={{ x: baseX.get() !== 0 ? `${baseX.get()}%` : "0%" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

// Proper marquee with animation
function AnimatedMarqueeRow({ children, direction = 1, speed = 30, className }: MarqueeRowProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex gap-6"
        animate={{
          x: direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/**
 * TestimonialsSection Component
 *
 * Infinite scrolling marquee with rich testimonial cards.
 * Two rows scrolling in opposite directions.
 */
export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-20 md:py-28 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <FadeInUp>
          <SectionHeader
            title="Trusted by creators worldwide."
            titleHighlight="creators"
            subtitle="Real results from real creators building passive income."
          />
        </FadeInUp>
      </div>

      {/* Marquee container - full width */}
      <div className="mt-16 space-y-6">
        {/* Row 1: Scrolling left */}
        <AnimatedMarqueeRow direction={-1} speed={40}>
          {testimonialsRowA.map((testimonial, idx) => (
            <RichTestimonialCard key={`a-${idx}`} testimonial={testimonial} />
          ))}
        </AnimatedMarqueeRow>

        {/* Row 2: Scrolling right */}
        <AnimatedMarqueeRow direction={1} speed={35}>
          {testimonialsRowB.map((testimonial, idx) => (
            <RichTestimonialCard key={`b-${idx}`} testimonial={testimonial} />
          ))}
        </AnimatedMarqueeRow>
      </div>

      {/* Fade edges - positioned relative to section */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-transparent to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-transparent to-transparent z-10" />
    </section>
  );
}

export default TestimonialsSection;
