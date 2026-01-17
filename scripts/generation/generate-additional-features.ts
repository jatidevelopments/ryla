/**
 * Generate Ethnicity-Specific Additional Feature Images using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates ethnicity-specific images for:
 * - Body types (8 types × 7 ethnicities = 56 images)
 * - Breast sizes (4 sizes × 7 ethnicities = 28 images, female only)
 * - Breast types (4 types × 7 ethnicities = 28 images, female only)
 * - Ass sizes (4 sizes × 7 ethnicities = 28 images)
 * - Piercings (6 types × 7 ethnicities = 42 images)
 * - Tattoos (5 types × 7 ethnicities = 35 images)
 * - Skin colors (4 colors × 7 ethnicities = 28 images)
 * - Skin features (11 features × 7 ethnicities = 77 images)
 * 
 * Each image is ethnicity-specific with:
 * - Distinct ethnic features
 * - Regional backgrounds
 * - Authentic beauty marks and features
 * - Clear focus on the specific feature
 * - Influencer-style, emotional, happy, sexy appearance
 * 
 * Uses local ComfyUI pod with Z-Image Turbo workflow.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ComfyUIPodClient } from '@ryla/business';
import { buildZImageSimpleWorkflow } from '@ryla/business';

// Load environment variables from .env files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// Image dimensions: 4:5 aspect ratio (matches UI aspect-[4/5])
const IMAGE_WIDTH = 768;
const IMAGE_HEIGHT = 960;

// Base style template for consistent quality
const BASE_STYLE = '8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality';

// Negative prompt for feature images (SFW only) - Strong emphasis on clothing
const NEGATIVE_PROMPT = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature, no person, empty scene, no character, nude, naked, no clothing, bare skin, exposed, topless, bottomless, see-through, transparent clothing, revealing, lingerie, underwear visible, cleavage, white background, plain background, blank background, stereotypical, caricature, offensive';

// Ethnicity configurations (reuse from ethnicity generation)
interface EthnicityConfig {
  value: string;
  displayName: string;
  regionalBackground: string;
  beautyMarks: string;
  skinFeatures: string;
  defaultHairColor: string;
  defaultEyeColor: string;
}

const ETHNICITY_CONFIGS: Record<string, EthnicityConfig> = {
  asian: {
    value: 'asian',
    displayName: 'Asian',
    regionalBackground: 'modern Asian cityscape, Tokyo or Seoul urban background, cherry blossoms, traditional and modern architecture blend, vibrant city lights, Asian cultural elements',
    beautyMarks: 'small beauty mark on cheek, natural skin texture, flawless complexion',
    skinFeatures: 'fair smooth skin, delicate features, natural Asian skin tone',
    defaultHairColor: 'black',
    defaultEyeColor: 'brown',
  },
  black: {
    value: 'black',
    displayName: 'Black',
    regionalBackground: 'vibrant African cityscape, modern African architecture, warm sunset colors, cultural elements, urban African setting, rich cultural heritage',
    beautyMarks: 'natural beauty marks, melanin-rich skin, beautiful skin texture',
    skinFeatures: 'rich dark skin, beautiful melanin-rich complexion, natural skin glow',
    defaultHairColor: 'black',
    defaultEyeColor: 'brown',
  },
  caucasian: {
    value: 'caucasian',
    displayName: 'Caucasian',
    regionalBackground: 'European cityscape, Paris or London urban background, classic European architecture, elegant streets, European cultural elements',
    beautyMarks: 'freckles on cheeks, natural beauty marks, rosy complexion, actress-like features',
    skinFeatures: 'fair smooth skin, natural European skin tone, healthy glow, screen actress appearance, model-like features',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
  latina: {
    value: 'latina',
    displayName: 'Latina',
    regionalBackground: 'Latin American cityscape, colorful Mexican or Brazilian urban background, vibrant colors, tropical elements, warm cultural atmosphere',
    beautyMarks: 'natural beauty marks, warm skin tone, sun-kissed glow',
    skinFeatures: 'warm tanned skin, olive complexion, natural Latin American skin tone',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
  arabian: {
    value: 'arabian',
    displayName: 'Arab',
    regionalBackground: 'Middle Eastern cityscape, Dubai or Istanbul urban background, modern Middle Eastern architecture, desert elements, cultural heritage',
    beautyMarks: 'natural beauty marks, olive skin tone, elegant features',
    skinFeatures: 'olive skin, warm Mediterranean complexion, natural Middle Eastern skin tone',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
  indian: {
    value: 'indian',
    displayName: 'Indian',
    regionalBackground: 'South Asian cityscape, Mumbai or Delhi urban background, vibrant Indian architecture, colorful cultural elements, rich heritage',
    beautyMarks: 'natural beauty mark on forehead area, natural beauty marks, warm skin tone',
    skinFeatures: 'warm brown skin, natural South Asian complexion, healthy glow',
    defaultHairColor: 'black',
    defaultEyeColor: 'brown',
  },
  mixed: {
    value: 'mixed',
    displayName: 'Mixed',
    regionalBackground: 'diverse urban cityscape, multicultural city background, modern cosmopolitan setting, diverse cultural elements, global city atmosphere',
    beautyMarks: 'natural beauty marks, unique mixed heritage features, diverse skin tone',
    skinFeatures: 'mixed heritage skin tone, unique complexion, natural diversity',
    defaultHairColor: 'brown',
    defaultEyeColor: 'brown',
  },
};

// Feature definitions
const BODY_TYPES = {
  female: ['slim', 'athletic', 'curvy', 'voluptuous'],
  male: ['slim', 'athletic', 'muscular', 'chubby'],
};

const BREAST_SIZES = ['small', 'medium', 'large', 'xl'];
const BREAST_TYPES = ['regular', 'perky', 'saggy', 'torpedo'];

const ASS_SIZES = ['small', 'medium', 'large', 'huge'];

const PIERCINGS = ['none', 'ear', 'nose', 'lip', 'eyebrow', 'multiple'];

const TATTOOS = ['none', 'small', 'medium', 'large', 'full-body'];

const SKIN_COLORS = ['light', 'medium', 'tan', 'dark'];

const SKIN_FEATURES = {
  freckles: ['none', 'light', 'medium', 'heavy'],
  scars: ['none', 'small', 'medium', 'large'],
  beautyMarks: ['none', 'single', 'multiple'],
};

interface FeatureImage {
  category: 'body-type' | 'breast-size' | 'breast-type' | 'ass-size' | 'piercing' | 'tattoo' | 'skin-color' | 'skin-feature';
  ethnicity: string;
  gender: 'female' | 'male';
  featureValue: string;
  featureSubCategory?: string; // For skin features (freckles, scars, beautyMarks)
  prompt: string;
  outputPath: string;
  name: string;
}

function getBodyTypeDescription(bodyType: string, gender: 'female' | 'male'): string {
  const descriptions: Record<string, string> = {
    'slim': gender === 'female' ? 'slim slender body type with lean frame' : 'slim slender body type with lean frame',
    'athletic': gender === 'female' ? 'athletic toned body type with defined muscles and fit physique' : 'athletic toned body type with defined muscles and fit physique',
    'curvy': 'curvy body type with hourglass figure and fuller curves',
    'voluptuous': 'voluptuous body type with full curves and generous proportions',
    'muscular': 'muscular body type with well-developed muscles and strong physique',
    'chubby': 'chubby body type with fuller frame and soft physique',
  };
  return descriptions[bodyType] || bodyType;
}

function getFeaturePrompt(
  category: 'body-type' | 'breast-size' | 'breast-type' | 'ass-size' | 'piercing' | 'tattoo' | 'skin-color' | 'skin-feature',
  ethnicity: string,
  gender: 'female' | 'male',
  featureValue: string,
  featureSubCategory?: string
): string {
  const config = ETHNICITY_CONFIGS[ethnicity];
  if (!config) {
    throw new Error(`Unknown ethnicity: ${ethnicity}`);
  }

  const genderTerm = gender === 'female' ? 'beautiful, attractive woman' : 'handsome, attractive man';
  const age = gender === 'female' ? 25 : 28;
  const bodyType = gender === 'female' ? 'slim athletic body type' : 'athletic body type';
  const outfit = 'fully clothed, casual stylish outfit, appropriate clothing, modest attire, well-dressed, professional clothing, complete outfit';
  const hairColor = config.defaultHairColor;
  const hairStyle = gender === 'female' ? 'long hair' : 'short hair';
  const eyeColor = config.defaultEyeColor;

  let prompt = '';
  let focusInstruction = '';

  switch (category) {
    case 'body-type': {
      const bodyTypeDesc = getBodyTypeDescription(featureValue, gender);
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyTypeDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', full body view, body type clearly visible, focus on body shape and proportions, body prominently featured';
      break;
    }
    case 'breast-size': {
      if (gender !== 'female') {
        throw new Error('Breast sizes are female-only');
      }
      const breastDesc = featureValue === 'small' ? 'small breasts' :
                        featureValue === 'medium' ? 'medium-sized breasts' :
                        featureValue === 'large' ? 'large breasts' :
                        featureValue === 'xl' ? 'extra large breasts' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${breastDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', upper body view, breast size clearly visible, focus on upper body proportions';
      break;
    }
    case 'breast-type': {
      if (gender !== 'female') {
        throw new Error('Breast types are female-only');
      }
      const breastTypeDesc = featureValue === 'regular' ? 'regular natural breasts' :
                            featureValue === 'perky' ? 'perky firm breasts, uplifted breasts' :
                            featureValue === 'saggy' ? 'saggy natural breasts, relaxed breasts' :
                            featureValue === 'torpedo' ? 'torpedo-shaped breasts, pointed breasts' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${breastTypeDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', upper body view, breast type clearly visible, focus on breast shape and form';
      break;
    }
    case 'ass-size': {
      const assDesc = featureValue === 'small' ? 'small buttocks' :
                     featureValue === 'medium' ? 'medium-sized buttocks' :
                     featureValue === 'large' ? 'large buttocks' :
                     featureValue === 'huge' ? 'extra large buttocks' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${assDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', full body view, lower body proportions clearly visible, focus on body shape';
      break;
    }
    case 'piercing': {
      const piercingDesc = featureValue === 'none' ? 'no piercings' :
                          featureValue === 'ear' ? 'ear piercings, earrings' :
                          featureValue === 'nose' ? 'nose piercing' :
                          featureValue === 'lip' ? 'lip piercing' :
                          featureValue === 'eyebrow' ? 'eyebrow piercing' :
                          featureValue === 'multiple' ? 'multiple piercings, various piercings' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${piercingDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', close-up portrait, piercings clearly visible, focus on facial piercings';
      break;
    }
    case 'tattoo': {
      const tattooDesc = featureValue === 'none' ? 'no tattoos' :
                        featureValue === 'small' ? 'small tattoos, minimal tattoos' :
                        featureValue === 'medium' ? 'medium-sized tattoos' :
                        featureValue === 'large' ? 'large tattoos' :
                        featureValue === 'full-body' ? 'full body tattoos, extensive tattoos' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${tattooDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', tattoos clearly visible, focus on tattoo visibility';
      break;
    }
    case 'skin-color': {
      const skinColorDesc = featureValue === 'light' ? 'light skin tone' :
                           featureValue === 'medium' ? 'medium skin tone' :
                           featureValue === 'tan' ? 'tan skin tone' :
                           featureValue === 'dark' ? 'dark skin tone' : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${skinColorDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', skin color clearly visible, focus on skin tone';
      break;
    }
    case 'skin-feature': {
      if (!featureSubCategory) {
        throw new Error('Skin feature requires subCategory');
      }
      const featureDesc = featureSubCategory === 'freckles' && featureValue !== 'none' ? `${featureValue} freckles` :
                         featureSubCategory === 'scars' && featureValue !== 'none' ? `${featureValue} scars` :
                         featureSubCategory === 'beautyMarks' && featureValue !== 'none' ? `${featureValue === 'single' ? 'single beauty mark' : 'multiple beauty marks'}` :
                         featureValue === 'none' ? `no ${featureSubCategory}` : featureValue;
      prompt = `A ${genderTerm}, ${age} years old, ${config.displayName} ethnicity with distinct ${config.displayName} facial features, ${hairColor} ${hairStyle}, ${eyeColor} eyes, ${bodyType}, ${featureDesc}, ${config.skinFeatures}, ${config.beautyMarks}, wearing ${outfit}`;
      focusInstruction = ', skin features clearly visible, focus on facial skin features';
      break;
    }
  }

  // Add background
  prompt += `, in ${config.regionalBackground}`;

  // Add influencer style and focus
  prompt += `, influencer style portrait, close-up portrait, head and shoulders, face clearly visible, beautiful facial features, happy expression, genuine smile, confident pose, sexy attractive look, emotional connection, unique personality, social media influencer aesthetic, engaging eye contact, natural lighting${focusInstruction}, ${BASE_STYLE}`;

  return prompt;
}

function getAllFeatureImages(): FeatureImage[] {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const images: FeatureImage[] = [];
  const ethnicities = Object.keys(ETHNICITY_CONFIGS);
  const genders: ('female' | 'male')[] = ['female', 'male'];

  // Body Types
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const bodyType of BODY_TYPES[gender]) {
        const prompt = getFeaturePrompt('body-type', ethnicity, gender, bodyType);
        const fileName = `body-${bodyType}-${gender}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'body-types', fileName);
        
        images.push({
          category: 'body-type',
          ethnicity,
          gender,
          featureValue: bodyType,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${bodyType} Body`,
        });
      }
    }
  }

  // Breast Sizes (female only)
  for (const ethnicity of ethnicities) {
    for (const size of BREAST_SIZES) {
      const prompt = getFeaturePrompt('breast-size', ethnicity, 'female', size);
      const fileName = `breast-${size}-${ethnicity}.webp`;
      const outputPath = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'breast-sizes', fileName);
      
      images.push({
        category: 'breast-size',
        ethnicity,
        gender: 'female',
        featureValue: size,
        prompt,
        outputPath,
        name: `${ETHNICITY_CONFIGS[ethnicity].displayName} Female - ${size} Breast`,
      });
    }
  }

  // Breast Types (female only)
  for (const ethnicity of ethnicities) {
    for (const type of BREAST_TYPES) {
      const prompt = getFeaturePrompt('breast-type', ethnicity, 'female', type);
      const fileName = `breast-type-${type}-${ethnicity}.webp`;
      const outputPath = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'breast-types', fileName);
      
      images.push({
        category: 'breast-type',
        ethnicity,
        gender: 'female',
        featureValue: type,
        prompt,
        outputPath,
        name: `${ETHNICITY_CONFIGS[ethnicity].displayName} Female - ${type} Breast Type`,
      });
    }
  }

  // Ass Sizes
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const size of ASS_SIZES) {
        const prompt = getFeaturePrompt('ass-size', ethnicity, gender, size);
        const fileName = `ass-${size}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'ass-sizes', fileName);
        
        images.push({
          category: 'ass-size',
          ethnicity,
          gender,
          featureValue: size,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${size} Ass`,
        });
      }
    }
  }

  // Piercings
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const piercing of PIERCINGS) {
        const prompt = getFeaturePrompt('piercing', ethnicity, gender, piercing);
        const fileName = `${piercing}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'modifications', ethnicity, 'piercings', fileName);
        
        images.push({
          category: 'piercing',
          ethnicity,
          gender,
          featureValue: piercing,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${piercing} Piercing`,
        });
      }
    }
  }

  // Tattoos
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const tattoo of TATTOOS) {
        const prompt = getFeaturePrompt('tattoo', ethnicity, gender, tattoo);
        const fileName = `${tattoo}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'modifications', ethnicity, 'tattoos', fileName);
        
        images.push({
          category: 'tattoo',
          ethnicity,
          gender,
          featureValue: tattoo,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${tattoo} Tattoo`,
        });
      }
    }
  }

  // Skin Colors
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      for (const color of SKIN_COLORS) {
        const prompt = getFeaturePrompt('skin-color', ethnicity, gender, color);
        const fileName = `${color}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'skin', ethnicity, 'colors', fileName);
        
        images.push({
          category: 'skin-color',
          ethnicity,
          gender,
          featureValue: color,
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${color} Skin`,
        });
      }
    }
  }

  // Skin Features
  for (const ethnicity of ethnicities) {
    for (const gender of genders) {
      // Freckles
      for (const freckle of SKIN_FEATURES.freckles) {
        const prompt = getFeaturePrompt('skin-feature', ethnicity, gender, freckle, 'freckles');
        const fileName = `freckles-${freckle}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'skin', ethnicity, 'features', 'freckles', fileName);
        
        images.push({
          category: 'skin-feature',
          ethnicity,
          gender,
          featureValue: freckle,
          featureSubCategory: 'freckles',
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${freckle} Freckles`,
        });
      }
      // Scars
      for (const scar of SKIN_FEATURES.scars) {
        const prompt = getFeaturePrompt('skin-feature', ethnicity, gender, scar, 'scars');
        const fileName = `scars-${scar}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'skin', ethnicity, 'features', 'scars', fileName);
        
        images.push({
          category: 'skin-feature',
          ethnicity,
          gender,
          featureValue: scar,
          featureSubCategory: 'scars',
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${scar} Scars`,
        });
      }
      // Beauty Marks
      for (const mark of SKIN_FEATURES.beautyMarks) {
        const prompt = getFeaturePrompt('skin-feature', ethnicity, gender, mark, 'beautyMarks');
        const fileName = `beauty-marks-${mark}-${ethnicity}.webp`;
        const outputPath = path.join(publicDir, 'images', 'wizard', 'skin', ethnicity, 'features', 'beauty-marks', fileName);
        
        images.push({
          category: 'skin-feature',
          ethnicity,
          gender,
          featureValue: mark,
          featureSubCategory: 'beautyMarks',
          prompt,
          outputPath,
          name: `${ETHNICITY_CONFIGS[ethnicity].displayName} ${gender === 'female' ? 'Female' : 'Male'} - ${mark} Beauty Marks`,
        });
      }
    }
  }

  return images;
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const ethnicities = Object.keys(ETHNICITY_CONFIGS);
  
  // Body types, breast sizes, ass sizes
  for (const ethnicity of ethnicities) {
    const bodyTypesDir = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'body-types');
    const breastSizesDir = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'breast-sizes');
    const assSizesDir = path.join(publicDir, 'images', 'wizard', 'body', ethnicity, 'ass-sizes');
    for (const dir of [bodyTypesDir, breastSizesDir, assSizesDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      }
    }
  }
  
  // Piercings and tattoos
  for (const ethnicity of ethnicities) {
    const piercingsDir = path.join(publicDir, 'images', 'wizard', 'modifications', ethnicity, 'piercings');
    const tattoosDir = path.join(publicDir, 'images', 'wizard', 'modifications', ethnicity, 'tattoos');
    for (const dir of [piercingsDir, tattoosDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created directory: ${dir}`);
      }
    }
  }
  
  // Skin colors
  for (const ethnicity of ethnicities) {
    const skinColorsDir = path.join(publicDir, 'images', 'wizard', 'skin', ethnicity, 'colors');
    if (!fs.existsSync(skinColorsDir)) {
      fs.mkdirSync(skinColorsDir, { recursive: true });
      console.log(`✓ Created directory: ${skinColorsDir}`);
    }
  }
  
  // Skin features (has subdirectories)
  for (const ethnicity of ethnicities) {
    for (const subDir of ['freckles', 'scars', 'beauty-marks']) {
      const dirPath = path.join(publicDir, 'images', 'wizard', 'skin', ethnicity, 'features', subDir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✓ Created directory: ${dirPath}`);
      }
    }
  }
}

async function saveImageAsWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
  fs.writeFileSync(outputPath, imageBuffer);
}

async function generateFeatureImage(
  image: FeatureImage,
  client: ComfyUIPodClient,
  retries = 3
): Promise<void> {
  console.log(`\n📸 Generating: ${image.name}`);
  console.log(`   Category: ${image.category}, Ethnicity: ${image.ethnicity}, Gender: ${image.gender}`);
  console.log(`   Prompt: ${image.prompt.substring(0, 120)}...`);

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`   🔄 Retry attempt ${attempt}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
        
        const isHealthy = await client.healthCheck();
        if (!isHealthy) {
          throw new Error('ComfyUI pod is not responding');
        }
      }

      const workflow = buildZImageSimpleWorkflow({
        prompt: image.prompt,
        negativePrompt: NEGATIVE_PROMPT,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        steps: 9,
        cfg: 1.0,
        seed: Math.floor(Math.random() * 2 ** 32),
        filenamePrefix: `ryla_${image.category}_${image.ethnicity}_${image.gender}_${image.featureValue}`,
      });

      console.log(`   ✓ Workflow built, queuing to ComfyUI pod...`);

      const result = await client.executeWorkflow(workflow);

      if (result.status === 'failed' || !result.images || result.images.length === 0) {
        throw new Error(result.error || 'ComfyUI generation failed - no images returned');
      }

      const imageDataUrl = result.images[0];
      const base64Data = imageDataUrl.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      await saveImageAsWebP(imageBuffer, image.outputPath);
      
      console.log(`   ✓ Saved to ${image.outputPath}`);
      
      const stats = fs.statSync(image.outputPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ✓ File size: ${fileSizeKB} KB`);
      
      if (stats.size > 100 * 1024) {
        console.warn(`   ⚠️  Warning: File size exceeds 100KB target (${fileSizeKB} KB)`);
      }

      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`   ❌ Attempt ${attempt}/${retries} failed: ${lastError.message}`);
      
      if (attempt === retries) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Unknown error');
}

async function main() {
  console.log('🎨 Ethnicity-Specific Additional Feature Image Generator');
  console.log('======================================================\n');
  console.log('Generating ethnicity-specific images for:');
  console.log('- Body types, Breast sizes, Ass sizes');
  console.log('- Piercings, Tattoos, Skin colors, Skin features');
  console.log('Each image will have distinct ethnic features, regional backgrounds, and clear feature focus.\n');

  const comfyuiPodUrl = process.env.COMFYUI_POD_URL;
  if (!comfyuiPodUrl) {
    console.error('❌ COMFYUI_POD_URL environment variable is required');
    console.error('   Set it in your .env file: COMFYUI_POD_URL=https://your-pod-id-8188.proxy.runpod.net');
    process.exit(1);
  }

  console.log(`🔗 Connecting to ComfyUI pod: ${comfyuiPodUrl}`);
  const client = new ComfyUIPodClient({
    baseUrl: comfyuiPodUrl,
    timeout: 300000, // 5 minutes timeout
  });

  const isHealthy = await client.healthCheck();
  if (!isHealthy) {
    console.error('❌ ComfyUI pod is not responding. Please check the pod URL and ensure the pod is running.');
    process.exit(1);
  }
  console.log('✓ ComfyUI pod is healthy\n');

  await ensureDirectories();

  const featureImages = getAllFeatureImages();
  console.log(`\n📋 Found ${featureImages.length} feature images to generate:`);
  console.log(`   - Body Types: ${featureImages.filter(img => img.category === 'body-type').length}`);
  console.log(`   - Breast Sizes: ${featureImages.filter(img => img.category === 'breast-size').length}`);
  console.log(`   - Ass Sizes: ${featureImages.filter(img => img.category === 'ass-size').length}`);
  console.log(`   - Piercings: ${featureImages.filter(img => img.category === 'piercing').length}`);
  console.log(`   - Tattoos: ${featureImages.filter(img => img.category === 'tattoo').length}`);
  console.log(`   - Skin Colors: ${featureImages.filter(img => img.category === 'skin-color').length}`);
  console.log(`   - Skin Features: ${featureImages.filter(img => img.category === 'skin-feature').length}`);
  console.log(`   - Total: ${featureImages.length} images\n`);

  let successCount = 0;
  let failCount = 0;
  const failedImages: FeatureImage[] = [];

  for (let i = 0; i < featureImages.length; i++) {
    const image = featureImages[i];
    try {
      if (fs.existsSync(image.outputPath)) {
        console.log(`\n⏭️  Skipping ${image.name} (already exists)`);
        successCount++;
        continue;
      }

      const progress = ((i + 1) / featureImages.length * 100).toFixed(1);
      console.log(`\n[${i + 1}/${featureImages.length}] (${progress}%)`);

      await generateFeatureImage(image, client);
      successCount++;
      
      if (i < featureImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to generate ${image.name}: ${errorMessage}`);
      failCount++;
      failedImages.push(image);
      
      if (i < featureImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    if ((i + 1) % 10 === 0) {
      console.log(`\n🔍 Health check (${i + 1}/${featureImages.length} processed)...`);
      const isHealthy = await client.healthCheck();
      if (!isHealthy) {
        console.error('❌ ComfyUI pod is not responding. Pausing for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        const stillUnhealthy = !(await client.healthCheck());
        if (stillUnhealthy) {
          console.error('❌ ComfyUI pod is still not responding. Exiting.');
          console.log(`\n📊 Progress so far:`);
          console.log(`   Success: ${successCount}`);
          console.log(`   Failed: ${failCount}`);
          console.log(`   Remaining: ${featureImages.length - successCount - failCount}`);
          process.exit(1);
        }
      }
      console.log('✓ Pod is healthy, continuing...\n');
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${featureImages.length}`);
  
  if (failedImages.length > 0) {
    console.log(`\n⚠️  Failed images (${failedImages.length}):`);
    failedImages.forEach(img => {
      console.log(`   - ${img.name} (${img.category}, ${img.ethnicity}, ${img.gender})`);
    });
    console.log(`\n💡 You can re-run this script to retry failed images (it will skip existing ones)`);
  }
  
  if (successCount === featureImages.length) {
    console.log(`\n🎉 All ethnicity-specific additional feature images generated successfully!`);
    console.log(`   Next step: Run optimization script to compress images`);
    console.log(`   Command: python3 scripts/generation/optimize-additional-features.py`);
  } else {
    console.log(`\n📝 Partial completion. Re-run the script to continue generating remaining images.`);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getAllFeatureImages, ensureDirectories, generateFeatureImage };
