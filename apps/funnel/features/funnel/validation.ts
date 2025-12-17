import { z } from "zod";

export const funnelV3Schema = z.object({
    // AI Influencer Basic Attributes
    influencer_type: z.string().trim().min(1, { message: "Please, choose the influencer type" }),
    influencer_age: z.coerce.number().min(18).max(50, { message: "Please, choose the influencer age" }),
    influencer_ethnicity: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the influencer ethnicity" }),
    influencer_skin_color: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the influencer skin color" }),
    influencer_eye_color: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the influencer eye color" }),
    influencer_hair_style: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred influencer hair style" }),
    influencer_hair_color: z
        .string()
        .trim()
        .min(1, { message: "Please, select preferred influencer hair color" }),
    influencer_face_shape: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the influencer face shape" }),
    influencer_body_type: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the influencer body type" }),
    influencer_outfit: z.string().trim().optional(),
    influencer_voice: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the influencer voice" }),

    // Advanced Customization
    influencer_ass_size: z.string().trim().min(1, { message: "Please, choose the ass size" }),
    influencer_breast_type: z
        .string()
        .trim()
        .min(1, { message: "Please, choose the breast type" }),

    // Skin Features
    influencer_freckles: z
        .string()
        .trim()
        .min(1, { message: "Please, choose freckles option" }),
    influencer_scars: z
        .string()
        .trim()
        .min(1, { message: "Please, choose scars option" }),
    influencer_beauty_marks: z
        .string()
        .trim()
        .min(1, { message: "Please, choose beauty marks option" }),

    // Body Modifications
    influencer_tattoos: z
        .string()
        .trim()
        .min(1, { message: "Please, choose tattoos option" }),
    influencer_piercings: z
        .string()
        .trim()
        .min(1, { message: "Please, choose piercings option" }),

    // Video Content Options (optional)
    video_content_options: z.array(z.string()).optional(),
    enable_selfies: z.boolean(),
    enable_viral_videos: z.boolean(),
    enable_lipsync: z.boolean(),
    enable_faceswap: z.boolean(),

    // NSFW Content
    enable_nsfw: z.boolean({ required_error: "Please, make your choice" }),

    // Creation Method
    creation_method: z.enum(["presets", "ai", "custom"], {
        required_error: "Please, select a creation method",
        invalid_type_error: "Please, select a valid creation method"
    }),
    upload_own_image: z.boolean().optional(),
    uploaded_image: z.string().optional(),

    // AI Flow Fields
    ai_description: z.string().trim().optional(),
    ai_reference_image: z.string().optional(),
    ai_generated_config: z.any().optional(),

    // Custom Prompts Flow Fields
    custom_appearance_prompt: z.string().trim().optional(),
    custom_identity_prompt: z.string().trim().optional(),
    custom_image_prompt: z.string().trim().optional(),
    custom_advanced_settings: z.any().optional(),

    // Email for payment (no account creation needed)
    email: z.string().email({ message: "Please enter a valid email address" }).min(1, { message: "Email is required" }),

    // Payment fields
    productId: z.number().nullable(),

    // AI Influencer Experience
    ai_influencer_experience: z
        .string()
        .trim()
        .min(1, { message: "Please, select your AI Influencer experience level" }),

    // Use Cases
    use_cases: z.array(z.string()).min(1, { message: "Please, select at least one use case" }),
});
