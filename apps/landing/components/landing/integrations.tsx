'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Zap,
  Shield,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ComponentProps } from '@/data/landing-pages/types';

interface IntegrationsProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    platforms?: Array<{
      name: string;
      icon?: string;
      color: string;
      features: string[];
      status: string;
      posts: string;
      earnings: string;
    }>;
    features?: Array<{
      icon?: string;
      title: string;
      description: string;
      color?: string;
      customIcon?: string;
    }>;
    cta?: {
      title?: string;
      description?: string;
      ctas?: Array<{
        text: string;
        href: string;
        variant?: 'default' | 'outline';
      }>;
    };
  };
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Zap,
  Shield,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Heart,
};

const defaultPlatforms = [
  {
    name: 'Instagram',
    icon: <Instagram className="h-8 w-8" />,
    color: 'from-pink-500 to-purple-500',
    features: ['Posts', 'Stories', 'Reels', 'IGTV'],
    status: 'Active',
    posts: '2.3M+',
    earnings: '$1.2M+',
  },
  {
    name: 'TikTok',
    icon: <MessageCircle className="h-8 w-8" />,
    color: 'from-black to-gray-800',
    features: ['Videos', 'Live', 'Shorts', 'Trends'],
    status: 'Active',
    posts: '1.8M+',
    earnings: '$980K+',
  },
  {
    name: 'Twitter/X',
    icon: <Twitter className="h-8 w-8" />,
    color: 'from-blue-400 to-blue-600',
    features: ['Tweets', 'Threads', 'Spaces', 'Moments'],
    status: 'Active',
    posts: '3.1M+',
    earnings: '$750K+',
  },
  {
    name: 'YouTube',
    icon: <Youtube className="h-8 w-8" />,
    color: 'from-red-500 to-red-700',
    features: ['Videos', 'Shorts', 'Live', 'Community'],
    status: 'Active',
    posts: '890K+',
    earnings: '$1.5M+',
  },
  {
    name: 'Fansly',
    icon: <Heart className="h-8 w-8" />,
    color: 'from-orange-500 to-red-500',
    features: ['Posts', 'Messages', 'Live', 'Tips'],
    status: 'Active',
    posts: '450K+',
    earnings: '$2.1M+',
  },
  {
    name: 'OnlyFans',
    icon: <Heart className="h-8 w-8" />,
    color: 'from-pink-500 to-red-500',
    features: ['Content', 'Messages', 'Live', 'Tips'],
    status: 'Active',
    posts: '320K+',
    earnings: '$1.8M+',
  },
  {
    name: 'Discord',
    icon: <MessageCircle className="h-8 w-8" />,
    color: 'from-indigo-500 to-purple-500',
    features: ['Servers', 'Channels', 'Voice', 'Events'],
    status: 'Beta',
    posts: '180K+',
    earnings: '$420K+',
  },
];

const defaultFeatures = [
  {
    icon: 'Zap',
    customIcon: '/assets/icons/icon-1.png',
    title: 'Auto-Posting',
    description:
      'Schedule and publish content across all platforms automatically',
    color: 'text-yellow-500',
  },
  {
    icon: 'Shield',
    customIcon: '/assets/icons/icon-2.png',
    title: 'Content Moderation',
    description: 'AI-powered content filtering and platform compliance',
    color: 'text-green-500',
  },
  {
    icon: 'BarChart3',
    customIcon: '/assets/icons/icon-3.png',
    title: 'Analytics Dashboard',
    description: 'Real-time performance tracking and insights',
    color: 'text-blue-500',
  },
  {
    icon: 'Users',
    title: 'Audience Insights',
    description: 'Deep analytics on your followers and engagement',
    color: 'text-purple-500',
  },
  {
    icon: 'DollarSign',
    title: 'Revenue Tracking',
    description: 'Monitor earnings across all monetization channels',
    color: 'text-green-600',
  },
  {
    icon: 'Clock',
    title: 'Smart Scheduling',
    description: 'Optimal posting times based on audience activity',
    color: 'text-orange-500',
  },
];

