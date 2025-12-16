"use client";

import { useEffect } from "react";
import { withCdn } from "@/lib/cdn";

/**
 * Component to inject comprehensive meta tags for SEO and AI search engines
 * This makes the entry page discoverable by ChatGPT and other AI crawlers
 */
export function EntryPageMetaTags() {
    useEffect(() => {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://goviral.ryla.ai";
        const title = "Ryla.ai — Create Hyper-Realistic AI Influencers That Earn 24/7";
        const description = "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, and OnlyFans. Build your AI influencer empire with one click.";
        const keywords = "AI influencer, AI creator, virtual influencer, AI content generator, hyper-realistic AI, character consistency, AI video generation, NSFW AI content, Fanvue AI, OnlyFans AI, TikTok AI, Instagram AI, passive income, AI monetization";
        const videoPath = "/video/ai_influencer_video_1.mp4";
        const videoUrl = withCdn(videoPath);
        const imageUrl = videoUrl && /^https?:\/\//i.test(videoUrl) ? videoUrl : `${baseUrl}${videoUrl || ""}`;

        // Helper function to set or update meta tag
        const setMetaTag = (name: string, content: string, attribute: string = "name") => {
            let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
            if (!element) {
                element = document.createElement("meta");
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };

        // Basic SEO Meta Tags
        setMetaTag("description", description);
        setMetaTag("keywords", keywords);
        setMetaTag("author", "Ryla.ai");
        setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
        setMetaTag("googlebot", "index, follow");
        setMetaTag("bingbot", "index, follow");
        
        // ChatGPT and AI Crawler specific
        setMetaTag("chatgpt", "index, follow");
        setMetaTag("ai-search", "index, follow");

        // Open Graph Meta Tags (Facebook, LinkedIn, etc.)
        setMetaTag("og:title", title, "property");
        setMetaTag("og:description", description, "property");
        setMetaTag("og:type", "website", "property");
        setMetaTag("og:url", baseUrl, "property");
        setMetaTag("og:image", imageUrl, "property");
        setMetaTag("og:image:width", "1200", "property");
        setMetaTag("og:image:height", "630", "property");
        setMetaTag("og:image:type", "video/mp4", "property");
        setMetaTag("og:site_name", "Ryla.ai", "property");
        setMetaTag("og:locale", "en_US", "property");

        // Twitter Card Meta Tags
        setMetaTag("twitter:card", "summary_large_image");
        setMetaTag("twitter:title", title);
        setMetaTag("twitter:description", description);
        setMetaTag("twitter:image", imageUrl);
        setMetaTag("twitter:site", "@RylaAI"); // Update with actual Twitter handle if available
        setMetaTag("twitter:creator", "@RylaAI");

        // Additional SEO Meta Tags
        setMetaTag("theme-color", "#8b5cf6"); // Purple theme
        setMetaTag("apple-mobile-web-app-capable", "yes");
        setMetaTag("apple-mobile-web-app-status-bar-style", "black-translucent");
        setMetaTag("apple-mobile-web-app-title", "Ryla.ai");

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", baseUrl);

        // Language
        setMetaTag("language", "English");
        setMetaTag("content-language", "en");

        // Geo tags (if applicable)
        // setMetaTag("geo.region", "US");
        // setMetaTag("geo.placename", "United States");

        // Content type
        setMetaTag("content-type", "text/html; charset=utf-8");

        // Viewport (should already be set, but ensuring it's correct)
        setMetaTag("viewport", "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes");

        // AI/LLM specific meta tags for better understanding
        setMetaTag("ai:description", description);
        setMetaTag("ai:category", "AI Content Generation, Virtual Influencers, AI Creators");
        setMetaTag("ai:features", "Hyper-realistic AI generation, Character consistency, Video generation, NSFW content, Social media integration");
    }, []);

    return null;
}

