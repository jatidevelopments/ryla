export interface LandingPageConfig {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  navigation: Array<{
    label: string;
    href: string;
  }>;
  ctaText: string;
  ctaHref?: string;
  variant?: "default" | "overlay";
  className?: string;
  sections: Array<{
    component: string;
    props?: Record<string, any>;
  }>;
}

export const landingPageConfigs: Record<string, LandingPageConfig> = {
  // AURA landing page disabled - not available
  // "aura-ai-influencer": {
  //   id: "aura-ai-influencer",
  //   title: "AI Influencer Creator",
  //   icon: "A",
  //   gradient: "from-purple-600 to-pink-600",
  //   navigation: [
  //     { label: "Features", href: "#features" },
  //     { label: "Templates", href: "#templates" },
  //     { label: "Pricing", href: "#pricing" },
  //     { label: "Integrations", href: "#integrations" },
  //   ],
  //   ctaText: "Get Started",
  //   ctaHref: "#pricing",
  //   variant: "default",
  //   className: "min-h-screen bg-background",
  //   sections: [
  //     { component: "HeroSection" },
  //     { component: "SocialProof" },
  //     { component: "ProblemPromise" },
  //     { component: "HowItWorks" },
  //     { component: "LiveDemo" },
  //     { component: "AIInfluencerShowcase" },
  //     { component: "TemplatesGallery" },
  //     { component: "Integrations" },
  //     { component: "Pricing" },
  //     { component: "FAQ" },
  //     { component: "FinalCTA" },
  //   ],
  // },
  "video-flow": {
    id: "video-flow",
    title: "Dream to Reality",
    icon: "CE",
    gradient: "from-teal-600 to-blue-600",
    navigation: [
      { label: "Story", href: "#story" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
    ctaText: "Get Started",
    ctaHref: "#pricing",
    variant: "overlay",
    className: "relative w-full h-screen",
    sections: [
      { component: "CinematicVideoSection" },
    ],
  },
  "normal-flow": {
    id: "normal-flow",
    title: "Creator Business Suite",
    icon: "MI",
    gradient: "from-emerald-600 to-green-600",
    navigation: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Testimonials", href: "#testimonials" },
    ],
    ctaText: "Get Started",
    ctaHref: "#pricing",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "BusinessHeroSection" },
      { component: "BusinessFeaturesSection" },
      { component: "BusinessSocialProofSection" },
      { component: "BusinessProcessSection" },
      { component: "BusinessPricingSection" },
      { component: "BusinessCTASection" },
    ],
  },

  // CloseUp-Style Landing Page
  "closeup-style": {
    id: "closeup-style",
    title: "AURA AI Influencer",
    icon: "A",
    gradient: "from-slate-600 to-slate-800",
    navigation: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Benefits", href: "#benefits" },
    ],
    ctaText: "Create your first AI influencer",
    ctaHref: "#cta",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "CloseUpStyleHeroSection" },
      { component: "CloseUpStyleFeaturesSection" },
      { component: "CloseUpStyleHowItWorksSection" },
      { component: "CloseUpStyleBenefitsSection" },
      { component: "CloseUpStyleCTASection" },
      { component: "CloseUpStyleFooter" },
    ],
  },

  // Persona-Specific Landing Pages
  "fashion-creator-emma": {
    id: "fashion-creator-emma",
    title: "Fashion Creator Emma",
    icon: "E",
    gradient: "from-pink-600 to-rose-600",
    navigation: [
      { label: "Style Templates", href: "#templates" },
      { label: "Brand Partnerships", href: "#partnerships" },
      { label: "Pricing", href: "#pricing" },
      { label: "Success Stories", href: "#stories" },
    ],
    ctaText: "Start Your Fashion Journey",
    ctaHref: "#pricing",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "FashionHeroSection" },
      { component: "FashionProblemSection" },
      { component: "FashionTemplatesSection" },
      { component: "FashionBrandPartnershipsSection" },
      { component: "FashionSuccessStoriesSection" },
      { component: "FashionPricingSection" },
      { component: "FashionCTASection" },
    ],
  },

  "fitness-creator-jake": {
    id: "fitness-creator-jake",
    title: "Fitness Creator Jake",
    icon: "J",
    gradient: "from-green-600 to-emerald-600",
    navigation: [
      { label: "Workout Templates", href: "#templates" },
      { label: "Monetization", href: "#monetization" },
      { label: "Pricing", href: "#pricing" },
      { label: "Community", href: "#community" },
    ],
    ctaText: "Build Your Fitness Empire",
    ctaHref: "#pricing",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "FitnessHeroSection" },
      { component: "FitnessProblemSection" },
      { component: "FitnessTemplatesSection" },
      { component: "FitnessMonetizationSection" },
      { component: "FitnessCommunitySection" },
      { component: "FitnessPricingSection" },
      { component: "FitnessCTASection" },
    ],
  },

  "adult-creator-luna": {
    id: "adult-creator-luna",
    title: "Adult Creator Luna",
    icon: "L",
    gradient: "from-purple-600 to-indigo-600",
    navigation: [
      { label: "Privacy & Safety", href: "#privacy" },
      { label: "Monetization", href: "#monetization" },
      { label: "Pricing", href: "#pricing" },
      { label: "Support", href: "#support" },
    ],
    ctaText: "Monetize Your Content",
    ctaHref: "#pricing",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "AdultHeroSection" },
      { component: "AdultPrivacySection" },
      { component: "AdultMonetizationSection" },
      { component: "AdultSuccessStoriesSection" },
      { component: "AdultPricingSection" },
      { component: "AdultCTASection" },
    ],
  },

  "agency-digital-desire": {
    id: "agency-digital-desire",
    title: "Digital Desire Agency",
    icon: "D",
    gradient: "from-blue-600 to-cyan-600",
    navigation: [
      { label: "Creator Management", href: "#management" },
      { label: "Compliance", href: "#compliance" },
      { label: "Pricing", href: "#pricing" },
      { label: "Case Studies", href: "#cases" },
    ],
    ctaText: "Scale Your Agency",
    ctaHref: "#pricing",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "AgencyHeroSection" },
      { component: "AgencyManagementSection" },
      { component: "AgencyComplianceSection" },
      { component: "AgencyCaseStudiesSection" },
      { component: "AgencyPricingSection" },
      { component: "AgencyCTASection" },
    ],
  },
  "high-converting-sales": {
    id: "high-converting-sales",
    title: "AI Money Machine",
    icon: "AM",
    gradient: "from-orange-600 to-red-600",
    navigation: [
      { label: "Success Stories", href: "#success" },
      { label: "How It Works", href: "#process" },
      { label: "Guarantee", href: "#guarantee" },
      { label: "Pricing", href: "#pricing" },
    ],
    ctaText: "Claim Your Spot",
    ctaHref: "#pricing",
    variant: "default",
    className: "min-h-screen bg-background",
    sections: [
      { component: "HighConvertingSalesPage" },
    ],
  },
};
