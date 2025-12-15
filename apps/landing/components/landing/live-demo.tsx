"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Play, BarChart3, Users, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ComponentProps } from "@/data/landing-pages/types";

interface LiveDemoProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    demoTitle?: string;
    demoDescription?: string;
    videoSrc?: string;
    posterSrc?: string;
  };
}

const defaultContent = {
  title: "See AURA in Action",
  description:
    "Watch how creators are using AURA to build, grow, and monetize their AI influencers",
  demoTitle: "Live Demo: Persona Builder → Post → Analytics",
  demoDescription: "Real-time content creation and performance tracking",
  videoSrc: "/assets/videos/demo.mp4",
  posterSrc: "/assets/images/demo-poster.jpg",
};

export function LiveDemo({ content: contentProp, assets }: LiveDemoProps) {
  const content = { ...defaultContent, ...contentProp };

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

        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-2 border-border/50 dark:border-border/30 shadow-2xl dark:shadow-3xl">
            <CardContent className="p-0">
              {/* Demo Header */}
              <div className="bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <Play className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{content.demoTitle}</h3>
                      <p className="text-purple-100">
                        {content.demoDescription}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {/* Demo Video Section */}
              <div className="relative">
                <div className="aspect-video relative bg-black">
                  {content.videoSrc && (
                    <video
                      src={content.videoSrc}
                      poster={content.posterSrc}
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Demo Content */}
              <div className="grid lg:grid-cols-3 gap-0">
                {/* Persona Builder */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="p-6 border-r border-border"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">
                        Persona Builder
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">
                          Creating: @fitness_guru_ai
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>• Personality: Motivational, Energetic</div>
                          <div>• Niche: Fitness & Wellness</div>
                          <div>• Audience: 25-35, Health-conscious</div>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          AI Analysis Complete
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Persona optimized for maximum engagement
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Content Generation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="p-6 border-r border-border"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-600">
                        Content Generation
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-sm font-medium mb-2">
                          Generated Post
                        </div>
                        <div className="text-xs text-muted-foreground">
                          "Rise and grind! 💪 Your future self will thank you
                          for the work you put in today. Remember, every rep
                          counts, every meal matters, every choice shapes your
                          destiny. #FitnessMotivation #MorningRoutine #AURA"
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          #FitnessMotivation
                        </div>
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          #MorningRoutine
                        </div>
                        <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          #AURA
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Analytics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-purple-600">
                        Live Analytics
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            2.3K
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Likes
                          </div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            156
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Comments
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                        <div className="text-sm font-medium mb-1">
                          Earnings Today
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          $127.50
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +23% from yesterday
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <Separator />

              {/* AI Caption Example */}
              <div className="p-6 bg-muted/30">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-linear-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">AI Caption Suggestion</span>
                      <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                        High Engagement
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      "This caption is optimized for maximum engagement based on
                      your audience's preferences. It includes trending hashtags
                      and emotional triggers that resonate with your target
                      demographic."
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>Predicted: 2.5K likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>Reach: 15K users</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>Engagement: 8.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
