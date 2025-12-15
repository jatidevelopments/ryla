"use client";

import { LandingPageLayout } from "./shared/LandingPageLayout";
import { landingPageConfigs } from "./configs/landingPageConfigs";
import type { LandingPageContent } from "@/data/landing-pages/types";
import auraAiInfluencerContent from "@/data/landing-pages/aura-ai-influencer.json";

// Import reusable landing components
import {
  HeroSection,
  SocialProof,
  ProblemPromise,
  HowItWorks,
  LiveDemo,
  AIInfluencerShowcase,
  TemplatesGallery,
  Integrations,
  Pricing,
  FAQ,
  FinalCTA,
} from "@/components/landing";

// Section component mapping - only include components used by aura-ai-influencer
const sectionComponents = {
  HeroSection,
  SocialProof,
  ProblemPromise,
  HowItWorks,
  LiveDemo,
  AIInfluencerShowcase,
  TemplatesGallery,
  Integrations,
  Pricing,
  FAQ,
  FinalCTA,
};

interface LandingPageFactoryProps {
  pageId: string;
}

// Map pageId to JSON content files
const contentMap: Record<string, any> = {
  "aura-ai-influencer": auraAiInfluencerContent,
};

export function LandingPageFactory({ pageId }: LandingPageFactoryProps) {
  // Try to load JSON content first, fallback to config
  const jsonContent = contentMap[pageId];
  const config = landingPageConfigs[pageId];

  if (!jsonContent && !config) {
    throw new Error(`Landing page configuration not found for: ${pageId}`);
  }

  // Use JSON content if available, otherwise use config
  const pageData = jsonContent || config;
  const sections = jsonContent?.sections || config?.sections || [];
  // Only JSON content is guaranteed to have a header shape; configs may differ
  const headerConfig = jsonContent?.header || {};
  const className =
    jsonContent?.styling?.className ||
    config?.className ||
    "min-h-screen bg-background";

  // Convert JSON header to config format if needed
  const headerForLayout = jsonContent
    ? {
        title: jsonContent.header.title,
        icon: jsonContent.header.icon,
        gradient: jsonContent.header.gradient,
        navigation: jsonContent.header.navigation,
        ctaText: jsonContent.header.cta.text,
        ctaHref: jsonContent.header.cta.href,
        variant: jsonContent.header.variant,
      }
    : headerConfig;

  // Helper function to get section ID from navigation href or component name
  const getSectionId = (section: any, index: number): string => {
    // Check if section has an explicit ID
    if (section.id) return section.id;

    // Try to match navigation hrefs (e.g., "#features" -> "features")
    const navItem = jsonContent?.header?.navigation?.find(
      (nav: { href: string; label?: string }) =>
        nav.href ===
        `#${section.component.toLowerCase().replace(/section$/, "")}`
    );
    if (navItem) {
      return navItem.href.replace("#", "");
    }

    // Map component names to IDs
    const componentToIdMap: Record<string, string> = {
      HeroSection: "",
      SocialProof: "social-proof",
      ProblemPromise: "features",
      HowItWorks: "how-it-works",
      LiveDemo: "demo",
      AIInfluencerShowcase: "showcase",
      TemplatesGallery: "templates",
      Integrations: "integrations",
      Pricing: "pricing",
      FAQ: "faq",
      FinalCTA: "cta",
    };

    const id =
      componentToIdMap[section.component] ||
      section.component.toLowerCase().replace(/section$/, "");
    return id ? `#${id}` : "";
  };

  return (
    <LandingPageLayout header={headerForLayout} className={className}>
      {sections.map((section: any, index: number) => {
        const Component =
          sectionComponents[
            section.component as keyof typeof sectionComponents
          ];

        if (!Component) {
          console.warn(`Section component not found: ${section.component}`);
          return null;
        }

        // Get section ID for navigation
        const sectionId = getSectionId(section, index);
        const sectionProps = jsonContent
          ? {
              content: section.content,
              assets: section.assets,
              ...(section.props || {}),
            }
          : section.props || {};

        // Wrap section with ID if it has one
        if (sectionId) {
          return (
            <div
              key={`${section.component}-${index}`}
              id={sectionId.replace("#", "")}
            >
              <Component {...sectionProps} />
            </div>
          );
        }

        return (
          <Component key={`${section.component}-${index}`} {...sectionProps} />
        );
      })}
    </LandingPageLayout>
  );
}
