/**
 * Landing Page Content Structure
 * 
 * This file defines the TypeScript types for landing page content JSON files.
 * Each landing page should have a corresponding JSON file in /data/landing-pages/
 * that follows this structure.
 */

export interface LandingPageAsset {
    type: "image" | "video" | "icon" | "logo";
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}

export interface CTAData {
    text: string;
    href: string;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    icon?: string;
}

export interface HeroSectionContent {
    headline: string;
    subheadline?: string;
    description?: string;
    gradient?: string;
    backgroundImage?: string;
    backgroundVideo?: string;
    ctas: CTAData[];
    socialProof?: Array<{
        label: string;
        value: string;
        icon?: string;
    }>;
    media?: {
        type: "image" | "video";
        src: string;
        alt?: string;
    };
}

export interface FeatureItem {
    title: string;
    description: string;
    icon?: string;
    image?: string;
}

export interface SocialProofItem {
    name: string;
    role?: string;
    content?: string;
    avatar?: string;
    rating?: number;
    handle?: string; // For backward compatibility
    earnings?: string; // For backward compatibility
}

export interface PricingPlan {
    name: string;
    description: string;
    price: {
        monthly: number;
        yearly?: number;
    };
    features: string[];
    limitations?: string[];
    cta: CTAData;
    popular?: boolean;
    badge?: string;
    icon?: string; // Optional icon name (e.g., "Zap", "Star", "Crown")
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface SectionContent {
    component: string;
    props?: Record<string, any>;
    content?: Record<string, any>;
    assets?: LandingPageAsset[];
}

export interface LandingPageContent {
    // Page metadata
    id: string;
    title: string;
    description?: string;
    version?: string;

    // Header/Navigation
    header: {
        logo?: LandingPageAsset;
        title: string;
        icon?: string;
        gradient: string;
        navigation: Array<{
            label: string;
            href: string;
        }>;
        cta: CTAData;
        variant?: "default" | "overlay";
    };

    // Sections with content
    sections: Array<SectionContent>;

    // Global assets
    assets?: LandingPageAsset[];

    // SEO/Meta
    meta?: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogImage?: string;
    };

    // Styling
    styling?: {
        className?: string;
        theme?: "light" | "dark" | "auto";
        colors?: {
            primary?: string;
            secondary?: string;
            accent?: string;
        };
    };
}

// Helper type for component props
export interface ComponentProps {
    content?: Record<string, any>;
    assets?: LandingPageAsset[];
    [key: string]: any;
}

