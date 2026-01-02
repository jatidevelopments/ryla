// Generation types for the studio toolbar

export type AspectRatio = '1:1' | '9:16' | '3:4' | '2:3' | '4:3' | '16:9' | '3:2';

export type Quality = '1.5k' | '2k' | '4k';

export interface QualityOption {
  value: Quality;
  label: string;
  description: string;
  credits: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: 'soul' | 'face-swap' | 'character' | 'google' | 'bytedance' | 'openai' | 'flux' | 'reve' | 'zimage';
  isUnlimited?: boolean;
  isNew?: boolean;
  isPro?: boolean;
}

// Import model registry helpers
import { 
  getAllModels, 
  getModelsForStudioMode,
  type ModelDefinition,
  type UIModelId 
} from '@ryla/shared';

export interface VisualStyle {
  id: string;
  name: string;
  thumbnail: string;
  category: StyleCategory;
}

export type StyleCategory = 
  | 'all'
  | 'trending'
  | 'tiktok'
  | 'instagram'
  | 'camera'
  | 'beauty'
  | 'mood'
  | 'surreal'
  | 'artistic';

export type SceneCategory = 
  | 'outdoor'
  | 'indoor'
  | 'studio'
  | 'urban'
  | 'nature'
  | 'fantasy';

export interface Scene {
  id: string;
  name: string;
  thumbnail: string;
  category: SceneCategory;
}

export type LightingType = 
  | 'natural'
  | 'studio'
  | 'golden-hour'
  | 'neon'
  | 'dramatic'
  | 'soft'
  | 'cinematic';

export interface LightingSetting {
  id: string;
  name: string;
  thumbnail: string;
  type: LightingType;
}

export type StudioMode = 'creating' | 'editing' | 'upscaling' | 'variations';
export type ContentType = 'image' | 'video';

export interface Pose {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  category: 'standing' | 'sitting' | 'lying' | 'action';
  isAdult?: boolean;
  thumbnail?: string; // Path to thumbnail image
}

export interface SelectedObject {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  name?: string;
}

export interface GenerationSettings {
  prompt: string;
  influencerId: string | null;
  aspectRatio: AspectRatio;
  quality: Quality;
  modelId: string;
  styleId: string | null;
  sceneId: string | null;
  lightingId: string | null;
  promptEnhance: boolean;
  batchSize: number;
  mode: StudioMode;
  contentType: ContentType;
  poseId: string | null;
  objects: SelectedObject[]; // Up to 3 objects for composition
}

export const DEFAULT_GENERATION_SETTINGS: GenerationSettings = {
  prompt: '',
  influencerId: null,
  aspectRatio: '1:1',
  quality: '1.5k',
  modelId: 'ryla-soul',
  styleId: null,
  sceneId: null,
  lightingId: null,
  promptEnhance: true,
  batchSize: 1,
  mode: 'creating',
  contentType: 'image',
  poseId: null,
  objects: [],
};

import type { PlatformId } from '@ryla/shared';
import { getPlatformsForAspectRatio } from '@ryla/shared';

export interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  icon: 'square' | 'portrait' | 'landscape';
  platforms?: PlatformId[]; // Supported platforms for this aspect ratio
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { 
    value: '9:16', 
    label: '9:16', 
    icon: 'portrait',
    platforms: getPlatformsForAspectRatio('9:16').map(p => p.id),
  },
  { 
    value: '3:4', 
    label: '3:4', 
    icon: 'portrait',
    platforms: getPlatformsForAspectRatio('3:4').map(p => p.id),
  },
  { 
    value: '2:3', 
    label: '2:3', 
    icon: 'portrait',
    platforms: getPlatformsForAspectRatio('2:3').map(p => p.id),
  },
  { 
    value: '1:1', 
    label: '1:1', 
    icon: 'square',
    platforms: getPlatformsForAspectRatio('1:1').map(p => p.id),
  },
  { 
    value: '4:3', 
    label: '4:3', 
    icon: 'landscape',
    platforms: getPlatformsForAspectRatio('4:3').map(p => p.id),
  },
  { 
    value: '16:9', 
    label: '16:9', 
    icon: 'landscape',
    platforms: getPlatformsForAspectRatio('16:9').map(p => p.id),
  },
  { 
    value: '3:2', 
    label: '3:2', 
    icon: 'landscape',
    platforms: getPlatformsForAspectRatio('3:2').map(p => p.id),
  },
];

