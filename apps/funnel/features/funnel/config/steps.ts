import { ComponentType } from "react";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import {
    ChooseCreationMethodStep,
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
export const FUNNEL_STEPS_CONFIG: Omit<StepInfo, "index">[] = [
    // Phase 1: Entry & Engagement
    { name: "Choose Creation Method", type: "info", component: ChooseCreationMethodStep },
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

/**
 * Generate step configuration with auto-assigned indices based on array position.
 */
export const FUNNEL_STEPS: StepInfo[] = FUNNEL_STEPS_CONFIG.map((step, index) => ({
    ...step,
    index,
}));

/**
 * Helper functions to find steps dynamically
 */
export const getStepIndexByName = (name: string): number | undefined => {
    const step = FUNNEL_STEPS.find((s) => s.name === name);
    return step?.index;
};

export const getStepIndexByType = (type: StepInfo["type"]): number[] => {
    return FUNNEL_STEPS.filter((s) => s.type === type).map((s) => s.index);
};

/**
 * Get payment-related step indices (Feature Summary, Subscription, Payment)
 */
export const getPaymentStepIndices = () => {
    const featureSummaryIndex = getStepIndexByName("Feature Summary");
    const subscriptionIndex = getStepIndexByName("Subscription");
    const paymentIndex = getStepIndexByName("Payment");

    return {
        featureSummary: featureSummaryIndex,
        subscription: subscriptionIndex,
        payment: paymentIndex,
        all: [featureSummaryIndex, subscriptionIndex, paymentIndex].filter((idx): idx is number => idx !== undefined),
    };
};

