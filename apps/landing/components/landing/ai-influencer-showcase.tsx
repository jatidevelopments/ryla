"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ComponentProps } from "@/data/landing-pages/types";

interface AIInfluencerShowcaseProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    influencers?: Array<{
      name: string;
      handle: string;
      image: string;
      followers: string;
      engagement: string;
      earnings: string;
      niche: string;
      verified?: boolean;
    }>;
    cta?: {
      text: string;
      href: string;
    };
  };
}

const defaultInfluencers = [
  {
    name: "Aryanna",
    handle: "@aryanna_ai",
    image: "/assets/images/gallery/ai-influencer-aryanna.jpg",
    followers: "2.3M",
    engagement: "8.5%",
    earnings: "$12.5K",
    niche: "Fashion & Lifestyle",
    verified: true,
  },
  {
    name: "Myla",
    handle: "@myla_fitness",
    image: "/assets/images/gallery/ai-influencer-myla.jpg",
    followers: "1.8M",
    engagement: "12.3%",
    earnings: "$9.2K",
    niche: "Fitness & Wellness",
    verified: true,
  },
  {
    name: "Elektra",
    handle: "@elektra_gaming",
    image: "/assets/images/gallery/ai-influencer-elektra.jpg",
    followers: "3.1M",
    engagement: "15.7%",
    earnings: "$18.7K",
    niche: "Gaming & Tech",
    verified: true,
  },
  {
    name: "Brooke",
    handle: "@brooke_travel",
    image: "/assets/images/gallery/ai-influencer-brooke.jpg",
    followers: "1.5M",
    engagement: "9.8%",
    earnings: "$7.3K",
    niche: "Travel & Adventure",
    verified: true,
  },
  {
    name: "Angelica",
    handle: "@angelica_beauty",
    image: "/assets/images/gallery/ai-influencer-angelica.jpg",
    followers: "2.7M",
    engagement: "11.2%",
    earnings: "$14.1K",
    niche: "Beauty & Skincare",
    verified: true,
  },
];

export function AIInfluencerShowcase({
  content: contentProp,
}: AIInfluencerShowcaseProps) {
  const content = {
    title: "Meet Our AI Influencers",
    description:
      "See how creators are building successful AI influencers across different niches. Each one has a unique personality and style.",
    influencers: defaultInfluencers,
    cta: {
      text: "Start Building Your AI Influencer",
      href: "#pricing",
    },
    ...contentProp,
  };

  const influencers = content.influencers || defaultInfluencers;

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {influencers.map((influencer, index) => (
            <motion.div
              key={influencer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden dark:border-border/50 hover:border-primary/20 dark:hover:border-primary/30">
                <div className="relative">
                  {/* Influencer Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={influencer.image}
                      alt={`${influencer.name} AI Influencer`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                    {/* Verified Badge */}
                    {influencer.verified && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-blue-500 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    )}

                    {/* Niche Badge */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge variant="secondary" className="text-xs">
                        {influencer.niche}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Name and Handle */}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {influencer.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {influencer.handle}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {influencer.followers}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Followers
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">
                            {influencer.engagement}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Engagement
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-green-600">
                            {influencer.earnings}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Earned
                          </div>
                        </div>
                      </div>

                      {/* Engagement Icons */}
                      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>2.3K</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>156</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>Share</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {content.cta && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Ready to create your own AI influencer?
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold"
            >
              <Star className="h-4 w-4" />
              <span>{content.cta.text}</span>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
