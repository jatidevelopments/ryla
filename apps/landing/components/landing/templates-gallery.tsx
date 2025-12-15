"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Shirt,
  Plane,
  Gamepad2,
  Headphones,
  Heart,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentProps } from "@/data/landing-pages/types";

interface TemplatesGalleryProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    categories?: Array<{
      id: string;
      name: string;
      icon?: string;
      color: string;
      templates: Array<{
        name: string;
        description: string;
        image?: string;
        stats: {
          posts: string;
          engagement: string;
          earnings: string;
        };
        tags: string[];
        featured?: boolean;
        nsfw?: boolean;
      }>;
    }>;
  };
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Dumbbell,
  Shirt,
  Plane,
  Gamepad2,
  Headphones,
  Heart,
};

const defaultCategories = [
  {
    id: "fitness",
    name: "Fitness",
    icon: <Dumbbell className="h-5 w-5" />,
    color: "from-red-500 to-orange-500",
    templates: [
      {
        name: "Morning Motivation",
        description: "Energizing fitness content for early risers",
        image: "/assets/templates/fitness/fitness-morning.jpg",
        stats: { posts: "2.3K", engagement: "12.5%", earnings: "$8.2K" },
        tags: ["Motivation", "Morning", "Workout"],
        featured: true,
      },
      {
        name: "Workout Routines",
        description: "Step-by-step exercise guides and tips",
        image: "/assets/templates/fitness/fitness-workout.jpg",
        stats: { posts: "1.8K", engagement: "9.8%", earnings: "$6.1K" },
        tags: ["Exercise", "Tutorial", "Health"],
        featured: false,
      },
      {
        name: "Nutrition Tips",
        description: "Healthy eating advice and meal prep content",
        image: "/assets/templates/fitness/fitness-nutrition.jpg",
        stats: { posts: "1.5K", engagement: "11.2%", earnings: "$5.3K" },
        tags: ["Nutrition", "Meal Prep", "Healthy"],
        featured: false,
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: <Shirt className="h-5 w-5" />,
    color: "from-pink-500 to-purple-500",
    templates: [
      {
        name: "OOTD Showcase",
        description: "Daily outfit inspiration and styling tips",
        image: "/assets/templates/fashion/fashion-ootd.jpg",
        stats: { posts: "3.1K", engagement: "15.3%", earnings: "$12.7K" },
        tags: ["Style", "Outfit", "Trends"],
        featured: true,
      },
      {
        name: "Trend Analysis",
        description: "Breaking down the latest fashion trends",
        image: "/assets/templates/fashion/fashion-trends.jpg",
        stats: { posts: "2.2K", engagement: "13.1%", earnings: "$9.8K" },
        tags: ["Trends", "Analysis", "Fashion"],
        featured: false,
      },
    ],
  },
  {
    id: "travel",
    name: "Travel",
    icon: <Plane className="h-5 w-5" />,
    color: "from-blue-500 to-cyan-500",
    templates: [
      {
        name: "Destination Guides",
        description: "Comprehensive travel guides and tips",
        image: "/assets/templates/travel/travel-guides.jpg",
        stats: { posts: "2.7K", engagement: "14.2%", earnings: "$11.5K" },
        tags: ["Travel", "Guide", "Destinations"],
        featured: true,
      },
      {
        name: "Adventure Content",
        description: "Thrilling adventure and outdoor activities",
        image: "/assets/templates/travel/travel-adventure.jpg",
        stats: { posts: "1.9K", engagement: "16.8%", earnings: "$8.9K" },
        tags: ["Adventure", "Outdoor", "Thrills"],
        featured: false,
      },
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: <Gamepad2 className="h-5 w-5" />,
    color: "from-green-500 to-emerald-500",
    templates: [
      {
        name: "Game Reviews",
        description: "In-depth game analysis and recommendations",
        image: "/assets/templates/gaming/gaming-reviews.jpg",
        stats: { posts: "4.2K", engagement: "18.7%", earnings: "$15.3K" },
        tags: ["Reviews", "Gaming", "Analysis"],
        featured: true,
      },
      {
        name: "Live Streams",
        description: "Interactive gaming content and commentary",
        image: "/assets/templates/gaming/gaming-streams.jpg",
        stats: { posts: "3.8K", engagement: "22.1%", earnings: "$18.7K" },
        tags: ["Streaming", "Live", "Gaming"],
        featured: false,
      },
    ],
  },
  {
    id: "asmr",
    name: "ASMR",
    icon: <Headphones className="h-5 w-5" />,
    color: "from-indigo-500 to-purple-500",
    templates: [
      {
        name: "Relaxation Content",
        description: "Calming ASMR for stress relief",
        image: "/assets/templates/asmr/asmr-relaxation.jpg",
        stats: { posts: "2.1K", engagement: "19.3%", earnings: "$7.4K" },
        tags: ["Relaxation", "ASMR", "Calm"],
        featured: true,
      },
    ],
  },
  {
    id: "nsfw",
    name: "NSFW+",
    icon: <Heart className="h-5 w-5" />,
    color: "from-red-500 to-pink-500",
    templates: [
      {
        name: "Adult Content",
        description: "Mature content for adult audiences",
        image: "/assets/templates/nsfw/nsfw-adult.jpg",
        stats: { posts: "5.7K", engagement: "25.4%", earnings: "$32.1K" },
        tags: ["Adult", "Mature", "18+"],
        featured: true,
        nsfw: true,
      },
    ],
  },
];

export function TemplatesGallery({
  content: contentProp,
}: TemplatesGalleryProps) {
  const content = {
    title: "Template Gallery",
    description:
      "Choose from professionally designed templates across all major niches. Each template is optimized for maximum engagement and earnings.",
    categories: defaultCategories,
    ...contentProp,
  };

  const categories = content.categories || defaultCategories;

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

        <Tabs defaultValue={categories[0]?.id || "fitness"} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8">
            {categories.map((category) => {
              const iconKey =
                typeof category.icon === "string" ? category.icon : undefined;
              const IconComponent = iconKey && iconMap[iconKey] ? iconMap[iconKey] : Dumbbell;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => {
            const iconKey =
              typeof category.icon === "string" ? category.icon : undefined;
            const IconComponent = iconKey && iconMap[iconKey] ? iconMap[iconKey] : Dumbbell;
            return (
              <TabsContent
                key={category.id}
                value={category.id}
                className="mt-0"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.templates.map((template, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="group hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden dark:border-border/50 hover:border-primary/20 dark:hover:border-primary/30">
                        <div className="relative">
                          {/* Template Image */}
                          <div
                            className={`h-48 bg-linear-to-br ${category.color} flex items-center justify-center relative overflow-hidden`}
                          >
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative z-10 text-center text-white">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <IconComponent className="h-8 w-8" />
                              </div>
                              <div className="text-lg font-semibold">
                                {template.name}
                              </div>
                            </div>
                          </div>

                          {/* Featured Badge */}
                          {template.featured && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-yellow-500 text-yellow-900">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            </div>
                          )}

                          {/* NSFW Badge */}
                          {(template as any).nsfw && (
                            <div className="absolute top-4 right-4">
                              <Badge variant="destructive">18+</Badge>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold mb-2">
                                {template.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-foreground">
                                  {template.stats.posts}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Posts
                                </div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-foreground">
                                  {template.stats.engagement}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Engagement
                                </div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-foreground">
                                  {template.stats.earnings}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Earnings
                                </div>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag, tagIndex) => (
                                <Badge
                                  key={tagIndex}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* CTA Button */}
                            <Button className="w-full group-hover:bg-primary/90 transition-colors">
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
