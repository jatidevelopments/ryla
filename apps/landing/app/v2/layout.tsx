import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RYLA - Create Most Realistic AI Influencer That Earns 24/7",
  description:
    "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, OnlyFans, and other monetization platforms.",
  keywords: [
    "AI influencer",
    "AI creator",
    "virtual influencer",
    "AI content generator",
    "hyper-realistic AI",
    "character consistency",
    "Fanvue AI",
    "OnlyFans AI",
    "TikTok AI",
    "passive income",
  ],
  openGraph: {
    title: "RYLA - Create Most Realistic AI Influencer That Earns 24/7",
    description:
      "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, OnlyFans, and other monetization platforms.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RYLA - Create Most Realistic AI Influencer That Earns 24/7",
    description:
      "Create hyper-realistic AI influencers with perfect character consistency.",
  },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

