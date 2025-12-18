/**
 * FAQ Data
 * 
 * Centralized FAQ data for use in components and structured data
 */

export interface FAQItem {
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    question: 'How realistic are the AI influencers?',
    answer:
      "RYLA creates hyper-realistic AI influencers with skin that's indistinguishable from real photos, perfect hands on every image, and 100% character consistency across all content.",
  },
  {
    question: 'How does character consistency work?',
    answer:
      'Your AI influencer maintains the same face across all scenes—100% consistency regardless of outfit, style, or setting changes.',
  },
  {
    question: 'Can I create viral videos?',
    answer:
      'Yes! Choose from viral-ready prompts for selfie poses, dance videos, driving scenes, and more. No complicated prompting needed.',
  },
  {
    question: 'Does RYLA support lipsync?',
    answer:
      'Yes, RYLA has industry-leading lipsync videos with natural mouth movements and realistic speech patterns.',
  },
  {
    question: 'How does image generation work?',
    answer:
      'Select from 3 face options, then RYLA generates 7-10 images. Keep your favorites, regenerate the rest, then create scenes with viral-ready prompts.',
  },
  {
    question: 'Can I schedule posts and track earnings?',
    answer:
      'Connect to all platforms, schedule posts in advance, and see live statistics and earnings in real-time.',
  },
  {
    question: "What's included in the community?",
    answer:
      'Access an exclusive creator community plus expert courses on finding niches, monetization strategies, and growth techniques.',
  },
];
