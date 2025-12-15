"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Marquee from "@/components/ui/marquee";
import { Star, TrendingUp, Users, DollarSign } from "lucide-react";
import type {
  ComponentProps,
  SocialProofItem,
} from "@/data/landing-pages/types";

interface SocialProofProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    stats?: Array<{
      icon?: string;
      value: string;
      label: string;
    }>;
    creators?: SocialProofItem[];
    testimonial?: SocialProofItem;
  };
}

const defaultStats = [
  { icon: "TrendingUp", value: "2.3M+", label: "Posts Generated" },
  { icon: "Users", value: "50K+", label: "Active Creators" },
  { icon: "DollarSign", value: "$2M+", label: "Total Earnings" },
  { icon: "Star", value: "4.9/5", label: "User Rating" },
];

const iconMap: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Users,
  DollarSign,
  Star,
};

const defaultCreators: SocialProofItem[] = [
  {
    name: "Sarah Chen",
    role: "@sarah_ai",
    content: "$12.5K earned",
    avatar: "/assets/avatars/sarah.jpg",
    rating: 4.9,
  },
  {
    name: "Mike Rodriguez",
    role: "@mike_fitness",
    content: "$8.2K earned",
    avatar: "/assets/avatars/mike.jpg",
    rating: 4.9,
  },
  {
    name: "Emma Wilson",
    role: "@emma_fashion",
    content: "$15.7K earned",
    avatar: "/assets/avatars/emma.jpg",
    rating: 4.9,
  },
  {
    name: "Alex Kim",
    role: "@alex_gaming",
    content: "$6.8K earned",
    avatar: "/assets/avatars/alex.jpg",
    rating: 4.9,
  },
  {
    name: "Lisa Park",
    role: "@lisa_travel",
    content: "$11.3K earned",
    avatar: "/assets/avatars/lisa.jpg",
    rating: 4.9,
  },
  {
    name: "David Lee",
    role: "@david_tech",
    content: "$9.1K earned",
    avatar: "/assets/avatars/david.jpg",
    rating: 4.9,
  },
];

export function SocialProof({ content: contentProp }: SocialProofProps) {
  const content = {
    title: "Trusted by creators worldwide",
    description: "See how creators are earning with AURA",
    stats: defaultStats,
    creators: defaultCreators,
    ...contentProp,
  };

  const stats = content.stats || defaultStats;
  const creators = content.creators || defaultCreators;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
              const IconComponent =
                stat.icon && iconMap[stat.icon] ? iconMap[stat.icon] : Star;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Creator Avatars */}
        {creators.length > 0 && (
          <div className="space-y-8">
            {(content.title || content.description) && (
              <div className="text-center">
                {content.title && (
                  <h3 className="text-2xl font-bold mb-2">{content.title}</h3>
                )}
                {content.description && (
                  <p className="text-muted-foreground">{content.description}</p>
                )}
              </div>
            )}

            <Marquee className="py-4" pauseOnHover>
              <div className="flex space-x-8">
                {creators.map((creator, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 bg-background rounded-lg p-4 shadow-sm border border-border/50 min-w-[200px]"
                  >
                    <Avatar className="h-10 w-10">
                      {creator.avatar && (
                        <AvatarImage src={creator.avatar} alt={creator.name} />
                      )}
                      <AvatarFallback className="bg-linear-to-r from-purple-500 to-pink-500 text-white">
                        {creator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {creator.name}
                      </div>
                      {creator.role && (
                        <div className="text-xs text-muted-foreground truncate">
                          {creator.role || creator.handle}
                        </div>
                      )}
                      {(creator.content || creator.earnings) && (
                        <div className="flex items-center space-x-1 mt-1">
                          {creator.rating && (
                            <>
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">
                                {creator.rating}
                              </span>
                            </>
                          )}
                          {(creator.content || creator.earnings) && (
                            <Badge variant="secondary" className="text-xs">
                              {creator.content || creator.earnings}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Marquee>

            {/* Testimonial */}
            {content.testimonial && (
              <div className="text-center max-w-3xl mx-auto">
                <blockquote className="text-lg italic text-muted-foreground mb-4">
                  &quot;{content.testimonial.content}&quot;
                </blockquote>
                <div className="flex items-center justify-center space-x-2">
                  {content.testimonial.avatar && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={content.testimonial.avatar}
                        alt={content.testimonial.name}
                      />
                      <AvatarFallback className="bg-linear-to-r from-purple-500 to-pink-500 text-white text-xs">
                        {content.testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="text-sm">
                    <div className="font-medium">
                      {content.testimonial.name}
                    </div>
                    {content.testimonial.role && (
                      <div className="text-muted-foreground">
                        {content.testimonial.role}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
