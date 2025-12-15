"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import type { ComponentProps, FAQItem } from "@/data/landing-pages/types";
import { Button } from "@/components/ui/button";

interface FAQProps extends ComponentProps {
  content?: {
    title?: string;
    description?: string;
    faqs?: FAQItem[];
    supportCTA?: {
      title?: string;
      description?: string;
      ctas?: Array<{
        text: string;
        href: string;
        variant?: "default" | "outline";
      }>;
    };
  };
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How does AURA's AI create content that matches my brand?",
    answer:
      "AURA uses advanced machine learning to analyze your brand voice, target audience, and content preferences. Our AI learns from your input and creates content that maintains consistency with your established style while adapting to platform-specific requirements and trending topics.",
  },
  {
    question: "What platforms does AURA support for auto-posting?",
    answer:
      "AURA currently supports Instagram, TikTok, Twitter/X, YouTube, Fansly, OnlyFans, and Discord. We're constantly adding new platforms based on user demand. Each platform integration includes platform-specific optimizations for maximum engagement.",
  },
  {
    question: "Is my content safe and compliant with platform policies?",
    answer:
      "Yes, AURA includes built-in content moderation and compliance checking. Our AI is trained to follow platform guidelines and community standards. We also provide NSFW controls and content warnings to ensure your content meets platform requirements.",
  },
  {
    question: "How much can I realistically earn with AURA?",
    answer:
      "Earnings vary based on your niche, audience size, and engagement. Our users typically see 200-500% increases in engagement and revenue within the first month. Some creators have earned over $50K monthly, while others see steady growth from $500-5K monthly depending on their strategy.",
  },
  {
    question: "Can I use AURA for NSFW content?",
    answer:
      "Yes, AURA supports NSFW content creation with proper safeguards. You can enable NSFW mode in your settings, and the platform will ensure content is properly tagged and distributed only to appropriate platforms and audiences. All NSFW content is clearly marked and filtered.",
  },
  {
    question: "What's the difference between the Starter and Pro plans?",
    answer:
      "Starter includes 1 persona and 100 posts/month, perfect for individual creators. Pro includes 5 personas, 500 posts/month, advanced analytics, custom branding, and priority support. Pro is ideal for serious creators who want to scale their presence across multiple niches.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer:
      "The free trial gives you full access to all Starter plan features for 14 days. No credit card required to start. You can create content, connect platforms, and test all features. If you don't cancel, you'll be charged for your selected plan after the trial period.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. Your access continues until the end of your current billing period. We also offer a 30-day money-back guarantee if you're not satisfied with the service.",
  },
  {
    question: "Does AURA work with existing social media accounts?",
    answer:
      "Absolutely! AURA integrates with your existing social media accounts. You can connect your current profiles and AURA will help optimize and enhance your content strategy without disrupting your established presence.",
  },
  {
    question: "What kind of support do you provide?",
    answer:
      "We provide email support for all users, priority support for Pro users, and dedicated support for Studio users. Our support team is available 24/7 and includes content strategy experts who can help optimize your AI influencer performance.",
  },
];

export function FAQ({ content: contentProp }: FAQProps) {
  const content = {
    title: "Frequently Asked Questions",
    description:
      "Everything you need to know about AURA. Can't find the answer you're looking for? Contact our support team.",
    faqs: defaultFAQs,
    supportCTA: {
      title: "Still have questions?",
      description:
        "Our support team is here to help you get the most out of AURA.",
      ctas: [
        { text: "Contact Support", href: "#support" },
        { text: "Schedule Demo", href: "#demo", variant: "outline" as const },
      ],
    },
    ...contentProp,
  };

  const faqs = content.faqs || defaultFAQs;

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Support */}
        {content.supportCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-16"
          >
            <div className="bg-muted/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">
                {content.supportCTA.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {content.supportCTA.description}
              </p>
              {content.supportCTA.ctas && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {content.supportCTA.ctas.map((cta, index) => (
                    <Button
                      key={index}
                      variant={cta.variant || "default"}
                      className={
                        cta.variant === "outline"
                          ? "border border-border hover:bg-muted"
                          : ""
                      }
                      asChild
                    >
                      <a href={cta.href}>{cta.text}</a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
