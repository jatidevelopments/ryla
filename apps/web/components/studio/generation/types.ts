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
  category: 'standing' | 'sitting' | 'lying' | 'action' | 'expressive';
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
  outfit: string | null | import('@ryla/shared').OutfitComposition; // Outfit selection (legacy string or new composition)
  objects: SelectedObject[]; // Up to 3 objects for composition
  nsfw?: boolean; // Adult content generation toggle (Studio-level, separate from influencer-level)
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
  outfit: null,
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
export function getAIModelsForMode(
  mode: StudioMode,
  options?: { nsfwEnabled?: boolean; mvpOnly?: boolean }
): AIModel[] {
  return getModelsForStudioMode(mode, {
    nsfwEnabled: options?.nsfwEnabled,
    mvpOnly: options?.mvpOnly ?? true, // Default to MVP only for minimal selection
  }).map(modelDefinitionToAIModel);
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
  // Camera Presets
  { id: 'polaroid', name: 'Polaroid', thumbnail: '/styles/polaroid.webp', category: 'camera' },
  { id: 'disposable-camera', name: 'Disposable Camera', thumbnail: '/styles/disposable-camera.webp', category: 'camera' },
  { id: 'film-grain', name: 'Film Grain', thumbnail: '/styles/film-grain.webp', category: 'camera' },
  { id: 'gopro', name: 'GoPro', thumbnail: '/styles/gopro.webp', category: 'camera' },
  { id: 'vintage-camera', name: 'Vintage Camera', thumbnail: '/styles/vintage-camera.webp', category: 'camera' },
  // Social Media Trends
  { id: 'cottagecore', name: 'Cottagecore', thumbnail: '/styles/cottagecore.webp', category: 'trending' },
  { id: 'dark-academia', name: 'Dark Academia', thumbnail: '/styles/dark-academia.webp', category: 'artistic' },
  { id: 'light-academia', name: 'Light Academia', thumbnail: '/styles/light-academia.webp', category: 'artistic' },
  { id: 'clean-girl', name: 'Clean Girl', thumbnail: '/styles/clean-girl.webp', category: 'beauty' },
  { id: 'indie-sleaze', name: 'Indie Sleaze', thumbnail: '/styles/indie-sleaze.webp', category: 'tiktok' },
  { id: 'coquette', name: 'Coquette', thumbnail: '/styles/coquette.webp', category: 'instagram' },
  { id: 'minimalist', name: 'Minimalist', thumbnail: '/styles/minimalist.webp', category: 'artistic' },
  { id: 'maximalist', name: 'Maximalist', thumbnail: '/styles/maximalist.webp', category: 'artistic' },
  // Artistic
  { id: 'watercolor', name: 'Watercolor', thumbnail: '/styles/watercolor.webp', category: 'artistic' },
  { id: 'oil-painting', name: 'Oil Painting', thumbnail: '/styles/oil-painting.webp', category: 'artistic' },
  { id: 'sketch', name: 'Sketch', thumbnail: '/styles/sketch.webp', category: 'artistic' },
  { id: 'pop-art', name: 'Pop Art', thumbnail: '/styles/pop-art.webp', category: 'artistic' },
  { id: 'cyberpunk', name: 'Cyberpunk', thumbnail: '/styles/cyberpunk.webp', category: 'surreal' },
  { id: 'steampunk', name: 'Steampunk', thumbnail: '/styles/steampunk.webp', category: 'surreal' },
  // Mood
  { id: 'dreamy', name: 'Dreamy', thumbnail: '/styles/dreamy.webp', category: 'mood' },
  { id: 'moody-dark', name: 'Moody Dark', thumbnail: '/styles/moody-dark.webp', category: 'mood' },
  { id: 'pastel', name: 'Pastel', thumbnail: '/styles/pastel.webp', category: 'mood' },
  { id: 'high-contrast', name: 'High Contrast', thumbnail: '/styles/high-contrast.webp', category: 'mood' },
  { id: 'monochrome', name: 'Monochrome', thumbnail: '/styles/monochrome.webp', category: 'mood' },
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
  // Additional Outdoor scenes
  { id: 'mountain-view', name: 'Mountain View', thumbnail: '/scenes/mountain-view.webp', category: 'nature' },
  { id: 'desert-sunset', name: 'Desert Sunset', thumbnail: '/scenes/desert-sunset.webp', category: 'nature' },
  { id: 'lake-side', name: 'Lakeside', thumbnail: '/scenes/lake-side.webp', category: 'nature' },
  { id: 'urban-park', name: 'Urban Park', thumbnail: '/scenes/urban-park.webp', category: 'nature' },
  { id: 'beach-day', name: 'Beach Day', thumbnail: '/scenes/beach-day.webp', category: 'outdoor' },
  { id: 'snow-scene', name: 'Snow Scene', thumbnail: '/scenes/snow-scene.webp', category: 'nature' },
  // Additional Indoor scenes
  { id: 'modern-kitchen', name: 'Modern Kitchen', thumbnail: '/scenes/modern-kitchen.webp', category: 'indoor' },
  { id: 'home-office', name: 'Home Office', thumbnail: '/scenes/home-office.webp', category: 'indoor' },
  { id: 'bathroom-mirror', name: 'Bathroom Mirror', thumbnail: '/scenes/bathroom-mirror.webp', category: 'indoor' },
  { id: 'library', name: 'Library', thumbnail: '/scenes/library.webp', category: 'indoor' },
  { id: 'art-gallery', name: 'Art Gallery', thumbnail: '/scenes/art-gallery.webp', category: 'indoor' },
  { id: 'boutique-shop', name: 'Boutique Shop', thumbnail: '/scenes/boutique-shop.webp', category: 'indoor' },
  // Additional Urban scenes
  { id: 'subway-station', name: 'Subway Station', thumbnail: '/scenes/subway-station.webp', category: 'urban' },
  { id: 'street-market', name: 'Street Market', thumbnail: '/scenes/street-market.webp', category: 'urban' },
  { id: 'bridge-view', name: 'Bridge View', thumbnail: '/scenes/bridge-view.webp', category: 'urban' },
  { id: 'parking-garage', name: 'Parking Garage', thumbnail: '/scenes/parking-garage.webp', category: 'urban' },
  // Additional Fantasy/Creative scenes
  { id: 'underwater', name: 'Underwater', thumbnail: '/scenes/underwater.webp', category: 'fantasy' },
  { id: 'space-station', name: 'Space Station', thumbnail: '/scenes/space-station.webp', category: 'fantasy' },
  { id: 'medieval-castle', name: 'Medieval Castle', thumbnail: '/scenes/medieval-castle.webp', category: 'fantasy' },
  { id: 'tropical-paradise', name: 'Tropical Paradise', thumbnail: '/scenes/tropical-paradise.webp', category: 'fantasy' },
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
  // Natural Lighting
  { id: 'sunrise', name: 'Sunrise', thumbnail: '/lighting/sunrise.webp', type: 'natural' },
  { id: 'midday', name: 'Midday', thumbnail: '/lighting/midday.webp', type: 'natural' },
  { id: 'cloudy-day', name: 'Cloudy Day', thumbnail: '/lighting/cloudy-day.webp', type: 'natural' },
  { id: 'stormy', name: 'Stormy', thumbnail: '/lighting/stormy.webp', type: 'natural' },
  // Studio Lighting
  { id: 'beauty-dish', name: 'Beauty Dish', thumbnail: '/lighting/beauty-dish.webp', type: 'studio' },
  { id: 'butterfly', name: 'Butterfly', thumbnail: '/lighting/butterfly.webp', type: 'studio' },
  { id: 'rim-light', name: 'Rim Light', thumbnail: '/lighting/rim-light.webp', type: 'studio' },
  { id: 'split-light', name: 'Split Light', thumbnail: '/lighting/split-light.webp', type: 'studio' },
  // Creative Lighting
  { id: 'firelight', name: 'Firelight', thumbnail: '/lighting/firelight.webp', type: 'dramatic' },
  { id: 'candlelight', name: 'Candlelight', thumbnail: '/lighting/candlelight.webp', type: 'dramatic' },
  { id: 'strobe', name: 'Strobe', thumbnail: '/lighting/strobe.webp', type: 'dramatic' },
  { id: 'colored-gel', name: 'Colored Gel', thumbnail: '/lighting/colored-gel.webp', type: 'neon' },
  { id: 'sunset-glow', name: 'Sunset Glow', thumbnail: '/lighting/sunset-glow.webp', type: 'golden-hour' },
  { id: 'moonlight', name: 'Moonlight', thumbnail: '/lighting/moonlight.webp', type: 'natural' },
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
  { id: 'action-jumping', name: 'Jumping', icon: '🦘', prompt: 'mid-jump energetic pose', category: 'action', thumbnail: '/poses/action-jumping.webp' },
  { id: 'action-running', name: 'Running', icon: '🏃', prompt: 'running motion dynamic pose', category: 'action', thumbnail: '/poses/action-running.webp' },
  { id: 'action-yoga', name: 'Yoga', icon: '🧘', prompt: 'yoga pose peaceful', category: 'action', thumbnail: '/poses/action-yoga.webp' },
  { id: 'action-sports', name: 'Sports', icon: '⚽', prompt: 'sports pose dynamic', category: 'action', thumbnail: '/poses/action-sports.webp' },
  // Additional Standing poses
  { id: 'standing-arms-crossed', name: 'Arms Crossed', icon: '🤝', prompt: 'arms crossed confident defensive', category: 'standing', thumbnail: '/poses/standing-arms-crossed.webp' },
  { id: 'standing-hands-pocket', name: 'Hands Pocket', icon: '👖', prompt: 'hands in pockets casual', category: 'standing', thumbnail: '/poses/standing-hands-pocket.webp' },
  { id: 'standing-pointing', name: 'Pointing', icon: '👉', prompt: 'pointing at something engaging', category: 'standing', thumbnail: '/poses/standing-pointing.webp' },
  { id: 'standing-waving', name: 'Waving', icon: '👋', prompt: 'waving hello friendly', category: 'standing', thumbnail: '/poses/standing-waving.webp' },
  { id: 'standing-thinking', name: 'Thinking', icon: '🤔', prompt: 'hand on chin thoughtful', category: 'standing', thumbnail: '/poses/standing-thinking.webp' },
  // Additional Sitting poses
  { id: 'sitting-edge', name: 'Edge', icon: '🪑', prompt: 'sitting on edge alert', category: 'sitting', thumbnail: '/poses/sitting-edge.webp' },
  { id: 'sitting-backward', name: 'Backward', icon: '🪑', prompt: 'sitting backward playful', category: 'sitting', thumbnail: '/poses/sitting-backward.webp' },
  { id: 'sitting-reading', name: 'Reading', icon: '📖', prompt: 'reading book phone relaxed', category: 'sitting', thumbnail: '/poses/sitting-reading.webp' },
  { id: 'sitting-working', name: 'Working', icon: '💼', prompt: 'at desk table professional', category: 'sitting', thumbnail: '/poses/sitting-working.webp' },
  // Expressive poses
  { id: 'expressive-laughing', name: 'Laughing', icon: '😂', prompt: 'laughing joyful expression', category: 'expressive', thumbnail: '/poses/expressive-laughing.webp' },
  { id: 'expressive-thinking', name: 'Thinking', icon: '🤔', prompt: 'thinking pose contemplative', category: 'expressive', thumbnail: '/poses/expressive-thinking.webp' },
  { id: 'expressive-surprised', name: 'Surprised', icon: '😲', prompt: 'surprised expression animated', category: 'expressive', thumbnail: '/poses/expressive-surprised.webp' },
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
  // Sexual Positions (from MDC)
  { id: 'adult-pov-missionary', name: 'POV Missionary', icon: '🔥', prompt: 'POV missionary sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-pov-missionary.webp' },
  { id: 'adult-sideview-missionary', name: 'Sideview Missionary', icon: '🔥', prompt: 'sideview missionary sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-sideview-missionary.webp' },
  { id: 'adult-anal-missionary', name: 'Anal Missionary', icon: '🔥', prompt: 'anal missionary sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-anal-missionary.webp' },
  { id: 'adult-cowgirl', name: 'Cowgirl', icon: '🔥', prompt: 'cowgirl position', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-cowgirl.webp' },
  { id: 'adult-pov-cowgirl', name: 'POV Cowgirl', icon: '🔥', prompt: 'POV cowgirl position', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-pov-cowgirl.webp' },
  { id: 'adult-sideview-cowgirl', name: 'Sideview Cowgirl', icon: '🔥', prompt: 'sideview cowgirl position', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-sideview-cowgirl.webp' },
  { id: 'adult-reverse-cowgirl', name: 'Reverse Cowgirl', icon: '🔥', prompt: 'reverse cowgirl position', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-reverse-cowgirl.webp' },
  { id: 'adult-doggystyle', name: 'Doggystyle', icon: '🔥', prompt: 'doggystyle sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-doggystyle.webp' },
  { id: 'adult-pov-doggystyle', name: 'POV Doggystyle', icon: '🔥', prompt: 'POV doggystyle sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-pov-doggystyle.webp' },
  { id: 'adult-sideview-doggystyle', name: 'Sideview Doggystyle', icon: '🔥', prompt: 'sideview doggystyle sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-sideview-doggystyle.webp' },
  { id: 'adult-frontview-doggystyle', name: 'Frontview Doggystyle', icon: '🔥', prompt: 'frontview doggystyle sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-frontview-doggystyle.webp' },
  { id: 'adult-spooning', name: 'Spooning', icon: '🔥', prompt: 'spooning side lying sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-spooning.webp' },
  { id: 'adult-lotus-position', name: 'Lotus Position', icon: '🔥', prompt: 'lotus position sex', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-lotus-position.webp' },
  { id: 'adult-amazon-position', name: 'Amazon Position', icon: '🔥', prompt: 'amazon position sex', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-amazon-position.webp' },
  { id: 'adult-mating-press', name: 'Mating Press', icon: '🔥', prompt: 'mating press position', category: 'lying', isAdult: true, thumbnail: '/poses/adult-mating-press.webp' },
  { id: 'adult-face-down-ass-up', name: 'Face Down Ass Up', icon: '🔥', prompt: 'face down ass up position', category: 'lying', isAdult: true, thumbnail: '/poses/adult-face-down-ass-up.webp' },
  { id: 'adult-foot-focus-missionary', name: 'Foot Focus Missionary', icon: '🔥', prompt: 'foot focus missionary', category: 'lying', isAdult: true, thumbnail: '/poses/adult-foot-focus-missionary.webp' },
  { id: 'adult-orgy-missionary', name: 'Orgy Missionary', icon: '🔥', prompt: 'orgy missionary', category: 'lying', isAdult: true, thumbnail: '/poses/adult-orgy-missionary.webp' },
  { id: 'adult-full-nelson', name: 'Full Nelson', icon: '🔥', prompt: 'full nelson position', category: 'standing', isAdult: true, thumbnail: '/poses/adult-full-nelson.webp' },
  { id: 'adult-double-penetration', name: 'Double Penetration', icon: '🔥', prompt: 'double penetration', category: 'lying', isAdult: true, thumbnail: '/poses/adult-double-penetration.webp' },
  { id: 'adult-cheek-fuck', name: 'Cheek Fuck', icon: '🔥', prompt: 'cheek fuck insertion', category: 'lying', isAdult: true, thumbnail: '/poses/adult-cheek-fuck.webp' },
  { id: 'adult-thigh-sex', name: 'Thigh Sex', icon: '🔥', prompt: 'thigh sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-thigh-sex.webp' },
  // Oral (from MDC)
  { id: 'adult-blowjob', name: 'Blowjob', icon: '🔥', prompt: 'blowjob deepthroat', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-blowjob.webp' },
  { id: 'adult-deepthroat', name: 'Deepthroat', icon: '🔥', prompt: 'deepthroat oral sex', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-deepthroat.webp' },
  { id: 'adult-sloppy-facefuck', name: 'Sloppy Facefuck', icon: '🔥', prompt: 'sloppy facefuck', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-sloppy-facefuck.webp' },
  { id: 'adult-cunnilingus', name: 'Cunnilingus', icon: '🔥', prompt: 'cunnilingus oral sex', category: 'lying', isAdult: true, thumbnail: '/poses/adult-cunnilingus.webp' },
  { id: 'adult-lesbian-analingus', name: 'Lesbian Analingus', icon: '🔥', prompt: 'lesbian analingus', category: 'lying', isAdult: true, thumbnail: '/poses/adult-lesbian-analingus.webp' },
  { id: 'adult-oral-insertion', name: 'Oral Insertion', icon: '🔥', prompt: 'oral insertion', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-oral-insertion.webp' },
  { id: 'adult-pov-insertion', name: 'POV Insertion', icon: '🔥', prompt: 'POV insertion', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-pov-insertion.webp' },
  { id: 'adult-cum-in-mouth', name: 'Cum in Mouth', icon: '🔥', prompt: 'cum in mouth', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-cum-in-mouth.webp' },
  { id: 'adult-double-cum-mouth', name: 'Double Cum Mouth', icon: '🔥', prompt: 'double cum in mouth', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-double-cum-mouth.webp' },
  { id: 'adult-blowbang', name: 'Blowbang', icon: '🔥', prompt: 'blowbang', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-blowbang.webp' },
  // Masturbation (from MDC)
  { id: 'adult-female-masturbation', name: 'Female Masturbation', icon: '🔥', prompt: 'female masturbation', category: 'lying', isAdult: true, thumbnail: '/poses/adult-female-masturbation.webp' },
  { id: 'adult-futa-masturbation', name: 'Futa Masturbation', icon: '🔥', prompt: 'futa masturbation', category: 'lying', isAdult: true, thumbnail: '/poses/adult-futa-masturbation.webp' },
  { id: 'adult-futa-masturbation-cumshot', name: 'Futa Masturbation Cumshot', icon: '🔥', prompt: 'futa masturbation cumshot', category: 'lying', isAdult: true, thumbnail: '/poses/adult-futa-masturbation-cumshot.webp' },
  { id: 'adult-male-masturbation', name: 'Male Masturbation', icon: '🔥', prompt: 'male masturbation cumshot', category: 'standing', isAdult: true, thumbnail: '/poses/adult-male-masturbation.webp' },
  { id: 'adult-male-masturbation-no-cum', name: 'Male Masturbation No Cum', icon: '🔥', prompt: 'male masturbation without cum', category: 'standing', isAdult: true, thumbnail: '/poses/adult-male-masturbation-no-cum.webp' },
  { id: 'adult-fingering-pussy', name: 'Fingering Pussy', icon: '🔥', prompt: 'fingering pussy', category: 'lying', isAdult: true, thumbnail: '/poses/adult-fingering-pussy.webp' },
  { id: 'adult-two-fingers-squirting', name: 'Two Fingers Squirting', icon: '🔥', prompt: 'two fingers squirting', category: 'lying', isAdult: true, thumbnail: '/poses/adult-two-fingers-squirting.webp' },
  { id: 'adult-female-ejaculation', name: 'Female Ejaculation', icon: '🔥', prompt: 'female ejaculation squirt', category: 'lying', isAdult: true, thumbnail: '/poses/adult-female-ejaculation.webp' },
  // Handjobs & Manual (from MDC)
  { id: 'adult-handjob', name: 'Handjob', icon: '🔥', prompt: 'handjob', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-handjob.webp' },
  { id: 'adult-aftersex-handjob', name: 'Aftersex Handjob', icon: '🔥', prompt: 'aftersex handjob cumshot', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-aftersex-handjob.webp' },
  { id: 'adult-balls-sucking-handjob', name: 'Balls Sucking Handjob', icon: '🔥', prompt: 'balls sucking handjob', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-balls-sucking-handjob.webp' },
  { id: 'adult-footjob', name: 'Footjob', icon: '🔥', prompt: 'footjob', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-footjob.webp' },
  { id: 'adult-titjob', name: 'Titjob', icon: '🔥', prompt: 'titjob titfuck', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-titjob.webp' },
  // Breasts (from MDC)
  { id: 'adult-boobs', name: 'Boobs', icon: '🔥', prompt: 'boobs focus', category: 'standing', isAdult: true, thumbnail: '/poses/adult-boobs.webp' },
  { id: 'adult-flashing-boobs', name: 'Flashing Boobs', icon: '🔥', prompt: 'flashing boobs', category: 'standing', isAdult: true, thumbnail: '/poses/adult-flashing-boobs.webp' },
  { id: 'adult-breast-squeeze-lactation', name: 'Breast Squeeze Lactation', icon: '🔥', prompt: 'breast squeeze lactation', category: 'standing', isAdult: true, thumbnail: '/poses/adult-breast-squeeze-lactation.webp' },
  { id: 'adult-licking-breasts', name: 'Licking Breasts', icon: '🔥', prompt: 'licking breasts', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-licking-breasts.webp' },
  { id: 'adult-fondled-boobs', name: 'Fondled Boobs', icon: '🔥', prompt: 'fondled boobs', category: 'standing', isAdult: true, thumbnail: '/poses/adult-fondled-boobs.webp' },
  { id: 'adult-groping-breasts', name: 'Groping Breasts', icon: '🔥', prompt: 'groping massage breasts', category: 'standing', isAdult: true, thumbnail: '/poses/adult-groping-breasts.webp' },
  { id: 'adult-breast-pumping', name: 'Breast Pumping', icon: '🔥', prompt: 'breast pumping', category: 'standing', isAdult: true, thumbnail: '/poses/adult-breast-pumping.webp' },
  { id: 'adult-self-nipple-sucking', name: 'Self Nipple Sucking', icon: '🔥', prompt: 'self nipple sucking', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-self-nipple-sucking.webp' },
  // Anal (from MDC)
  { id: 'adult-anal-insertion', name: 'Anal Insertion', icon: '🔥', prompt: 'anal insertion', category: 'lying', isAdult: true, thumbnail: '/poses/adult-anal-insertion.webp' },
  { id: 'adult-ass-stretch', name: 'Ass Stretch', icon: '🔥', prompt: 'ass stretch', category: 'lying', isAdult: true, thumbnail: '/poses/adult-ass-stretch.webp' },
  { id: 'adult-futa-anal', name: 'Futa Anal', icon: '🔥', prompt: 'futa anal', category: 'lying', isAdult: true, thumbnail: '/poses/adult-futa-anal.webp' },
  // Cumshots (from MDC)
  { id: 'adult-pov-body-cumshot', name: 'POV Body Cumshot', icon: '🔥', prompt: 'POV body cumshot pullout', category: 'lying', isAdult: true, thumbnail: '/poses/adult-pov-body-cumshot.webp' },
  // Other (from MDC)
  { id: 'adult-twerk', name: 'Twerk', icon: '🔥', prompt: 'twerk showing ass', category: 'standing', isAdult: true, thumbnail: '/poses/adult-twerk.webp' },
  { id: 'adult-bouncy-walk', name: 'Bouncy Walk', icon: '🔥', prompt: 'bouncy walk', category: 'standing', isAdult: true, thumbnail: '/poses/adult-bouncy-walk.webp' },
  { id: 'adult-ahegao', name: 'Ahegao', icon: '🔥', prompt: 'ahegao face expression', category: 'standing', isAdult: true, thumbnail: '/poses/adult-ahegao.webp' },
  { id: 'adult-dancing', name: 'Dancing', icon: '🔥', prompt: 'dancing', category: 'standing', isAdult: true, thumbnail: '/poses/adult-dancing.webp' },
  { id: 'adult-flirting', name: 'Flirting', icon: '🔥', prompt: 'flirting', category: 'standing', isAdult: true, thumbnail: '/poses/adult-flirting.webp' },
  { id: 'adult-bath-fun', name: 'Bath Fun', icon: '🔥', prompt: 'bath fun', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-bath-fun.webp' },
  { id: 'adult-dildo-machine', name: 'Dildo Machine', icon: '🔥', prompt: 'dildo machine', category: 'lying', isAdult: true, thumbnail: '/poses/adult-dildo-machine.webp' },
  { id: 'adult-giant-girls', name: 'Giant Girls', icon: '🔥', prompt: 'giant girls', category: 'standing', isAdult: true, thumbnail: '/poses/adult-giant-girls.webp' },
  { id: 'adult-butt-slapping', name: 'Butt Slapping', icon: '🔥', prompt: 'butt slapping', category: 'lying', isAdult: true, thumbnail: '/poses/adult-butt-slapping.webp' },
  { id: 'adult-kissing-lesbian', name: 'Kissing Lesbian', icon: '🔥', prompt: 'kissing passionately lesbian', category: 'standing', isAdult: true, thumbnail: '/poses/adult-kissing-lesbian.webp' },
  { id: 'adult-tribadism', name: 'Tribadism', icon: '🔥', prompt: 'tribadism', category: 'lying', isAdult: true, thumbnail: '/poses/adult-tribadism.webp' },
  { id: 'adult-facesitting', name: 'Facesitting', icon: '🔥', prompt: 'facesitting', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-facesitting.webp' },
  { id: 'adult-sex-smash-cut', name: 'Sex Smash Cut', icon: '🔥', prompt: 'sex smash cut', category: 'lying', isAdult: true, thumbnail: '/poses/adult-sex-smash-cut.webp' },
  { id: 'adult-finger-licking', name: 'Finger Licking', icon: '🔥', prompt: 'finger licking sucking', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-finger-licking.webp' },
  { id: 'adult-side-splits', name: 'Side Splits', icon: '🔥', prompt: 'side splits start', category: 'sitting', isAdult: true, thumbnail: '/poses/adult-side-splits.webp' },
  { id: 'adult-pussy-focus', name: 'Pussy Focus', icon: '🔥', prompt: 'pussy focus', category: 'lying', isAdult: true, thumbnail: '/poses/adult-pussy-focus.webp' },
];

export const ALL_POSES: Pose[] = [...SFW_POSES, ...ADULT_POSES];

export const POSE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'standing', label: 'Standing' },
  { id: 'sitting', label: 'Sitting' },
  { id: 'lying', label: 'Lying' },
  { id: 'action', label: 'Action' },
  { id: 'expressive', label: 'Expressive' },
] as const;

