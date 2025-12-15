import { z } from "zod";

// Base schema for all funnels
export const baseFunnelSchema = z.object({
    funnelType: z.enum(["creator", "fan", "business", "adult"]),
    sessionId: z.string().optional(),
    currentStep: z.number().min(1),
});

// Adult Funnel Schema (based on funnel-adult-v3)
export const adultFunnelSchema = baseFunnelSchema.extend({
    // Connection and relationship data
    connections: z.array(z.string()).min(1, "Please select at least one connection type"),
    preferred_age: z.string().min(1, "Please select preferred age"),
    user_age: z.string().min(1, "Please enter your age"),
    preferred_relationship: z.string().min(1, "Please select relationship type"),

    // Character customization
    style: z.enum(["realistic", "anime"]),
    character_age: z.string().min(1, "Please select character age"),
    personality_traits: z.array(z.string()).min(1, "Please select at least one personality trait"),
    interests: z.array(z.string()).min(1, "Please select at least one interest"),
    ethnicity: z.string().min(1, "Please select ethnicity"),
    your_type: z.array(z.string()).min(1, "Please select your type preferences"),

    // Physical attributes
    body: z.string().min(1, "Please select body type"),
    breast_type: z.string().min(1, "Please select breast type"),
    breast_size: z.string().min(1, "Please select breast size"),
    butt: z.string().min(1, "Please select butt type"),
    eyes: z.string().min(1, "Please select eye color"),
    hair_style: z.string().min(1, "Please select hair style"),
    hair_color: z.string().min(1, "Please select hair color"),

    // NSFW preferences
    receiveSpicyContent: z.boolean(),
    dirtyTalks: z.boolean(),
    turns_of_you: z.array(z.string()).min(1, "Please select what turns you on"),
    want_to_try: z.array(z.string()).min(1, "Please select what you want to try"),
    turns_off_in_dating: z.array(z.string()).min(1, "Please select what turns you off"),

    // Content preferences
    receiveCustomPhotos: z.boolean(),
    receiveVoiceMessages: z.boolean(),
    receiveCustomVideos: z.boolean(),
    receiveVideoCalls: z.boolean(),

    // Character details
    character_relationship: z.string().min(1, "Please select character relationship"),
    scenario: z.string().min(1, "Please select scenario"),
    voice: z.string().min(1, "Please select voice"),

    // User experience
    experience_filings_of_loneliness: z.string().min(1, "Please select loneliness experience"),
    practiceForeignLanguage: z.boolean(),

    // Payment
    productId: z.number().nullable(),
});

// Creator Funnel Schema
export const creatorFunnelSchema = baseFunnelSchema.extend({
    // Basic info
    style: z.enum(["realistic", "anime", "cartoon"]),
    character_name: z.string().min(1, "Please enter character name"),

    // Character customization
    characterData: z.object({
        physical_attributes: z.object({
            ethnicity: z.string(),
            body_type: z.string(),
            hair_style: z.string(),
            hair_color: z.string(),
            eye_color: z.string(),
            age_range: z.string(),
        }),
        personality_traits: z.array(z.string()),
        interests: z.array(z.string()),
        voice_settings: z.object({
            voice_type: z.string(),
            accent: z.string().optional(),
        }),
    }),

    // Content niche
    content_niche: z.array(z.string()).min(1, "Please select at least one content niche"),

    // Monetization
    monetization_platforms: z.array(z.string()).min(1, "Please select at least one platform"),
    revenue_goals: z.string().min(1, "Please select revenue goals"),

    // NSFW preferences
    nsfwPreferences: z.object({
        level: z.number().min(0).max(3),
        categories: z.array(z.string()),
        consent_given: z.boolean(),
        consent_date: z.string().optional(),
    }),

    // Content templates
    content_templates: z.array(z.string()).optional(),

    // Payment
    subscription_plan: z.string().min(1, "Please select a subscription plan"),
});

