"use client";

import { StructuredData } from "./StructuredData";
import { withCdn } from "@/lib/cdn";

/**
 * Structured data for the entry page to make it discoverable by search engines and ChatGPT
 */
export function EntryPageStructuredData() {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://goviral.ryla.ai";
    const videoPath = "/video/ai_influencer_video_1.mp4";
    const videoUrl = withCdn(videoPath);
    const logoPath = withCdn("/favicon/android-chrome-512x512.png");
    const toAbsolute = (path: string) =>
        path && /^https?:\/\//i.test(path) ? path : `${baseUrl}${path || ""}`;
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Ryla.ai",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Create hyper-realistic AI influencers that earn money 24/7"
        },
        "description": "Ryla.ai is an AI-powered platform that lets you create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for social media platforms like TikTok, Instagram, Fanvue, and OnlyFans. Features include one-click outfit changes, viral-ready video generation, lipsync capabilities, and NSFW content creation.",
        "featureList": [
            "Hyper-realistic AI creator generation",
            "100% character consistency across all images and videos",
            "One-click outfit and style changes",
            "Viral-ready video generation without complicated prompting",
            "Advanced lipsync video technology",
            "NSFW content generation with high precision",
            "Perfect hands and fingers in every generated image",
            "Hyper-realistic skin texture",
            "Multiple video content options (selfies, dance, driving, custom)",
            "Integration with Fanvue, OnlyFans, TikTok, and Instagram"
        ],
        "screenshot": toAbsolute(videoUrl),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1000+"
        },
        "creator": {
            "@type": "Organization",
            "name": "Ryla.ai"
        }
    };

    const websiteStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Ryla.ai",
        "url": baseUrl,
        "description": "Create hyper-realistic AI influencers that earn passive income 24/7. Build your AI influencer empire with Ryla.ai's advanced character generation technology.",
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    const organizationStructuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Ryla.ai",
        "url": baseUrl,
        "logo": toAbsolute(logoPath),
        "description": "AI-powered platform for creating hyper-realistic AI influencers and content creators",
        "sameAs": [
            // Add social media links if available
        ]
    };

    const howToStructuredData = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Create an AI Influencer with Ryla.ai",
        "description": "Step-by-step guide to creating your first AI influencer using Ryla.ai",
        "step": [
            {
                "@type": "HowToStep",
                "name": "Choose Creation Method",
                "text": "Start by choosing how you want to create your AI influencer - upload your own image or create from scratch"
            },
            {
                "@type": "HowToStep",
                "name": "Customize Appearance",
                "text": "Customize your AI influencer's age, ethnicity, eye color, hair style, face shape, and body type"
            },
            {
                "@type": "HowToStep",
                "name": "Select Content Options",
                "text": "Choose from various video content options including selfies, dance videos, and custom prompts"
            },
            {
                "@type": "HowToStep",
                "name": "Generate Your Influencer",
                "text": "Generate your hyper-realistic AI influencer with perfect character consistency"
            },
            {
                "@type": "HowToStep",
                "name": "Start Creating Content",
                "text": "Begin creating images and videos for your AI influencer to monetize on platforms like Fanvue and OnlyFans"
            }
        ]
    };

    return (
        <>
            <StructuredData data={structuredData} id="software-application" />
            <StructuredData data={websiteStructuredData} id="website" />
            <StructuredData data={organizationStructuredData} id="organization" />
            <StructuredData data={howToStructuredData} id="howto" />
        </>
    );
}