/**
 * Quality options with credit costs (×10 scale)
 * Based on @ryla/shared credit pricing:
 * - studio_fast: 20 credits (1.5k)
 * - studio_standard: 50 credits (2k)
 * - studio_batch: 80 credits for 4 images (~20 each for 4k single)
 */
export const QUALITY_OPTIONS: QualityOption[] = [
  { value: '1.5k', label: '1.5k', description: 'Fastest and Cheapest', credits: 20 },
  { value: '2k', label: '2k', description: 'Best Visual Fidelity', credits: 50 },
  { value: '4k', label: '4k', description: 'Ultra High Definition', credits: 80 },
];

/**
 * Convert ModelDefinition to AIModel for UI compatibility
 */
function modelDefinitionToAIModel(model: ModelDefinition): AIModel {
  return {
    id: model.uiId,
    name: model.name,
    description: model.description,
    icon: model.icon as AIModel['icon'],
    isUnlimited: model.isUnlimited,
    isPro: model.isPro,
  };
}

/**
 * Get all available models (for backward compatibility)
 */
export function getAllAIModels(): AIModel[] {
  return getAllModels().map(modelDefinitionToAIModel);
}

/**
 * Get models filtered by Studio mode
 */
export function getAIModelsForMode(mode: StudioMode): AIModel[] {
  return getModelsForStudioMode(mode).map(modelDefinitionToAIModel);
}

/**
 * @deprecated Use getAllAIModels() or getAIModelsForMode() instead
 * Kept for backward compatibility
 */
export const AI_MODELS: AIModel[] = getAllAIModels();

export const STYLE_CATEGORIES: { id: StyleCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'New' },
  { id: 'tiktok', label: 'TikTok Core' },
  { id: 'instagram', label: 'Instagram Aesthetics' },
  { id: 'camera', label: 'Camera Presets' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'mood', label: 'Mood' },
  { id: 'surreal', label: 'Surreal' },
  { id: 'artistic', label: 'Graphic Art' },
];

export const VISUAL_STYLES: VisualStyle[] = [
  { id: 'general', name: 'General', thumbnail: '/styles/general.webp', category: 'all' },
  { id: 'iphone', name: 'iPhone', thumbnail: '/styles/iphone.webp', category: 'camera' },
  { id: 'realistic', name: 'Realistic', thumbnail: '/styles/realistic.webp', category: 'all' },
  { id: 'digitalcam', name: 'Digital Cam', thumbnail: '/styles/digitalcam.webp', category: 'camera' },
  { id: 'sunset-beach', name: 'Sunset Beach', thumbnail: '/styles/sunset-beach.webp', category: 'mood' },
  { id: 'mt-fuji', name: 'Mt. Fuji', thumbnail: '/styles/mt-fuji.webp', category: 'mood' },
  { id: 'flight-mode', name: 'Flight Mode', thumbnail: '/styles/flight-mode.webp', category: 'instagram' },
  { id: 'street-view', name: 'Street View', thumbnail: '/styles/street-view.webp', category: 'tiktok' },
  { id: 'bimbocore', name: 'Bimbocore', thumbnail: '/styles/bimbocore.webp', category: 'instagram' },
  { id: 'tokyo-street', name: 'Tokyo Streetstyle', thumbnail: '/styles/tokyo-street.webp', category: 'tiktok' },
  { id: 'cctv', name: 'CCTV', thumbnail: '/styles/cctv.webp', category: 'camera' },
  { id: 'elevator-mirror', name: 'Elevator Mirror', thumbnail: '/styles/elevator-mirror.webp', category: 'instagram' },
  { id: 'ringselfie', name: 'Ring Selfie', thumbnail: '/styles/ringselfie.webp', category: 'beauty' },
  { id: 'y2k', name: 'Y2K', thumbnail: '/styles/y2k.webp', category: 'artistic' },
  { id: 'vaporwave', name: 'Vaporwave', thumbnail: '/styles/vaporwave.webp', category: 'surreal' },
  { id: 'golden-hour', name: 'Golden Hour', thumbnail: '/styles/golden-hour.webp', category: 'mood' },
  { id: 'neon-nights', name: 'Neon Nights', thumbnail: '/styles/neon-nights.webp', category: 'mood' },
  { id: 'soft-glam', name: 'Soft Glam', thumbnail: '/styles/soft-glam.webp', category: 'beauty' },
  { id: 'editorial', name: 'Editorial', thumbnail: '/styles/editorial.webp', category: 'instagram' },
  { id: 'retro-film', name: 'Retro Film', thumbnail: '/styles/retro-film.webp', category: 'camera' },
];

