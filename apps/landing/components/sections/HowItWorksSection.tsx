'use client';

import { useRef } from 'react';
import { Section, SectionHeader } from '@/components/ryla-ui';
import { FadeInUp } from '@/components/animations';
import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Palette,
  Sparkles,
  Share2,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { StripedPattern } from '@/components/ui/striped-pattern';
import { ShinyButton } from '@/components/ui/shiny-button';

interface StorySection {
  step: number;
  title: string;
  story: string;
  highlight: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: {
    image: string;
    caption: string;
  };
}

// The story we tell as users scroll
const storySections: StorySection[] = [
  {
    step: 1,
    title: 'Design',
    story:
      'You start with a vision. Pick from three stunning AI-generated faces, or let our algorithm surprise you. Choose body type, style, personality traits. Every detail, customizable. Your perfect influencer takes shape.',
    highlight: 'Your vision. Your influencer.',
    icon: Palette,
    preview: {
      image: '/images/steps/step-1-design.webp',
      caption: 'Choose from 3 AI-generated faces',
    },
  },
  {
    step: 2,
    title: 'Generate',
    story:
      "Watch magic happen. In seconds, 7-10 hyper-realistic images appear. Crystal-clear skin. Perfect hands. Consistent features across every shot. Don't love something? Regenerate. Iterate until perfect.",
    highlight: 'Hyper-realistic. Endlessly customizable.',
    icon: Sparkles,
    preview: {
      image: '/images/steps/step-2-generate.webp',
      caption: '7-10 images generated instantly',
    },
  },
  {
    step: 3,
    title: 'Post',
    story:
      'Connect your platforms with one click. TikTok. Instagram. Fanvue. OnlyFans. Choose from viral-ready prompts and scenes. Schedule posts for optimal engagement. Your AI influencer is now live.',
    highlight: 'All platforms. One dashboard.',
    icon: Share2,
    preview: {
      image: '/images/steps/step-3-post.webp',
      caption: 'Connect & schedule to all platforms',
    },
  },
  {
    step: 4,
    title: 'Earn',
    story:
      'The earnings start flowing. Watch subscriber counts climb. Track engagement in real-time. See revenue grow while you sleep. Your AI influencer works 24/7, 365 days a year. Passive income, reimagined.',
    highlight: 'Passive income. 24/7.',
    icon: TrendingUp,
    preview: {
      image: '/images/steps/step-4-earn.webp',
      caption: 'Track earnings in real-time',
    },
  },
];

/**
 * Word component for text reveal animation
 */
interface WordProps {
  children: string;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  range: [number, number];
}

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, range, [
    'rgb(255 255 255 / 0.15)',
    'rgb(255 255 255 / 1)',
  ]);

  return (
    <span className="relative mx-[0.15em] inline-block">
      <motion.span style={{ opacity, color }}>{children}</motion.span>
    </span>
  );
}

/**
 * StoryBlock component - each story section with scroll-triggered reveal
 */
interface StoryBlockProps {
  section: StorySection;
  index: number;
  isFirst?: boolean;
  isLast?: boolean;
}

function StoryBlock({ section, index }: StoryBlockProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 0.85', 'start 0.15'],
  });

  const words = section.story.split(' ');
  const Icon = section.icon;

  // Flip layout for steps 2 and 4 (odd indexes)
  const isFlipped = index % 2 === 1;

  return (
    <div
      ref={targetRef}
      className="relative min-h-[55vh] flex items-center py-12 md:py-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 w-full">
        {/* Card Column */}
        <div
          className={cn(
            'flex flex-col justify-center',
            isFlipped && 'lg:order-2'
          )}
        >
          <motion.div
            initial={{ opacity: 0, x: isFlipped ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className={cn(
              'relative p-6 md:p-8 rounded-3xl overflow-hidden',
              // Glassmorphism effect
              'bg-white/[0.03] backdrop-blur-xl',
              'border border-white/10',
              'shadow-2xl shadow-purple-500/5'
            )}
          >
            {/* Striped pattern background */}
            <StripedPattern
              direction={index % 2 === 0 ? 'left' : 'right'}
              className="stroke-purple-500/10 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)]"
            />

            {/* Glow effect behind card */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-500/10 blur-xl -z-10 opacity-50" />

            {/* Step badge with icon */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 blur-sm opacity-50" />
                {/* Badge */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              </div>
              {/* Step number */}
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-purple-400 font-medium">
                  Step {section.step}
                </span>
                <h3 className="text-3xl lg:text-4xl font-bold text-white">
                  {section.title}
                </h3>
              </div>
            </div>

            {/* Highlight tagline */}
            <p className="text-lg text-purple-300 font-medium mb-6">
              {section.highlight}
            </p>

            {/* Mini Preview Card */}
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <div className="aspect-[16/10] relative">
                <Image
                  src={section.preview.image}
                  alt={section.preview.caption}
                  fill
                  className="object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm text-white/80 font-medium">
                  {section.preview.caption}
                </p>
              </div>
            </div>

            {/* Mobile: Show story text */}
            <div className="lg:hidden mt-6">
              <p className="text-base text-white/60 leading-relaxed">
                {section.story}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Text Column - Story text with scroll reveal (desktop only) */}
        <div
          className={cn(
            'hidden lg:flex items-center',
            isFlipped && 'lg:order-1 lg:justify-end lg:text-right'
          )}
        >
          <p
            className={cn(
              'text-xl lg:text-2xl font-medium leading-relaxed',
              isFlipped && 'text-right'
            )}
          >
            {words.map((word, i) => {
              const start = (i / words.length) * 0.85;
              const end = Math.min(1, start + 0.1);
              return (
                <Word key={i} progress={scrollYProgress} range={[start, end]}>
                  {word}
                </Word>
              );
            })}
          </p>
        </div>
      </div>

      {/* Decorative blur */}
      <div
        className={cn(
          'absolute -z-10 w-96 h-96 rounded-full blur-[120px] opacity-15',
          isFlipped ? 'right-0 bg-pink-500' : 'left-0 bg-purple-600'
        )}
      />
    </div>
  );
}

/**
 * HowItWorksSection Component
 *
 * Storytelling approach with scroll-triggered text reveal
 * Features glassmorphism cards with icons and preview thumbnails
 */
export function HowItWorksSection() {
  return (
    <Section id="how-it-works" background="default" className="py-16 md:py-28">
      {/* Header */}
      <FadeInUp>
        <SectionHeader
          title="From idea to income in minutes."
          titleHighlight="income"
        />
      </FadeInUp>

      {/* Story sections with vertical progress line */}
      <div className="mt-12 relative">
        {/* Vertical progress line (desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-[10%] bottom-[10%] -translate-x-1/2 w-px">
          {/* Gradient line */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/30 to-purple-500/0" />
        </div>

        {/* Story blocks */}
        <div className="space-y-0">
          {storySections.map((section, index) => (
            <StoryBlock
              key={section.step}
              section={section}
              index={index}
              isFirst={index === 0}
              isLast={index === storySections.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Final CTA - Clean and minimal */}
      <FadeInUp>
        <div className="mt-24 text-center">
          <p className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start?
          </p>
          <p className="text-lg text-white/50 mb-8">
            Join creators earning passive income.
          </p>
          <ShinyButton className="text-base px-8 py-4">
            Start Creating
            <ArrowRight className="w-4 h-4" />
          </ShinyButton>
        </div>
      </FadeInUp>
    </Section>
  );
}

export default HowItWorksSection;
