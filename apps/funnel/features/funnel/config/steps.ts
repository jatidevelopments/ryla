import { ComponentType } from "react";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import {
    ChooseCreationMethodStep,
    AIDescriptionStep,
    AIGenerationStep,
    AIReviewEditStep,
    CustomPromptsStep,
    CustomReviewStep,
    PartnershipProofStep,
    AIInfluencerExperienceStep,
    UseCaseStep,
    InfluencerEthnicityStep,
    InfluencerAgeStep,
    InfluencerSkinColorStep,
    HyperRealisticSkinStep,
    InfluencerEyeColorStep,
    InfluencerSocialProofStep,
    InfluencerHairStyleStep,
    PerfectHandsStep,
    InfluencerFaceShapeStep,
    InfluencerBodyTypeStep,
    ChooseOutfitStep,
    CustomizeOutfitStep,
    CharacterConsistencyVideoStep,
    InfluencerVoiceStep,
    AdvancedCustomizationStep,
    InfluencerAssSizeStep,
    InfluencerBreastTypeStep,
    InfluencerSkinFeaturesStep,
    InfluencerFrecklesStep,
    InfluencerScarsStep,
    InfluencerBeautyMarksStep,
    InfluencerTattoosStep,
    InfluencerPiercingsStep,
    VideoContentIntroStep,
    VideoContentOptionsStep,
    NSFWContentStep,
    NSFWContentPreviewStep,
    LipsyncFeatureStep,
    CharacterGenerationStep,
    AccessInfluencerStep,
    FeatureSummaryStep,
    InfluencerSubscriptionStep,
    PaymentFormStep,
    AllSpotsReservedStep,
} from "@/features/funnel/components/Steps";

export interface StepInfo {
    index: number;
    name: string;
    type?: "input" | "info" | "payment" | "loader" | "social-proof";
    formField?: keyof FunnelSchema | Array<keyof FunnelSchema>;
    component: ComponentType;
}

/**
 * Single source of truth for funnel step configuration.
 * 
 * To reorder steps, simply move the entries in this array.
 * The index property will be automatically updated based on array position.
 */
// Base steps that are always included
const BASE_STEPS: Omit<StepInfo, "index">[] = [
    // Phase 1: Entry & Engagement
    { name: "Choose Creation Method", type: "info", component: ChooseCreationMethodStep },
];

// AI Flow steps (inserted after Choose Creation Method if creation_method === "ai")
const AI_FLOW_STEPS: Omit<StepInfo, "index">[] = [
    { name: "AI Description", type: "input", formField: "ai_description", component: AIDescriptionStep },
    { name: "AI Generation", type: "loader", component: AIGenerationStep },
    { name: "AI Review & Edit", type: "input", component: AIReviewEditStep },
];

// Custom Flow steps (inserted after Choose Creation Method if creation_method === "custom")
const CUSTOM_FLOW_STEPS: Omit<StepInfo, "index">[] = [
    { name: "Custom Prompts", type: "input", formField: ["custom_appearance_prompt", "custom_identity_prompt"], component: CustomPromptsStep },
    { name: "Custom Review", type: "info", component: CustomReviewStep },
];