export const SCENE_CATEGORIES: { id: SceneCategory; label: string }[] = [
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'indoor', label: 'Indoor' },
  { id: 'studio', label: 'Studio' },
  { id: 'urban', label: 'Urban' },
  { id: 'nature', label: 'Nature' },
  { id: 'fantasy', label: 'Fantasy' },
];

export const SCENES: Scene[] = [
  { id: 'beach-sunset', name: 'Beach Sunset', thumbnail: '/scenes/beach-sunset.webp', category: 'nature' },
  { id: 'city-rooftop', name: 'City Rooftop', thumbnail: '/scenes/city-rooftop.webp', category: 'urban' },
  { id: 'cozy-cafe', name: 'Cozy Café', thumbnail: '/scenes/cozy-cafe.webp', category: 'indoor' },
  { id: 'white-studio', name: 'White Studio', thumbnail: '/scenes/white-studio.webp', category: 'studio' },
  { id: 'neon-alley', name: 'Neon Alley', thumbnail: '/scenes/neon-alley.webp', category: 'urban' },
  { id: 'forest-path', name: 'Forest Path', thumbnail: '/scenes/forest-path.webp', category: 'nature' },
  { id: 'luxury-bedroom', name: 'Luxury Bedroom', thumbnail: '/scenes/luxury-bedroom.webp', category: 'indoor' },
  { id: 'gym', name: 'Gym', thumbnail: '/scenes/gym.webp', category: 'indoor' },
  { id: 'pool-party', name: 'Pool Party', thumbnail: '/scenes/pool-party.webp', category: 'outdoor' },
  { id: 'paris-street', name: 'Paris Street', thumbnail: '/scenes/paris-street.webp', category: 'urban' },
  { id: 'japanese-garden', name: 'Japanese Garden', thumbnail: '/scenes/japanese-garden.webp', category: 'nature' },
  { id: 'dark-studio', name: 'Dark Studio', thumbnail: '/scenes/dark-studio.webp', category: 'studio' },
  { id: 'cyberpunk-city', name: 'Cyberpunk City', thumbnail: '/scenes/cyberpunk-city.webp', category: 'fantasy' },
  { id: 'enchanted-forest', name: 'Enchanted Forest', thumbnail: '/scenes/enchanted-forest.webp', category: 'fantasy' },
];

export const LIGHTING_SETTINGS: LightingSetting[] = [
  { id: 'natural-daylight', name: 'Natural Daylight', thumbnail: '/lighting/natural-daylight.webp', type: 'natural' },
  { id: 'golden-hour', name: 'Golden Hour', thumbnail: '/lighting/golden-hour.webp', type: 'golden-hour' },
  { id: 'blue-hour', name: 'Blue Hour', thumbnail: '/lighting/blue-hour.webp', type: 'natural' },
  { id: 'studio-softbox', name: 'Studio Softbox', thumbnail: '/lighting/studio-softbox.webp', type: 'studio' },
  { id: 'ring-light', name: 'Ring Light', thumbnail: '/lighting/ring-light.webp', type: 'studio' },
  { id: 'neon-glow', name: 'Neon Glow', thumbnail: '/lighting/neon-glow.webp', type: 'neon' },
  { id: 'dramatic-shadows', name: 'Dramatic Shadows', thumbnail: '/lighting/dramatic-shadows.webp', type: 'dramatic' },
  { id: 'soft-diffused', name: 'Soft Diffused', thumbnail: '/lighting/soft-diffused.webp', type: 'soft' },
  { id: 'cinematic-moody', name: 'Cinematic Moody', thumbnail: '/lighting/cinematic-moody.webp', type: 'cinematic' },
  { id: 'backlit-silhouette', name: 'Backlit Silhouette', thumbnail: '/lighting/backlit-silhouette.webp', type: 'dramatic' },
];

