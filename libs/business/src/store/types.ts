/**
 * Shared types for @ryla/business stores
 */

export interface GeneratedImage {
    id: string;
    url: string;
    thumbnailUrl?: string;
    s3Key?: string;
    prompt?: string;
    negativePrompt?: string;
    isNSFW?: boolean;
    seed?: string;
    model?: string;
    error?: string; // Error message for failed generations
}

export interface ProfilePictureImage extends GeneratedImage {
    positionId: string;
    positionName: string;
}