// Presets Flow steps (inserted after Choose Creation Method if creation_method === "presets")
const PRESETS_FLOW_STEPS: Omit<StepInfo, "index">[] = [
    { name: "Partnership Proof", type: "social-proof", component: PartnershipProofStep },
    {
        name: "AI Influencer Experience",
        type: "input",
        formField: "ai_influencer_experience",
        component: AIInfluencerExperienceStep,
    },

    // Phase 2: Basic Setup
    {
        name: "Use Case",
        type: "input",
        formField: "use_cases",
        component: UseCaseStep,
    },
    {
        name: "Choose Ethnicity",
        type: "input",
        formField: "influencer_ethnicity",
        component: InfluencerEthnicityStep,
    },

    // Phase 3: Quality Feature #1 - Early Trust Building
    { name: "Hyper Realistic Skin", type: "info", component: HyperRealisticSkinStep },

    // Phase 4: Basic Appearance
    { name: "Choose Age", type: "input", formField: "influencer_age", component: InfluencerAgeStep },
    {
        name: "Choose Skin Color",
        type: "input",
        formField: "influencer_skin_color",
        component: InfluencerSkinColorStep,
    },
    { name: "Social Proof", type: "social-proof", component: InfluencerSocialProofStep },

    // Phase 5: Facial Features
    {
        name: "Choose Eye Color",
        type: "input",
        formField: "influencer_eye_color",
        component: InfluencerEyeColorStep,
    },
    {
        name: "Hair Style & Color",
        type: "input",
        formField: ["influencer_hair_style", "influencer_hair_color"],
        component: InfluencerHairStyleStep,
    },
    {
        name: "Face Shape",
        type: "input",
        formField: "influencer_face_shape",
        component: InfluencerFaceShapeStep,
    },
    // Character Consistency placed between input steps
    { name: "Character Consistency Video", type: "info", component: CharacterConsistencyVideoStep },

    // Phase 6: Skin Details (grouped together)
    {
        name: "Freckles",
        type: "input",
        formField: "influencer_freckles",
        component: InfluencerFrecklesStep,
    },
    {
        name: "Scars",
        type: "input",
        formField: "influencer_scars",
        component: InfluencerScarsStep,
    },
    {
        name: "Beauty Marks",
        type: "input",
        formField: "influencer_beauty_marks",
        component: InfluencerBeautyMarksStep,
    },

    // Phase 7: Quality Feature #2 - Break after skin details
    { name: "Perfect Hands", type: "info", component: PerfectHandsStep },

    // Phase 8: Body & Style
    {
        name: "Body Type",
        type: "input",
        formField: "influencer_body_type",
        component: InfluencerBodyTypeStep,
    },
    {
        name: "Ass Size",
        type: "input",
        formField: "influencer_ass_size",
        component: InfluencerAssSizeStep,
    },
    {
        name: "Breast Type",
        type: "input",
        formField: "influencer_breast_type",
        component: InfluencerBreastTypeStep,
    },
    {
        name: "Customize Outfit",
        type: "info",
        component: CustomizeOutfitStep,
    },
    {
        name: "Choose Outfit",
        type: "input",
        formField: "influencer_outfit",
        component: ChooseOutfitStep,
    },
    {
        name: "Piercings",
        type: "input",
        formField: "influencer_piercings",
        component: InfluencerPiercingsStep,
    },
    {
        name: "Tattoos",
        type: "input",
        formField: "influencer_tattoos",
        component: InfluencerTattoosStep,
    },

    // Phase 9: Advanced Customization
    { name: "Voice", type: "input", formField: "influencer_voice", component: InfluencerVoiceStep },

    // Phase 10: Content Options
    { name: "Video Content Intro", type: "info", component: VideoContentIntroStep },
    {
        name: "Video Content Options",
        type: "input",
        formField: "video_content_options",
        component: VideoContentOptionsStep,
    },
    { name: "NSFW Content", type: "input", formField: "enable_nsfw", component: NSFWContentStep },
    { name: "NSFW Content Preview", type: "info", component: NSFWContentPreviewStep },

    // Phase 11: Final Features & Generation
    { name: "Lipsync Feature", type: "info", component: LipsyncFeatureStep },
    { name: "Character Generation", type: "loader", component: CharacterGenerationStep },
    { name: "Access Influencer", type: "info", component: AccessInfluencerStep },
    { name: "Feature Summary", type: "info", component: FeatureSummaryStep },
    { name: "Subscription", type: "payment", component: InfluencerSubscriptionStep },
    { name: "Payment", type: "payment", formField: "email", component: PaymentFormStep },
    { name: "All Spots Reserved", type: "info", component: AllSpotsReservedStep },
];