// Fan Funnel Schema
export const fanFunnelSchema = baseFunnelSchema.extend({
    // Personality quiz results
    personality_type: z.string().min(1, "Please complete personality quiz"),

    // Relationship goals
    relationship_goals: z.array(z.string()).min(1, "Please select relationship goals"),

    // Character preferences
    character_preferences: z.object({
        style: z.enum(["realistic", "anime", "cartoon"]),
        physical_attributes: z.object({
            ethnicity: z.string(),
            body_type: z.string(),
            age_range: z.string(),
        }),
        personality_traits: z.array(z.string()),
        interests: z.array(z.string()),
    }),

    // Interaction preferences
    interaction_preferences: z.object({
        chat: z.boolean(),
        voice: z.boolean(),
        video: z.boolean(),
        photos: z.boolean(),
    }),

    // NSFW content level
    nsfw_content_level: z.number().min(0).max(3),
    nsfw_categories: z.array(z.string()),
    consent_given: z.boolean(),

    // Scenarios
    preferred_scenarios: z.array(z.string()).min(1, "Please select at least one scenario"),

    // Voice preferences
    voice_preferences: z.object({
        voice_type: z.string(),
        accent: z.string().optional(),
    }),

    // Subscription
    subscription_plan: z.string().min(1, "Please select a subscription plan"),
});

// Business Funnel Schema
export const businessFunnelSchema = baseFunnelSchema.extend({
    // Business info
    industry: z.string().min(1, "Please select industry"),
    company_name: z.string().min(1, "Please enter company name"),
    company_size: z.string().min(1, "Please select company size"),

    // Brand alignment
    brand_values: z.array(z.string()).min(1, "Please select brand values"),
    target_audience: z.string().min(1, "Please describe target audience"),

    // Influencer type
    influencer_type: z.enum(["lifestyle", "product_reviewer", "brand_ambassador", "expert"]),

    // Visual identity
    visual_identity: z.object({
        style: z.enum(["realistic", "anime", "cartoon"]),
        brand_colors: z.array(z.string()),
        personality_traits: z.array(z.string()),
    }),

    // Content strategy
    content_strategy: z.object({
        posting_schedule: z.string(),
        content_themes: z.array(z.string()),
        platforms: z.array(z.string()),
    }),

    // NSFW content policy
    nsfw_content_policy: z.object({
        allow_nsfw: z.boolean(),
        content_level: z.number().min(0).max(3),
        restrictions: z.array(z.string()),
    }),

    // Team access
    team_members: z.array(z.object({
        email: z.string().email(),
        role: z.string(),
        permissions: z.array(z.string()),
    })),

    // Analytics
    analytics_requirements: z.array(z.string()),

    // Compliance
    compliance_requirements: z.array(z.string()),

    // Subscription
    enterprise_plan: z.string().min(1, "Please select enterprise plan"),
});

