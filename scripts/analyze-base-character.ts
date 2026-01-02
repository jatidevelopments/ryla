/**
 * Analyze Base Character Image
 * Extracts detailed characteristics from the base Ryla character image
 * to use in text prompts for consistent character generation
 */

import * as fs from 'fs';
import * as path from 'path';

const BASE_CHARACTER_PATH = path.join(process.cwd(), 'apps', 'web', 'public', 'characters', 'ryla-base-character.jpeg');

// Based on the image description provided, here are the extracted characteristics
export const RYLA_CHARACTER_DESCRIPTION = {
  // Face & Features
  face: 'young woman, early 20s, photorealistic',
  skin: 'fair, smooth, radiant skin with healthy glow',
  eyes: 'hazel or amber eyes, captivating, prominent catchlights',
  hair: 'long, wavy, dark brown hair, parted slightly to left, cascading over shoulder',
  makeup: 'minimal, natural-looking makeup, glossy lips',
  
  // Body
  bodyType: 'toned, athletic build, healthy physique',
  
  // Style & Clothing (from base image)
  clothing: 'light cream-colored or off-white cropped top with tie-front detail, brown suede or textured jacket',
  accessories: 'small simple hoop earrings, two delicate layered necklaces with small pendants',
  
  // Overall Aesthetic
  style: 'editorial fashion, professional photography, high-end aesthetic',
  quality: 'hyper-realistic, photorealistic, 8K quality, detailed textures, sharp focus',
};

export function getCharacterPrompt(): string {
  return `${RYLA_CHARACTER_DESCRIPTION.face}, ${RYLA_CHARACTER_DESCRIPTION.skin}, ${RYLA_CHARACTER_DESCRIPTION.eyes}, ${RYLA_CHARACTER_DESCRIPTION.hair}, ${RYLA_CHARACTER_DESCRIPTION.bodyType}, ${RYLA_CHARACTER_DESCRIPTION.quality}`;
}

export function getFullCharacterDescription(): string {
  return Object.values(RYLA_CHARACTER_DESCRIPTION).join(', ');
}

if (require.main === module) {
  console.log('🎨 Ryla Base Character Analysis');
  console.log('================================\n');
  console.log('Character Description:');
  console.log(getFullCharacterDescription());
  console.log('\nCharacter Prompt:');
  console.log(getCharacterPrompt());
}