// Common steps that appear before generation (for AI and Custom flows)
const COMMON_PRE_GENERATION_STEPS: Omit<StepInfo, "index">[] = [
    // Phase 10: Content Options
    { name: "Video Content Intro", type: "info", component: VideoContentIntroStep },
    {
        name: "Video Content Options",
        type: "input",
        formField: "video_content_options",
        component: VideoContentOptionsStep,
    },
    { name: "NSFW Content", type: "input", formField: "enable_nsfw", component: NSFWContentStep },
    { name: "NSFW Content Preview", type: "info", component: NSFWContentPreviewStep },
];

// Common steps that appear at the end (after all flows converge)
const COMMON_END_STEPS: Omit<StepInfo, "index">[] = [
    // Phase 11: Final Features & Generation
    { name: "Lipsync Feature", type: "info", component: LipsyncFeatureStep },
    { name: "Character Generation", type: "loader", component: CharacterGenerationStep },
    { name: "Access Influencer", type: "info", component: AccessInfluencerStep },
    { name: "Feature Summary", type: "info", component: FeatureSummaryStep },
    { name: "Subscription", type: "payment", component: InfluencerSubscriptionStep },
    { name: "Payment", type: "payment", formField: "email", component: PaymentFormStep },
    { name: "All Spots Reserved", type: "info", component: AllSpotsReservedStep },
];

/**
 * Build step configuration based on creation method
 */
export function buildFunnelSteps(creationMethod?: "presets" | "ai" | "custom"): Omit<StepInfo, "index">[] {
    const steps: Omit<StepInfo, "index">[] = [...BASE_STEPS];

    if (creationMethod === "ai") {
        steps.push(...AI_FLOW_STEPS);
        // After AI flow, include common pre-generation steps, then generation
        steps.push(...COMMON_PRE_GENERATION_STEPS);
        steps.push(...COMMON_END_STEPS);
    } else if (creationMethod === "custom") {
        steps.push(...CUSTOM_FLOW_STEPS);
        // After custom flow, include common pre-generation steps, then generation
        steps.push(...COMMON_PRE_GENERATION_STEPS);
        steps.push(...COMMON_END_STEPS);
    } else {
        // Default to presets flow (includes all steps)
        steps.push(...PRESETS_FLOW_STEPS);
        steps.push(...COMMON_END_STEPS);
    }

    return steps;
}

/**
 * Generate step configuration with auto-assigned indices based on array position.
 * Uses presets flow by default if creation_method is not provided.
 */
export const FUNNEL_STEPS: StepInfo[] = buildFunnelSteps("presets").map((step, index) => ({
    ...step,
    index,
}));

/**
 * Helper functions to find steps dynamically
 * Note: These functions work with the current step list, which may vary by creation method
 */
export const getStepIndexByName = (name: string, steps: StepInfo[] = FUNNEL_STEPS): number | undefined => {
    const step = steps.find((s) => s.name === name);
    return step?.index;
};

export const getStepIndexByType = (type: StepInfo["type"], steps: StepInfo[] = FUNNEL_STEPS): number[] => {
    return steps.filter((s) => s.type === type).map((s) => s.index);
};

/**
 * Get payment-related step indices (Feature Summary, Subscription, Payment)
 */
export const getPaymentStepIndices = (steps: StepInfo[] = FUNNEL_STEPS) => {
    const featureSummaryIndex = getStepIndexByName("Feature Summary", steps);
    const subscriptionIndex = getStepIndexByName("Subscription", steps);
    const paymentIndex = getStepIndexByName("Payment", steps);

    return {
        featureSummary: featureSummaryIndex,
        subscription: subscriptionIndex,
        payment: paymentIndex,
        all: [featureSummaryIndex, subscriptionIndex, paymentIndex].filter((idx): idx is number => idx !== undefined),
    };
};

