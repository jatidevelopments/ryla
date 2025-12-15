import type { LandingPageContent } from "./types";

/**
 * Load landing page content from JSON file
 * Note: In Next.js, JSON imports are static, so we need to import them directly
 */
export function getLandingPageContent(pageId: string): LandingPageContent | null {
    try {
        // Import JSON files statically based on pageId
        // This is a helper that will be extended with actual imports
        switch (pageId) {
            case "aura-ai-influencer":
                // Will be imported below
                break;
            default:
                return null;
        }
        return null;
    } catch (error) {
        console.error(`Failed to load landing page content for ${pageId}:`, error);
        return null;
    }
}

/**
 * Async version for client-side loading
 */
export async function loadLandingPageContent(
    pageId: string
): Promise<LandingPageContent | null> {
    return getLandingPageContent(pageId);
}

/**
 * Validate landing page content structure
 */
export function validateLandingPageContent(
    content: any
): content is LandingPageContent {
    if (!content || typeof content !== "object") return false;
    if (!content.id || typeof content.id !== "string") return false;
    if (!content.title || typeof content.title !== "string") return false;
    if (!content.header || typeof content.header !== "object") return false;
    if (!content.sections || !Array.isArray(content.sections)) return false;

    return true;
}

/**
 * Merge default content with page-specific content
 */
export function mergeLandingPageContent(
    defaultContent: Partial<LandingPageContent>,
    pageContent: LandingPageContent
): LandingPageContent {
    return {
        ...defaultContent,
        ...pageContent,
        header: {
            ...defaultContent.header,
            ...pageContent.header,
        },
        sections: pageContent.sections.map((section) => ({
            ...section,
            content: {
                ...(defaultContent.sections?.[0]?.content || {}),
                ...section.content,
            },
        })),
    };
}

