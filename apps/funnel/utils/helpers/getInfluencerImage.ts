import { EthnicityValue } from "@/constants/ethnicity-options";

/**
 * Get ethnicity-specific influencer asset image path
 * @param category - The category of asset (skin-colors, eye-colors, hair-colors, hair-styles, face-shapes)
 * @param ethnicity - The ethnicity value
 * @param optionValue - The option value (e.g., "light", "blue", "bun")
 * @returns The image path or null if not found
 */
export function getInfluencerImage(
    category: "skin-colors" | "eye-colors" | "hair-colors" | "hair-styles" | "face-shapes",
    ethnicity: EthnicityValue | string,
    optionValue: string
): string | null {
    if (!ethnicity || !optionValue) return null;
    
    // Normalize ethnicity value
    const normalizedEthnicity = ethnicity.toLowerCase() as EthnicityValue;
    
    // Map option values to file names
    const fileName = optionValue.toLowerCase().replace(/_/g, "-");
    
    return `/mdc-images/influencer-assets/${category}/${normalizedEthnicity}/${fileName}.webp`;
}

/**
 * Get base model image for ethnicity
 * @param ethnicity - The ethnicity value
 * @returns The base model image path or null if not found
 */
export function getBaseModelImage(ethnicity: EthnicityValue | string): string | null {
    if (!ethnicity) return null;
    
    const normalizedEthnicity = ethnicity.toLowerCase() as EthnicityValue;
    return `/mdc-images/influencer-assets/base-models/${normalizedEthnicity}-base.webp`;
}

/**
 * Get skin feature image path
 * @param featureType - Type of skin feature (freckles, scars, beauty-marks)
 * @param value - The feature value (none, light, medium, heavy, small, large, single, multiple)
 * @returns The image path or null if not found
 */
export function getSkinFeatureImage(
    featureType: "freckles" | "scars" | "beauty-marks",
    value: string
): string | null {
    if (!value) return null;
    
    const fileName = value.toLowerCase().replace(/_/g, "-");
    return `/mdc-images/influencer-assets/skin-features/${featureType}/${fileName}.webp`;
}

/**
 * Get tattoo image path
 * @param value - The tattoo value (none, small, medium, large, full-body)
 * @returns The image path or null if not found
 */
export function getTattooImage(value: string): string | null {
    if (!value) return null;
    
    const fileName = value.toLowerCase().replace(/_/g, "-");
    return `/mdc-images/influencer-assets/tattoos/${fileName}.webp`;
}

/**
 * Get piercing image path
 * @param value - The piercing value (none, ear, nose, lip, eyebrow, multiple)
 * @returns The image path or null if not found
 */
export function getPiercingImage(value: string): string | null {
    if (!value) return null;
    
    const fileName = value.toLowerCase().replace(/_/g, "-");
    return `/mdc-images/influencer-assets/piercings/${fileName}.webp`;
}

/**
 * Get age range image path for ethnicity
 * @param ethnicity - The ethnicity value
 * @param ageRange - The age range value (e.g., "18-25", "26-33", "34-41", "42-50")
 * @returns The image path or null if not found
 */
export function getAgeRangeImage(
    ethnicity: EthnicityValue | string,
    ageRange: string
): string | null {
    if (!ethnicity || !ageRange) return null;
    
    const normalizedEthnicity = ethnicity.toLowerCase() as EthnicityValue;
    const fileName = ageRange.toLowerCase().replace(/_/g, "-");
    
    return `/mdc-images/influencer-assets/age-ranges/${normalizedEthnicity}/${fileName}.webp`;
}

/**
 * Get outfit image path
 * @param outfitValue - The outfit value (e.g., "athleisure_set", "casual_streetwear")
 * @returns The image path or null if not found
 */
export function getOutfitImage(outfitValue: string): string | null {
    if (!outfitValue) return null;
    
    const fileName = outfitValue.toLowerCase().replace(/_/g, "-");
    return `/mdc-images/influencer-assets/outfits/${fileName}.webp`;
}

