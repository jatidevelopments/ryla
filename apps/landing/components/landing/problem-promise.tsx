"use client";

import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentProps } from "@/data/landing-pages/types";

interface ProblemPromiseProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    problems?: Array<{
      title: string;
      description: string;
      color?: string;
    }>;
    promises?: Array<{
      title: string;
      description: string;
      color?: string;
    }>;
    solution?: {
      title: string;
      description: string;
      cta?: {
        text: string;
        href: string;
      };
    };
    features?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

const problems = [
  {
    title: "Content is a grind",
    description: "",
    icon: <Clock className="h-6 w-6 text-red-500" />,
    className: "md:col-span-1",
    header: (
      <div className="flex flex-col h-full min-h-24 w-full bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-red-500/20 to-red-600/20" />
        <div className="relative p-4">
          <XCircle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
            Content is a grind
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Spending hours creating posts that barely get engagement
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Posting is chaos",
    description: "",
    icon: <XCircle className="h-6 w-6 text-orange-500" />,
    className: "md:col-span-1",
    header: (
      <div className="flex flex-col h-full min-h-24 w-full bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-500/20 to-orange-600/20" />
        <div className="relative p-4">
          <XCircle className="h-8 w-8 text-orange-500 mb-2" />
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
            Posting is chaos
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
            Managing multiple platforms with different requirements and
            schedules
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Monetization is hard",
    description: "",
    icon: <DollarSign className="h-6 w-6 text-yellow-500" />,
    className: "md:col-span-1",
    header: (
      <div className="flex flex-col h-full min-h-24 w-full bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-yellow-500/20 to-yellow-600/20" />
        <div className="relative p-4">
          <DollarSign className="h-8 w-8 text-yellow-500 mb-2" />
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
            Monetization is hard
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Struggling to turn followers into paying customers and sustainable
            income
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "AURA does it for you",
    description:
      "AI-powered content creation that understands your brand, generates viral posts, and handles everything from creation to monetization.",
    icon: <Zap className="h-6 w-6 text-green-500" />,
    className: "md:col-span-3",
    header: (
      <div className="flex flex-col h-full min-h-32 w-full bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-green-500/20 to-green-600/20" />
        <div className="relative p-6 flex items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-green-500" />
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                The Solution
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              AURA AI Platform
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Everything you need to build, grow, and monetize your AI
              influencer
            </p>
          </div>
          <div className="ml-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              Get Started
            </Button>
          </div>
        </div>
      </div>
    ),
  },
];

export function ProblemPromise() {
  return (
    <section className="py-20 bg-linear-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-linear-to-r from-red-500 to-green-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Problems → Solutions
          </Badge>
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">
            From <span className="text-red-500">Problems</span> to{" "}
            <span className="text-green-500">Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We understand the challenges creators face. That&apos;s why we built
            AURA to solve them all.
          </p>
        </motion.div>

        {/* BentoGrid Layout */}
        <BentoGrid className="max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <BentoCard
              key={index}
              name={problem.title}
              description={problem.description}
              background={problem.header}
              className={problem.className}
            />
          ))}
        </BentoGrid>

        {/* Features Grid with Illustrations */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center group"
          >
            <div className="relative w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full bg-linear-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Generate high-quality content in seconds, not hours. Our AI is
              optimized for speed and quality.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center group"
          >
            <div className="relative w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Safe by Default</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Built-in content moderation and safety features. NSFW content is
              optional and clearly marked.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center group"
          >
            <div className="relative w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <div className="w-full h-full bg-linear-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Monetize Instantly</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Built-in monetization tools and platform integrations. Start
              earning from day one.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