// Validation schemas for individual steps
export const stepValidationSchemas = {
    // Adult funnel steps
    connection: z.object({
        connections: z.array(z.string()).min(1, "Please select at least one connection type"),
    }),

    characterStyle: z.object({
        style: z.enum(["realistic", "anime"]),
    }),

    preferredAge: z.object({
        preferred_age: z.string().min(1, "Please select preferred age"),
    }),

    userAge: z.object({
        user_age: z.string().min(1, "Please enter your age"),
    }),

    personalityTraits: z.object({
        personality_traits: z.array(z.string()).min(1, "Please select at least one personality trait"),
    }),

    interests: z.object({
        interests: z.array(z.string()).min(1, "Please select at least one interest"),
    }),

    ethnicity: z.object({
        ethnicity: z.string().min(1, "Please select ethnicity"),
    }),

    yourType: z.object({
        your_type: z.array(z.string()).min(1, "Please select your type preferences"),
    }),

    spicyCustomContent: z.object({
        receiveSpicyContent: z.boolean(),
    }),

    bodyType: z.object({
        body: z.string().min(1, "Please select body type"),
    }),

    breastType: z.object({
        breast_type: z.string().min(1, "Please select breast type"),
        breast_size: z.string().min(1, "Please select breast size"),
    }),

    buttType: z.object({
        butt: z.string().min(1, "Please select butt type"),
    }),

    eyesColor: z.object({
        eyes: z.string().min(1, "Please select eye color"),
    }),

    haircutStyle: z.object({
        hair_style: z.string().min(1, "Please select hair style"),
        hair_color: z.string().min(1, "Please select hair color"),
    }),

    turnsOfYou: z.object({
        turns_of_you: z.array(z.string()).min(1, "Please select what turns you on"),
    }),

    wantToTry: z.object({
        want_to_try: z.array(z.string()).min(1, "Please select what you want to try"),
    }),

    selectVoice: z.object({
        voice: z.string().min(1, "Please select voice"),
    }),

    whatTurnsOffInDating: z.object({
        turns_off_in_dating: z.array(z.string()).min(1, "Please select what turns you off"),
    }),

    // Creator funnel steps
    styleSelection: z.object({
        style: z.enum(["realistic", "anime", "cartoon"]),
    }),

    characterCustomization: z.object({
        characterData: z.object({
            physical_attributes: z.object({
                ethnicity: z.string(),
                body_type: z.string(),
                hair_style: z.string(),
                hair_color: z.string(),
                eye_color: z.string(),
                age_range: z.string(),
            }),
            personality_traits: z.array(z.string()),
            interests: z.array(z.string()),
        }),
    }),

    contentNicheSelection: z.object({
        content_niche: z.array(z.string()).min(1, "Please select at least one content niche"),
    }),

    monetizationSetup: z.object({
        monetization_platforms: z.array(z.string()).min(1, "Please select at least one platform"),
        revenue_goals: z.string().min(1, "Please select revenue goals"),
    }),

    nsfwContentPreferences: z.object({
        nsfwPreferences: z.object({
            level: z.number().min(0).max(3),
            categories: z.array(z.string()),
            consent_given: z.boolean(),
        }),
    }),

    // Fan funnel steps
    personalityQuiz: z.object({
        personality_type: z.string().min(1, "Please complete personality quiz"),
    }),

    relationshipGoals: z.object({
        relationship_goals: z.array(z.string()).min(1, "Please select relationship goals"),
    }),

    physicalPreferences: z.object({
        character_preferences: z.object({
            physical_attributes: z.object({
                ethnicity: z.string(),
                body_type: z.string(),
                age_range: z.string(),
            }),
        }),
    }),

    interactionPreferences: z.object({
        interaction_preferences: z.object({
            chat: z.boolean(),
            voice: z.boolean(),
            video: z.boolean(),
            photos: z.boolean(),
        }),
    }),

    nsfwContentLevel: z.object({
        nsfw_content_level: z.number().min(0).max(3),
        nsfw_categories: z.array(z.string()),
        consent_given: z.boolean(),
    }),

    scenarioSelection: z.object({
        preferred_scenarios: z.array(z.string()).min(1, "Please select at least one scenario"),
    }),

    // Business funnel steps
    industrySelection: z.object({
        industry: z.string().min(1, "Please select industry"),
    }),

    brandAlignment: z.object({
        brand_values: z.array(z.string()).min(1, "Please select brand values"),
        target_audience: z.string().min(1, "Please describe target audience"),
    }),

    influencerType: z.object({
        influencer_type: z.enum(["lifestyle", "product_reviewer", "brand_ambassador", "expert"]),
    }),

    visualIdentity: z.object({
        visual_identity: z.object({
            style: z.enum(["realistic", "anime", "cartoon"]),
            brand_colors: z.array(z.string()),
            personality_traits: z.array(z.string()),
        }),
    }),

    contentStrategy: z.object({
        content_strategy: z.object({
            posting_schedule: z.string(),
            content_themes: z.array(z.string()),
            platforms: z.array(z.string()),
        }),
    }),

    nsfwContentPolicy: z.object({
        nsfw_content_policy: z.object({
            allow_nsfw: z.boolean(),
            content_level: z.number().min(0).max(3),
            restrictions: z.array(z.string()),
        }),
    }),
};

// Helper function to validate a specific step
export const validateStep = (stepName: string, data: any) => {
    const schema = stepValidationSchemas[stepName as keyof typeof stepValidationSchemas];
    if (!schema) {
        throw new Error(`No validation schema found for step: ${stepName}`);
    }

    try {
        return { success: true, data: schema.parse(data) };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                errors: error.issues.reduce((acc, err) => {
                    const path = err.path.join(".");
                    acc[path] = err.message;
                    return acc;
                }, {} as Record<string, string>),
            };
        }
        throw error;
    }
};