export function Integrations({ content: contentProp }: IntegrationsProps) {
  const content = {
    title: 'Connect Your Socials',
    description:
      'Seamlessly integrate with all major platforms. Schedule, grow, and monetize across your entire social media presence.',
    platforms: defaultPlatforms,
    features: defaultFeatures,
    cta: {
      title: 'Ready to Connect Your Platforms?',
      description:
        'Join thousands of creators who are already using AURA to manage their entire social media presence from one powerful dashboard.',
      ctas: [
        { text: 'Connect Platforms', href: '#connect' },
        {
          text: 'View Integration Guide',
          href: '#guide',
          variant: 'outline' as const,
        },
      ],
    },
    ...contentProp,
  };

  const platforms = content.platforms || defaultPlatforms;
  const features = content.features || defaultFeatures;

  return (
    <section className="py-20 bg-background dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{content.title}</h2>
          {content.description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        {/* Platform Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {platforms.map((platform, index) => {
            const iconKey =
              typeof platform.icon === 'string' ? platform.icon : undefined;
            const IconComponent =
              iconKey && iconMap[iconKey] ? iconMap[iconKey] : Instagram;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="group hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 cursor-pointer dark:border-border/50 hover:border-primary/20 dark:hover:border-primary/30">
                        <CardContent className="p-6 text-center">
                          <div
                            className={`w-16 h-16 bg-linear-to-r ${
                              platform.color || 'from-purple-500 to-pink-500'
                            } rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                          >
                            <div className="text-white">
                              <IconComponent className="h-8 w-8" />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {platform.name}
                          </h3>
                          <div className="space-y-2">
                            {platform.status && (
                              <Badge
                                variant={
                                  platform.status === 'Active' ||
                                  platform.status === 'connected'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {platform.status}
                              </Badge>
                            )}
                            {'description' in platform &&
                              (platform as any).description && (
                                <div className="text-sm text-muted-foreground">
                                  {(platform as any).description}
                                </div>
                              )}
                            {platform.posts && (
                              <div className="text-sm text-muted-foreground">
                                {platform.posts} posts
                              </div>
                            )}
                            {platform.earnings && (
                              <div className="text-sm font-medium text-green-600">
                                {platform.earnings} earned
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        <div className="font-semibold">
                          {platform.name}
                          {platform.features &&
                            platform.features.length > 0 &&
                            ' Features:'}
                        </div>
                        {'description' in platform &&
                          (platform as any).description && (
                            <p className="text-sm">
                              {(platform as any).description}
                            </p>
                          )}
                        {platform.features && platform.features.length > 0 && (
                          <ul className="text-sm space-y-1">
                            {platform.features.map((feature, featureIndex) => (
                              <li key={featureIndex}>• {feature}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent =
              feature.icon && iconMap[feature.icon]
                ? iconMap[feature.icon]
                : Zap;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 dark:border-border/50 hover:border-primary/20 dark:hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={feature.color || 'text-yellow-500 shrink-0'}
                      >
                        {feature.customIcon ? (
                          <div className="relative w-6 h-6">
                            <Image
                              src={feature.customIcon}
                              alt={feature.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <IconComponent className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        {content.cta && (
          <div className="text-center mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 rounded-2xl p-8 text-white shadow-xl dark:shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-4">{content.cta.title}</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                {content.cta.description}
              </p>
              {content.cta.ctas && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {content.cta.ctas.map((cta, index) => (
                    <Button
                      key={index}
                      variant={cta.variant || 'default'}
                      className={
                        cta.variant === 'outline'
                          ? 'border-white/30 text-white hover:bg-white/10'
                          : 'bg-white text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-100'
                      }
                      asChild
                    >
                      <a href={cta.href}>{cta.text}</a>
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
