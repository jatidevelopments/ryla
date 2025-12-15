"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X, Star, Zap, Crown, Building } from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentProps, PricingPlan } from "@/data/landing-pages/types";

interface PricingProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    plans?: PricingPlan[];
    showYearlyToggle?: boolean;
    enterpriseCTA?: {
      title?: string;
      description?: string;
      ctas?: Array<{
        text: string;
        href: string;
        variant?: "default" | "outline" | "ghost";
      }>;
    };
  };
}

const defaultPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "Perfect for individual creators getting started",
    price: {
      monthly: 29,
      yearly: 290,
    },
    features: [
      "1 AI Influencer Persona",
      "100 posts per month",
      "3 platform connections",
      "Basic analytics",
      "Email support",
      "Standard templates",
    ],
    limitations: [
      "No custom branding",
      "Limited NSFW content",
      "Basic monetization tools",
    ],
    cta: {
      text: "Start Free Trial",
      href: "#pricing",
    },
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious creators who want to scale",
    price: {
      monthly: 79,
      yearly: 790,
    },
    features: [
      "5 AI Influencer Personas",
      "500 posts per month",
      "Unlimited platform connections",
      "Advanced analytics & insights",
      "Priority support",
      "All templates + custom",
      "Advanced monetization tools",
      "A/B testing",
      "Custom branding",
    ],
    limitations: [],
    cta: {
      text: "Start Free Trial",
      href: "#pricing",
    },
    popular: true,
    badge: "Most Popular",
  },
  {
    name: "Studio",
    description: "For agencies and enterprise teams",
    price: {
      monthly: 199,
      yearly: 1990,
    },
    features: [
      "Unlimited AI Influencer Personas",
      "Unlimited posts",
      "All platform connections",
      "Enterprise analytics",
      "Dedicated support",
      "Custom template creation",
      "Advanced monetization",
      "Team collaboration",
      "White-label options",
      "API access",
      "Custom integrations",
    ],
    limitations: [],
    cta: {
      text: "Contact Sales",
      href: "#contact",
    },
    popular: false,
  },
];

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="h-6 w-6" />,
  Star: <Star className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  Building: <Building className="h-6 w-6" />,
};

const getIconForPlan = (plan: PricingPlan, index: number): React.ReactNode => {
  if (plan.icon && iconMap[plan.icon]) {
    return iconMap[plan.icon];
  }
  // Default icons based on index
  return index === 0 ? (
    <Zap className="h-6 w-6" />
  ) : index === 1 ? (
    <Star className="h-6 w-6" />
  ) : (
    <Crown className="h-6 w-6" />
  );
};

const getColorForPlan = (plan: PricingPlan, index: number): string => {
  if (plan.popular) return "from-purple-500 to-pink-500";
  return index === 0
    ? "from-blue-500 to-cyan-500"
    : index === 2
    ? "from-orange-500 to-red-500"
    : "from-purple-500 to-pink-500";
};

export function Pricing({ content: contentProp }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false);

  const content = {
    title: "Simple, Transparent Pricing",
    description:
      "Choose the plan that fits your needs. All plans include a 14-day free trial with no credit card required.",
    plans: defaultPlans,
    showYearlyToggle: true,
    enterpriseCTA: {
      title: "Need Something Custom?",
      description:
        "We offer custom enterprise solutions with dedicated support, custom integrations, and volume discounts.",
      ctas: [
        { text: "Contact Sales", href: "#contact" },
        { text: "Schedule Demo", href: "#demo", variant: "outline" as const },
      ],
    },
    ...contentProp,
  };

  const plans = content.plans || defaultPlans;

  return (
    <section className="py-20 bg-muted/30 dark:bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{content.title}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {content.description}
          </p>

          {/* Billing Toggle */}
          {content.showYearlyToggle && (
            <div className="flex items-center justify-center space-x-4">
              <span
                className={`text-sm font-medium ${
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-primary"
              />
              <span
                className={`text-sm font-medium ${
                  isYearly ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Yearly
              </span>
              {isYearly && (
                <Badge className="bg-green-500 text-white">Save 20%</Badge>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {(plan.popular || plan.badge) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                    {plan.badge || "Most Popular"}
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl ${
                  plan.popular
                    ? "border-2 border-purple-500 shadow-xl dark:border-purple-400 dark:shadow-purple-500/20"
                    : "border-border dark:border-border/50 hover:border-primary/20 dark:hover:border-primary/30"
                }`}
              >
                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-16 h-16 bg-linear-to-r ${getColorForPlan(
                      plan,
                      index
                    )} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <div className="text-white">
                      {getIconForPlan(plan, index)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>

                  <div className="mt-6">
                    <div className="text-4xl font-bold">
                      $
                      {isYearly && plan.price.yearly
                        ? plan.price.yearly
                        : plan.price.monthly}
                      <span className="text-lg font-normal text-muted-foreground">
                        /{isYearly ? "year" : "month"}
                      </span>
                    </div>
                    {isYearly && plan.price.yearly && (
                      <div className="text-sm text-green-600 font-medium">
                        ${plan.price.monthly * 12 - plan.price.yearly} saved
                        annually
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations && plan.limitations.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div
                          key={limitationIndex}
                          className="flex items-center space-x-3"
                        >
                          <X className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <a href={plan.cta.href}>{plan.cta.text}</a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        {content.enterpriseCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 text-center"
          >
            <Card className="max-w-2xl mx-auto bg-linear-to-r from-gray-900 to-gray-800 text-white border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <Building className="h-8 w-8 mr-3" />
                  <h3 className="text-2xl font-bold">
                    {content.enterpriseCTA.title}
                  </h3>
                </div>
                <p className="text-gray-300 mb-6">
                  {content.enterpriseCTA.description}
                </p>
                {content.enterpriseCTA.ctas && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {content.enterpriseCTA.ctas.map((cta, index) => (
                      <Button
                        key={index}
                        variant={
                          cta.variant === "outline" ? "outline" : "secondary"
                        }
                        className={
                          cta.variant === "outline"
                            ? "border-white text-white hover:bg-white/10"
                            : "bg-white text-gray-900 hover:bg-gray-100"
                        }
                        asChild
                      >
                        <a href={cta.href}>{cta.text}</a>
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* FAQ */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h4 className="font-semibold mb-2">
                Can I change plans anytime?
              </h4>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">
                What happens after the free trial?
              </h4>
              <p className="text-muted-foreground text-sm">
                After 14 days, you&apos;ll be automatically charged for your
                selected plan. You can cancel anytime.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
              <p className="text-muted-foreground text-sm">
                We offer a 30-day money-back guarantee for all paid plans. No
                questions asked.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Is there a setup fee?</h4>
              <p className="text-muted-foreground text-sm">
                No setup fees, no hidden costs. You only pay for your monthly or
                yearly subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
