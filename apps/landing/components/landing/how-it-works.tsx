'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Wand2, Share2, DollarSign, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { ComponentProps } from '@/data/landing-pages/types';

interface HowItWorksProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    steps?: Array<{
      id: string;
      title: string;
      description: string;
      icon?: string;
      image?: string;
      content?: any;
    }>;
    cta?: {
      text: string;
      href: string;
    };
  };
}

const defaultSteps = [
  {
    id: 'create',
    title: 'Create Persona',
    description:
      "Define your AI influencer's personality, style, and target audience",
    icon: 'User',
    image: '/assets/images/features/clone-clothing-feature.jpg',
  },
  {
    id: 'generate',
    title: 'Generate Content',
    description:
      'AI creates engaging posts, captions, and media tailored to your persona',
    icon: 'Wand2',
    image: '/assets/images/features/youtube-platform-feature.jpg',
  },
  {
    id: 'post',
    title: 'Auto-Post & Earn',
    description:
      'Schedule and publish across platforms, then monetize with built-in tools',
    icon: 'Share2',
    image: '/assets/images/features/instagram-shorts-feature.jpg',
  },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  User,
  Wand2,
  Share2,
  DollarSign,
};

export function HowItWorks({ content: contentProp }: HowItWorksProps) {
  const content = {
    title: 'How It Works',
    description:
      'Three simple steps to create, generate, and monetize your AI influencer content',
    steps: defaultSteps,
    cta: {
      text: 'Create your first persona',
      href: '#pricing',
    },
    ...contentProp,
  };

  const steps = content.steps || defaultSteps;

  return (
    <section className="py-20 bg-muted/30 dark:bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{content.title}</h2>
          {content.description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {content.description}
            </p>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue={steps[0]?.id || 'create'} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {steps.map((step, index) => {
                const IconComponent =
                  step.icon && iconMap[step.icon] ? iconMap[step.icon] : User;
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-8 w-8" />
                    <span className="hidden sm:inline">{step.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="relative">
              {steps.map((step, index) => {
                const IconComponent =
                  step.icon && iconMap[step.icon] ? iconMap[step.icon] : User;
                return (
                  <TabsContent key={step.id} value={step.id} className="mt-0">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold">{step.title}</h3>
                            <p className="text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {'content' in step && step.content && (
                          <div>{(step as any).content}</div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                      >
                        <Card className="p-6">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <span>Step {index + 1}</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div className="relative h-32 rounded-lg overflow-hidden">
                                {step.image && (
                                  <Image
                                    src={step.image}
                                    alt={`${step.title} Demo`}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-center text-white">
                                    <div className="text-4xl mb-2">
                                      <IconComponent className="h-12 w-12 mx-auto" />
                                    </div>
                                    <div className="text-sm font-medium">
                                      {step.title} Demo
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                See the actual {step.title.toLowerCase()}{' '}
                                interface in action.
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>

          {/* CTA */}
          {content.cta && (
            <div className="text-center mt-16">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href={content.cta.href}>
                  {content.cta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
