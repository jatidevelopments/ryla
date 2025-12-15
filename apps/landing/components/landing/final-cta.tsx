"use client";

import { Button } from "@/components/ui/button";
import { Meteors } from "@/components/ui/meteors";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { ComponentProps, CTAData } from "@/data/landing-pages/types";

interface FinalCTAProps extends ComponentProps {
  content?: {
    headline?: string;
    description?: string;
    gradient?: string;
    ctas?: CTAData[];
    stats?: Array<{
      icon?: string;
      value: string;
      label: string;
    }>;
    logos?: Array<{
      src: string;
      alt: string;
    }>;
    showMeteors?: boolean;
  };
}

const defaultContent = {
  headline: "Create your AI Influencer in Minutes",
  description:
    "Join thousands of creators who are already earning with AURA. Start your free trial today and see the difference AI can make.",
  gradient: "from-purple-900 via-blue-900 to-indigo-900",
  ctas: [
    {
      text: "Start Free Trial",
      href: "#pricing",
      icon: "Sparkles",
    },
    {
      text: "View Templates",
      href: "#templates",
      variant: "outline" as const,
    },
  ],
  stats: [
    { icon: "Star", value: "4.9/5", label: "User Rating" },
    { icon: "Zap", value: "2.3M+", label: "Posts Generated" },
    { icon: "Star", value: "$2M+", label: "Creator Earnings" },
  ],
  logos: [
    { src: "/assets/logos/companies/techcrunch.svg", alt: "TechCrunch" },
    { src: "/assets/logos/companies/forbes.svg", alt: "Forbes" },
    { src: "/assets/logos/companies/wired.svg", alt: "Wired" },
    { src: "/assets/logos/companies/the-verge.svg", alt: "The Verge" },
    { src: "/assets/logos/companies/mashable.svg", alt: "Mashable" },
  ],
  showMeteors: true,
};

const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  ArrowRight,
  Star,
  Zap,
};

export function FinalCTA({ content: contentProp, assets }: FinalCTAProps) {
  const content = { ...defaultContent, ...contentProp };

  // Get background gradient from assets or content
  const backgroundGradient = content.gradient || defaultContent.gradient;

  return (
    <section
      className={`relative py-20 bg-linear-to-br ${backgroundGradient} dark:from-purple-800 dark:via-blue-800 dark:to-indigo-800 text-white overflow-hidden`}
    >
      {/* Meteors Effect */}
      {content.showMeteors && <Meteors number={50} className="opacity-30" />}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            {content.headline?.split(" ").map((word, i, arr) => {
              const isHighlight =
                word.toLowerCase().includes("ai") ||
                word.toLowerCase().includes("influencer");
              return isHighlight ? (
                <span key={i}>
                  <span className="bg-linear-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                    {word}
                  </span>
                  {i < arr.length - 1 ? " " : ""}
                </span>
              ) : (
                <span key={i}>
                  {word}
                  {i < arr.length - 1 ? " " : ""}
                </span>
              );
            }) || content.headline}
          </h2>

          {content.description && (
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              {content.description}
            </p>
          )}

          {/* CTA Buttons */}
          {content.ctas && content.ctas.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {content.ctas.map((cta, index) => {
                const IconComponent =
                  cta.icon && iconMap[cta.icon]
                    ? iconMap[cta.icon]
                    : ArrowRight;
                return (
                  <Button
                    key={index}
                    size="lg"
                    variant={cta.variant || "default"}
                    className={`text-lg px-8 py-6 ${
                      index === 0
                        ? "bg-linear-to-r from-yellow-400 to-pink-400 text-black hover:from-yellow-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105"
                        : "border-white/30 text-white hover:bg-white/10 transition-all duration-300"
                    }`}
                    asChild
                  >
                    <a href={cta.href}>
                      {cta.icon && <IconComponent className="mr-2 h-6 w-6" />}
                      {cta.text}
                      {index === 0 && <ArrowRight className="ml-2 h-5 w-5" />}
                    </a>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Stats Cards */}
          {content.stats && content.stats.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {content.stats.map((stat, index) => {
                const IconComponent =
                  stat.icon && iconMap[stat.icon] ? iconMap[stat.icon] : Star;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-linear-to-r from-yellow-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="h-6 w-6 text-black" />
                        </div>
                        <div className="text-3xl font-bold mb-2">
                          {stat.value}
                        </div>
                        <div className="text-blue-100">{stat.label}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Trust Indicators */}
          {content.logos && content.logos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <p className="text-blue-200 mb-4">
                Trusted by creators worldwide
              </p>
              <div className="flex flex-wrap justify-center items-center gap-16 opacity-70">
                {content.logos.map((logo, index) => (
                  <Image
                    key={index}
                    src={logo.src}
                    alt={logo.alt}
                    width={200}
                    height={60}
                    className="h-14 w-auto hover:opacity-100 transition-all duration-300 hover:scale-105"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
    </section>
  );
}
