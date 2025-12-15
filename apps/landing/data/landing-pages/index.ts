/**
 * Landing Page Data Index
 * 
 * Centralized exports for landing page data types and utilities
 */

export type {
    LandingPageContent,
    LandingPageAsset,
    CTAData,
    HeroSectionContent,
    FeatureItem,
    SocialProofItem,
    PricingPlan,
    FAQItem,
    SectionContent,
    ComponentProps,
} from "./types";

export {
    loadLandingPageContent,
    validateLandingPageContent,
    mergeLandingPageContent,
} from "./utils";

