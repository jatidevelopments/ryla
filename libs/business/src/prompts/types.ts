/**
 * Prompt Library Types
 */

/** Character DNA - consistent traits across all generations */
export interface CharacterDNA {
  /** Character name (trigger word if using LoRA) */
  name: string;
  /** Age range (e.g., "22-year-old") */
  age: string;
  /** Ethnicity/nationality (e.g., "Latina", "Asian", "Caucasian") */
  ethnicity?: string;
  /** Hair description (e.g., "long flowing jet-black hair") */
  hair: string;
  /** Eye description (e.g., "almond-shaped hazel eyes") */
  eyes: string;
  /** Skin tone (e.g., "pale skin", "tanned skin") */
  skin: string;
  /** Body type (e.g., "slim", "curvy", "athletic") */
  bodyType?: string;
  /** Facial features (e.g., "full lips, round jawline") */
  facialFeatures?: string;
  /** Overall style (e.g., "Instagram influencer", "fitness model") */
  style?: string;
}

/** Prompt template with placeholders */
export interface PromptTemplate {
  /** Unique identifier */
  id: string;
  /** Category for organization */
  category: PromptCategory;
  /** Subcategory for finer organization */
  subcategory: string;
  /** Human-readable name */
  name: string;
  /** Description of what this prompt generates */
  description: string;
  /** The actual prompt template with {{placeholders}} */
  template: string;
  /** Suggested negative prompt */
  negativePrompt?: string;
  /** Required character DNA fields */
  requiredDNA: (keyof CharacterDNA)[];
  /** Tags for filtering */
  tags: string[];
  /** Content rating */
  rating: 'sfw' | 'suggestive' | 'nsfw';
  /** Recommended workflow to use */
  recommendedWorkflow?: string;
  /** Recommended aspect ratio */
  aspectRatio?: '1:1' | '9:16' | '16:9' | '4:5' | '3:4';
}

/** Prompt categories */
export type PromptCategory =
  | 'portrait'
  | 'fullbody'
  | 'lifestyle'
  | 'fashion'
  | 'fitness'
  | 'social_media'
  | 'artistic'
  | 'video_reference';

/** Scene/environment options */
export interface SceneOptions {
  location: string;
  lighting: string;
  time: 'day' | 'night' | 'golden_hour' | 'blue_hour' | 'studio';
  weather?: string;
  mood?: string;
}

/** Outfit options */
export interface OutfitOptions {
  type: string;
  color?: string;
  style?: string;
  brand?: string;
}

/** Pose options */
export interface PoseOptions {
  type: 'standing' | 'sitting' | 'lying' | 'walking' | 'action';
  angle: 'front' | 'side' | 'back' | '3/4' | 'overhead';
  expression: string;
  eyeContact: boolean;
}

/** Complete prompt build options */
export interface PromptBuildOptions {
  /** Character DNA (required) */
  character: CharacterDNA;
  /** Template ID or inline template */
  template: string;
  /** Scene options */
  scene?: Partial<SceneOptions>;
  /** Outfit options */
  outfit?: Partial<OutfitOptions>;
  /** Pose options */
  pose?: Partial<PoseOptions>;
  /** Additional details to append */
  additionalDetails?: string[];
  /** Style modifiers */
  styleModifiers?: string[];
}

/** Built prompt ready for workflow */
export interface BuiltPrompt {
  /** The final positive prompt */
  prompt: string;
  /** The final negative prompt */
  negativePrompt: string;
  /** Recommended settings */
  recommended: {
    workflow: string;
    aspectRatio: string;
    steps?: number;
    cfg?: number;
  };
}

