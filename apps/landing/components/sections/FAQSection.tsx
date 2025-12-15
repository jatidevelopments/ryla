"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ryla-ui";
import { FadeInUp } from "@/components/animations";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How realistic are the AI influencers?",
    answer:
      "RYLA creates hyper-realistic AI influencers with skin that's indistinguishable from real photos, perfect hands on every image, and 100% character consistency across all content.",
  },
  {
    question: "Can I monetize on Fanvue and OnlyFans?",
    answer:
      "Yes! Generate images and videos to sell on Fanvue, OnlyFans, TikTok, and other platforms. Your AI influencer earns money 24/7.",
  },
  {
    question: "How does character consistency work?",
    answer:
      "Your AI influencer maintains the same face across all scenes—100% consistency regardless of outfit, style, or setting changes.",
  },
  {
    question: "Can I create viral videos?",
    answer:
      "Yes! Choose from viral-ready prompts for selfie poses, dance videos, driving scenes, and more. No complicated prompting needed.",
  },
  {
    question: "Does RYLA support lipsync?",
    answer:
      "Yes, RYLA has industry-leading lipsync videos with natural mouth movements and realistic speech patterns.",
  },
  {
    question: "How does image generation work?",
    answer:
      "Select from 3 face options, then RYLA generates 7-10 images. Keep your favorites, regenerate the rest, then create scenes with viral-ready prompts.",
  },
  {
    question: "Can I schedule posts and track earnings?",
    answer:
      "Connect to all platforms, schedule posts in advance, and see live statistics and earnings in real-time.",
  },
  {
    question: "What's included in the community?",
    answer:
      "Access an exclusive creator community plus expert courses on finding niches, monetization strategies, and growth techniques.",
  },
];

interface FAQItemComponentProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItemComponent({ item, isOpen, onToggle, index }: FAQItemComponentProps) {
  return (
    <FadeInUp delay={index * 30}>
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden",
          "transition-all duration-300",
          // Glassmorphism
          isOpen
            ? "bg-white/[0.08] border-white/20"
            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]",
          "border backdrop-blur-sm"
        )}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-5 text-left"
        >
          <span
            className={cn(
              "text-base font-medium transition-colors pr-4",
              isOpen ? "text-white" : "text-white/80"
            )}
          >
            {item.question}
          </span>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              "transition-all duration-300",
              isOpen
                ? "bg-purple-500/20 text-purple-400"
                : "bg-white/10 text-white/50"
            )}
          >
            {isOpen ? (
              <Minus className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5">
                <p className="text-white/60 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FadeInUp>
  );
}

/**
 * FAQSection Component
 *
 * Clean glassmorphism accordion FAQ.
 */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-transparent">
      <div className="max-w-2xl mx-auto px-6">
        <FadeInUp>
          <SectionHeader
            title="Questions? Answers."
            titleHighlight="Answers"
          />
        </FadeInUp>

        {/* FAQ Grid */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <FAQItemComponent
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() => toggleItem(index)}
              index={index}
            />
          ))}
        </div>

        {/* Contact */}
        <FadeInUp delay={300}>
          <div className="mt-10 text-center">
            <p className="text-white/40 text-sm">
              More questions?{" "}
              <a
                href="mailto:support@ryla.ai"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Get in touch
              </a>
            </p>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}

export default FAQSection;
