/**
 * Prompt Templates Library
 *
 * Comprehensive collection of prompts for AI influencer content creation.
 * Extracted from AI influencer course and community best practices.
 *
 * Template syntax:
 *   {{character}} - Full character DNA description
 *   {{name}} - Character name/trigger word
 *   {{outfit}} - Outfit description
 *   {{scene}} - Scene/location description
 *   {{pose}} - Pose description
 *   {{expression}} - Facial expression
 *   {{lighting}} - Lighting description
 *
 * Source: docs/research/ai-influencer-course/
 */

import { PromptTemplate } from './types';

/**
 * All prompt templates organized by category
 */
export const promptTemplates: PromptTemplate[] = [
  // ==========================================
  // PORTRAIT TEMPLATES
  // ==========================================
  {
    id: 'portrait-selfie-casual',
    category: 'portrait',
    subcategory: 'selfie',
    name: 'Casual Selfie',
    description: 'Instagram-style casual selfie portrait',
    template:
      'Close-up selfie of {{character}}, natural makeup, amateur photography style, selfie aesthetic, looking at camera with {{expression}}, {{lighting}}',
    negativePrompt:
      'blurry, deformed, ugly, bad anatomy, bad hands, missing fingers, extra fingers, watermark, signature',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['selfie', 'casual', 'instagram', 'portrait'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '1:1',
  },
  {
    id: 'portrait-close-up-beauty',
    category: 'portrait',
    subcategory: 'beauty',
    name: 'Beauty Close-up',
    description: 'High-detail beauty/makeup portrait',
    template:
      'Hyper-realistic close-up portrait of {{character}}, professional beauty photography, perfect skin texture, detailed eyes, {{lighting}}, studio quality',
    negativePrompt:
      'plastic skin, flat lighting, blurry, deformed, bad makeup, unnatural colors',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'facialFeatures'],
    tags: ['beauty', 'close-up', 'professional', 'makeup'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '4:5',
  },
  {
    id: 'portrait-headshot-professional',
    category: 'portrait',
    subcategory: 'professional',
    name: 'Professional Headshot',
    description: 'LinkedIn/professional headshot style',
    template:
      'Professional headshot of {{character}}, business attire, neutral background, confident {{expression}}, corporate photography style, soft studio lighting',
    negativePrompt: 'casual clothes, messy hair, unprofessional, distracting background',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['professional', 'headshot', 'business', 'corporate'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-simple',
    aspectRatio: '1:1',
  },
  {
    id: 'portrait-profile-artistic',
    category: 'portrait',
    subcategory: 'artistic',
    name: 'Artistic Side Profile',
    description: 'Dramatic side profile portrait',
    template:
      '{{character}}, side profile view, dramatic {{lighting}}, artistic photography, moody atmosphere, cinematic composition, {{expression}}',
    negativePrompt: 'frontal view, flat lighting, boring composition',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'facialFeatures'],
    tags: ['artistic', 'profile', 'dramatic', 'cinematic'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '3:4',
  },

  // ==========================================
  // FULL BODY TEMPLATES
  // ==========================================
  {
    id: 'fullbody-standing-casual',
    category: 'fullbody',
    subcategory: 'standing',
    name: 'Casual Standing Pose',
    description: 'Full body casual standing pose',
    template:
      'Full-body shot of {{character}}, {{outfit}}, standing in {{scene}}, relaxed casual pose, {{lighting}}, amateur photography style',
    negativePrompt:
      'cropped body, missing limbs, deformed proportions, bad hands, bad feet',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fullbody', 'standing', 'casual', 'lifestyle'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '9:16',
  },
  {
    id: 'fullbody-sitting-relaxed',
    category: 'fullbody',
    subcategory: 'sitting',
    name: 'Relaxed Sitting Pose',
    description: 'Natural sitting position',
    template:
      'Full-body shot of {{character}}, {{outfit}}, sitting comfortably in {{scene}}, relaxed natural pose, looking at camera, {{lighting}}',
    negativePrompt:
      'awkward pose, unnatural position, cropped, missing limbs, bad proportions',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fullbody', 'sitting', 'relaxed', 'natural'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '4:5',
  },

  // ==========================================
  // LIFESTYLE TEMPLATES
  // ==========================================
  {
    id: 'lifestyle-coffee-shop',
    category: 'lifestyle',
    subcategory: 'daily',
    name: 'Coffee Shop Moment',
    description: 'Influencer at a trendy coffee shop',
    template:
      '{{character}}, {{outfit}}, sitting at a trendy coffee shop, holding a latte, cozy atmosphere, natural window light, Instagram aesthetic, candid moment',
    negativePrompt: 'empty cafe, bad lighting, blurry background, awkward pose',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['lifestyle', 'coffee', 'cafe', 'instagram', 'daily'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '4:5',
  },
  {
    id: 'lifestyle-beach-sunset',
    category: 'lifestyle',
    subcategory: 'travel',
    name: 'Beach Sunset',
    description: 'Golden hour beach scene',
    template:
      '{{character}}, {{outfit}}, walking on sandy beach at sunset, golden hour lighting, ocean waves in background, wind in hair, peaceful expression, travel photography',
    negativePrompt: 'crowded beach, bad weather, flat lighting, stiff pose',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['lifestyle', 'beach', 'sunset', 'travel', 'golden_hour'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '9:16',
  },
  {
    id: 'lifestyle-home-cozy',
    category: 'lifestyle',
    subcategory: 'home',
    name: 'Cozy Home Moment',
    description: 'Relaxing at home aesthetic',
    template:
      '{{character}}, comfortable loungewear, relaxing at home on a cozy couch, soft blankets, warm ambient lighting, reading a book, peaceful atmosphere',
    negativePrompt: 'messy room, harsh lighting, stiff pose, unnatural',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['lifestyle', 'home', 'cozy', 'relaxing', 'indoor'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-simple',
    aspectRatio: '4:5',
  },
  {
    id: 'lifestyle-urban-street',
    category: 'lifestyle',
    subcategory: 'urban',
    name: 'Urban Street Style',
    description: 'City street photography aesthetic',
    template:
      '{{character}}, {{outfit}}, walking on busy city street, urban background, street photography style, confident stride, natural daylight',
    negativePrompt: 'empty street, rural setting, awkward walking pose, blurry',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['lifestyle', 'urban', 'street', 'city', 'walking'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '9:16',
  },

  // ==========================================
  // FASHION TEMPLATES
  // ==========================================
  {
    id: 'fashion-ootd-mirror',
    category: 'fashion',
    subcategory: 'ootd',
    name: 'OOTD Mirror Selfie',
    description: 'Outfit of the day mirror selfie',
    template:
      '{{character}}, {{outfit}}, mirror selfie in bedroom, full outfit visible, holding phone, natural lighting from window, OOTD aesthetic, Instagram fashion',
    negativePrompt: 'messy room, bad mirror, phone covering face, cropped outfit',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fashion', 'ootd', 'mirror', 'selfie', 'outfit'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '9:16',
  },
  {
    id: 'fashion-runway-pose',
    category: 'fashion',
    subcategory: 'editorial',
    name: 'Editorial Fashion Pose',
    description: 'High fashion editorial style',
    template:
      '{{character}}, high fashion {{outfit}}, editorial photography, dramatic pose, studio lighting with shadows, fashion magazine aesthetic, confident expression',
    negativePrompt: 'casual pose, amateur lighting, everyday clothes, boring background',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType', 'facialFeatures'],
    tags: ['fashion', 'editorial', 'high-fashion', 'studio', 'dramatic'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '3:4',
  },
  {
    id: 'fashion-summer-dress',
    category: 'fashion',
    subcategory: 'casual',
    name: 'Summer Dress Look',
    description: 'Light summer outfit photography',
    template:
      '{{character}}, wearing a flowing summer dress, standing in a garden with flowers, soft natural lighting, gentle breeze, happy relaxed expression, summer vibes',
    negativePrompt: 'winter clothes, indoor setting, harsh lighting, stiff pose',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fashion', 'summer', 'dress', 'outdoor', 'garden'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '4:5',
  },
  {
    id: 'fashion-swimwear-beach',
    category: 'fashion',
    subcategory: 'swimwear',
    name: 'Beach Swimwear',
    description: 'Tasteful swimwear photography',
    template:
      '{{character}}, wearing a stylish {{outfit}}, standing on tropical beach, turquoise water background, golden hour lighting, confident pose, vacation vibes',
    negativePrompt: 'crowded beach, bad weather, unflattering angle, cheap swimsuit',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fashion', 'swimwear', 'beach', 'summer', 'vacation'],
    rating: 'suggestive',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '9:16',
  },

  // ==========================================
  // FITNESS TEMPLATES
  // ==========================================
  {
    id: 'fitness-gym-workout',
    category: 'fitness',
    subcategory: 'gym',
    name: 'Gym Workout',
    description: 'Active gym workout scene',
    template:
      '{{character}}, athletic wear, working out in modern gym, using fitness equipment, determined expression, slight sweat, motivational fitness photography',
    negativePrompt: 'lazy pose, bad form, dirty gym, unflattering angle',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fitness', 'gym', 'workout', 'athletic', 'motivation'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '4:5',
  },
  {
    id: 'fitness-yoga-pose',
    category: 'fitness',
    subcategory: 'yoga',
    name: 'Yoga Session',
    description: 'Peaceful yoga practice',
    template:
      '{{character}}, yoga outfit, performing yoga pose on mat, serene outdoor setting, morning sunlight, peaceful expression, wellness aesthetic',
    negativePrompt: 'bad form, indoor gym, harsh lighting, stressed expression',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fitness', 'yoga', 'wellness', 'outdoor', 'peaceful'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '1:1',
  },
  {
    id: 'fitness-progress-mirror',
    category: 'fitness',
    subcategory: 'progress',
    name: 'Fitness Progress Mirror',
    description: 'Gym mirror selfie showing progress',
    template:
      '{{character}}, sports bra and leggings, gym mirror selfie, showing toned physique, good lighting, motivational fitness content, proud expression',
    negativePrompt: 'messy gym, bad lighting, phone covering face, unprofessional',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'bodyType'],
    tags: ['fitness', 'progress', 'mirror', 'motivation', 'gym'],
    rating: 'suggestive',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '9:16',
  },

  // ==========================================
  // SOCIAL MEDIA TEMPLATES
  // ==========================================
  {
    id: 'social-tiktok-reaction',
    category: 'social_media',
    subcategory: 'tiktok',
    name: 'TikTok Reaction Face',
    description: 'Expressive reaction for TikTok content',
    template:
      '{{character}}, casual outfit, exaggerated surprised expression, hand gesture, bright colorful background, TikTok aesthetic, energetic vibe, ring light lighting',
    negativePrompt: 'boring expression, dull background, stiff pose, bad lighting',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['social', 'tiktok', 'reaction', 'expressive', 'fun'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-simple',
    aspectRatio: '9:16',
  },
  {
    id: 'social-instagram-story',
    category: 'social_media',
    subcategory: 'instagram',
    name: 'Instagram Story Candid',
    description: 'Casual candid for Instagram stories',
    template:
      '{{character}}, casual everyday outfit, candid moment, looking slightly away from camera, natural lighting, authentic Instagram story aesthetic, lifestyle moment',
    negativePrompt: 'posed, fake smile, studio lighting, overly edited look',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['social', 'instagram', 'story', 'candid', 'authentic'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-simple',
    aspectRatio: '9:16',
  },

  // ==========================================
  // ARTISTIC TEMPLATES
  // ==========================================
  {
    id: 'artistic-neon-portrait',
    category: 'artistic',
    subcategory: 'neon',
    name: 'Neon Lit Portrait',
    description: 'Dramatic neon lighting portrait',
    template:
      '{{character}}, dramatic neon lighting in pink and blue, urban night setting, cyberpunk aesthetic, moody atmosphere, artistic portrait photography',
    negativePrompt: 'daylight, natural colors, bright happy mood, boring lighting',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'facialFeatures'],
    tags: ['artistic', 'neon', 'cyberpunk', 'night', 'dramatic'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '3:4',
  },
  {
    id: 'artistic-golden-hour',
    category: 'artistic',
    subcategory: 'golden_hour',
    name: 'Golden Hour Portrait',
    description: 'Warm golden hour lighting',
    template:
      '{{character}}, bathed in golden hour sunlight, outdoor setting, warm color palette, dreamy atmosphere, lens flare, artistic portrait photography',
    negativePrompt: 'harsh midday sun, indoor, cold colors, flat lighting',
    requiredDNA: ['age', 'hair', 'eyes', 'skin'],
    tags: ['artistic', 'golden_hour', 'warm', 'outdoor', 'dreamy'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '4:5',
  },
  {
    id: 'artistic-film-noir',
    category: 'artistic',
    subcategory: 'noir',
    name: 'Film Noir Style',
    description: 'Classic film noir aesthetic',
    template:
      '{{character}}, black and white photography, film noir lighting with dramatic shadows, mysterious expression, vintage aesthetic, cinematic portrait',
    negativePrompt: 'colorful, bright lighting, happy expression, modern setting',
    requiredDNA: ['age', 'hair', 'eyes', 'skin', 'facialFeatures'],
    tags: ['artistic', 'noir', 'black_white', 'vintage', 'cinematic'],
    rating: 'sfw',
    recommendedWorkflow: 'z-image-danrisi',
    aspectRatio: '3:4',
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return promptTemplates.filter((t) => t.category === category);
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): PromptTemplate[] {
  return promptTemplates.filter((t) => t.tags.includes(tag));
}

/**
 * Get templates by rating
 */
export function getTemplatesByRating(rating: 'sfw' | 'suggestive' | 'nsfw'): PromptTemplate[] {
  return promptTemplates.filter((t) => t.rating === rating);
}

/**
 * Get a template by ID
 */
export function getTemplateById(id: string): PromptTemplate | undefined {
  return promptTemplates.find((t) => t.id === id);
}

/**
 * Get a random template from a category
 */
export function getRandomTemplate(category?: string): PromptTemplate {
  const filtered = category ? getTemplatesByCategory(category) : promptTemplates;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