// Pose definitions
export const SFW_POSES: Pose[] = [
  // Standing poses
  { id: 'standing-casual', name: 'Casual', icon: '👤', prompt: 'relaxed casual standing pose', category: 'standing', thumbnail: '/poses/standing-casual.webp' },
  { id: 'standing-confident', name: 'Confident', icon: '💪', prompt: 'confident power stance', category: 'standing', thumbnail: '/poses/standing-confident.webp' },
  { id: 'standing-walking', name: 'Walking', icon: '🚶', prompt: 'natural walking mid-stride', category: 'standing', thumbnail: '/poses/standing-walking.webp' },
  { id: 'standing-leaning', name: 'Leaning', icon: '🧍', prompt: 'casually leaning against wall', category: 'standing', thumbnail: '/poses/standing-leaning.webp' },
  // Sitting poses
  { id: 'sitting-relaxed', name: 'Relaxed', icon: '🪑', prompt: 'relaxed sitting position', category: 'sitting', thumbnail: '/poses/sitting-relaxed.webp' },
  { id: 'sitting-cross', name: 'Cross-legged', icon: '🧘', prompt: 'sitting cross-legged', category: 'sitting', thumbnail: '/poses/sitting-cross.webp' },
  { id: 'sitting-perched', name: 'Perched', icon: '✨', prompt: 'perched on edge elegantly', category: 'sitting', thumbnail: '/poses/sitting-perched.webp' },
  { id: 'sitting-lounging', name: 'Lounging', icon: '🛋️', prompt: 'lounging comfortably', category: 'sitting', thumbnail: '/poses/sitting-lounging.webp' },
  // Action poses
  { id: 'action-dancing', name: 'Dancing', icon: '💃', prompt: 'dynamic dancing movement', category: 'action', thumbnail: '/poses/action-dancing.webp' },
  { id: 'action-stretching', name: 'Stretching', icon: '🤸', prompt: 'graceful stretching pose', category: 'action', thumbnail: '/poses/action-stretching.webp' },
  { id: 'action-exercising', name: 'Exercising', icon: '🏋️', prompt: 'active workout pose', category: 'action', thumbnail: '/poses/action-exercising.webp' },
  { id: 'action-playing', name: 'Playing', icon: '🎮', prompt: 'playful action pose', category: 'action', thumbnail: '/poses/action-playing.webp' },
];

export const ADULT_POSES: Pose[] = [
  // Standing poses
  { id: 'adult-standing-seductive', name: 'Seductive', icon: '🔥', prompt: 'seductive standing pose', category: 'standing', isAdult: true, thumbnail: '/poses/adult-standing-seductive.webp' },
  { id: 'adult-standing-alluring', name: 'Alluring', icon: '💋', prompt: 'alluring confident pose', category: 'standing', isAdult: true, thumbnail: '/poses/adult-standing-alluring.webp' },
  { id: 'adult-standing-sensual', name: 'Sensual', icon: '🌹', prompt: 'sensual standing pose', category: 'standing', isAdult: true, thumbnail: '/poses/adult-standing-sensual.webp' },
  // Sitting poses
  { id: 'adult-sitting-sensual', name: 'Sensual', icon: '🌹', prompt: 'sensual sitting position', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-sitting-sensual.webp' },
  { id: 'adult-sitting-suggestive', name: 'Suggestive', icon: '✨', prompt: 'suggestive perched pose', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-sitting-suggestive.webp' },
  { id: 'adult-sitting-elegant', name: 'Elegant', icon: '💫', prompt: 'elegant sensual sitting pose', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-sitting-elegant.webp' },
  // Lying poses
  { id: 'adult-lying-elegant', name: 'Elegant', icon: '🛏️', prompt: 'elegant reclining pose', category: 'lying', isAdult: true, thumbnail: '/poses/adult-lying-elegant.webp' },
  { id: 'adult-lying-alluring', name: 'Alluring', icon: '💫', prompt: 'alluring reclining pose', category: 'lying', isAdult: true, thumbnail: '/poses/adult-lying-alluring.webp' },
  { id: 'adult-lying-sensual', name: 'Sensual', icon: '🌹', prompt: 'sensual reclining pose', category: 'lying', isAdult: true, thumbnail: '/poses/adult-lying-sensual.webp' },
];

export const ALL_POSES: Pose[] = [...SFW_POSES, ...ADULT_POSES];

export const POSE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'standing', label: 'Standing' },
  { id: 'sitting', label: 'Sitting' },
  { id: 'lying', label: 'Lying' },
  { id: 'action', label: 'Action' },
] as const;

