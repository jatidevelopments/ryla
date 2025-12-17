'use client';

import { Button, Card, CardContent, Spotlight } from '@ryla/ui';
import { Play, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ComponentProps } from '@/data/landing-pages/types';

interface HeroSectionProps extends ComponentProps {
  content?: {
    headline?: string;
    subheadline?: string;
    description?: string;
    gradient?: string;
    backgroundImage?: string;
    ctas?: Array<{
      text: string;
      href: string;
      variant?: 'default' | 'outline' | 'ghost';
      icon?: string;
    }>;
    socialProof?: Array<{
      label: string;
      value: string;
      icon?: string;
    }>;
    media?: {
      type: 'image' | 'video';
      src: string;
      alt?: string;
    };
  };
}

const defaultContent = {
  headline: 'Create your AI Influencer in Minutes',
  subheadline: 'Design. Generate. Post. Earn. Safe-by-default, NSFW optional.',
  description:
    'The complete platform for AI influencer creation, content generation, and monetization',
  gradient: 'from-purple-600 to-pink-600',
  ctas: [
    {
      text: 'Start Free',
      href: '#pricing',
      icon: 'Sparkles',
    },
    {
      text: 'Watch Demo',
      href: '#demo',
      variant: 'outline' as const,
      icon: 'Play',
    },
  ],
  socialProof: [
    { label: 'Posts Generated', value: '2.3M+' },
    { label: 'Active Creators', value: '50K+' },
    { label: 'Total Earned', value: '$2M+' },
  ],
};

export function HeroSection({
  content: contentProp,
  assets,
}: HeroSectionProps) {
  const content = { ...defaultContent, ...contentProp };

  // Get background image from assets or content
  const backgroundImage =
    assets?.find((a) => a.type === 'image')?.src ||
    content.backgroundImage ||
    '/assets/images/hero/ai-influencer-hero-aryanna.jpg';
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={
            assets?.find((a) => a.type === 'image')?.alt ||
            'AI Influencer Hero Background'
          }
          fill
          className="object-cover"
          priority={assets?.find((a) => a.type === 'image')?.priority || true}
        />
        <div className="absolute inset-0 bg-linear-to-br from-background/80 via-background/60 to-muted/40 dark:from-background/90 dark:via-background/80 dark:to-muted/50" />
      </div>

      {/* Spotlight Effect */}
      <Spotlight className="top-0 left-0 z-10" fill="white" />

      <div className="container mx-auto px-4 py-20 relative z-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                {content.headline?.split(' ').map((word, i, arr) => {
                  // Highlight keywords in gradient
                  const isHighlight =
                    word.toLowerCase().includes('ai') ||
                    word.toLowerCase().includes('influencer');
                  return isHighlight ? (
                    <span key={i}>
                      <span
                        className={`bg-linear-to-r ${content.gradient} dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent`}
                      >
                        {word}
                      </span>
                      {i < arr.length - 1 ? ' ' : ''}
                    </span>
                  ) : (
                    <span key={i}>
                      {word}
                      {i < arr.length - 1 ? ' ' : ''}
                    </span>
                  );
                }) || content.headline}
              </h1>
              {content.subheadline && (
                <p className="text-xl text-muted-foreground max-w-2xl">
                  {content.subheadline}
                </p>
              )}
              {content.description && !content.subheadline && (
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {content.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {content.ctas?.map((cta, index) => {
                const IconComponent =
                  cta.icon === 'Sparkles'
                    ? Sparkles
                    : cta.icon === 'Play'
                    ? Play
                    : ArrowRight;

                return (
                  <Button
                    key={index}
                    size="lg"
                    variant={cta.variant || 'default'}
                    className="text-lg px-8 py-6"
                    asChild
                  >
                    <a href={cta.href}>
                      {cta.icon && <IconComponent className="mr-2 h-5 w-5" />}
                      {cta.text}
                      {index === 0 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </a>
                  </Button>
                );
              })}
            </div>

            {/* Social Proof */}
            {content.socialProof && content.socialProof.length > 0 && (
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                {content.socialProof.map((proof, index) => {
                  const colors = ['green', 'blue', 'purple', 'pink', 'orange'];
                  const color = colors[index % colors.length];
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 bg-${color}-500 rounded-full`}
                      ></div>
                      <span>
                        {proof.value} {proof.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right Content - Video Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="relative overflow-hidden border-2 border-border/50 shadow-2xl">
              <CardContent className="p-0">
                {/* Mock Video Player */}
                <div className="relative aspect-video bg-linear-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>

                  {/* Play Button Overlay */}
                  <div className="relative z-10 flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <div className="text-center text-white">
                      <p className="text-sm font-medium">See AURA in Action</p>
                      <p className="text-xs opacity-80">
                        Persona Builder → Post → Analytics
                      </p>
                    </div>
                  </div>

                  {/* Mock UI Elements */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-white text-xs bg-black/30 px-2 py-1 rounded">
                      AURA Demo
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 text-white">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-linear-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span className="text-sm font-medium">
                          @ai_influencer_23
                        </span>
                      </div>
                      <p className="text-xs">
                        Just posted my latest fitness content! 💪 #AI #Fitness
                        #AURA
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-8 h-8 bg-purple-500 rounded-full opacity-60"
            />
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-500 rounded-full opacity-60"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
