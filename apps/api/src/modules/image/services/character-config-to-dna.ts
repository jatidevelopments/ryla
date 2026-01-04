/**
 * Convert CharacterConfig (from database) to CharacterDNA (for prompt building)
 */
import { CharacterConfig } from '@ryla/data/schema';
import { CharacterDNA } from '@ryla/business/prompts';

export function characterConfigToDNA(
  config: CharacterConfig,
  characterName: string,
): CharacterDNA {
  // Build hair description
  const hairParts: string[] = [];
  if (config.hairColor) hairParts.push(config.hairColor);
  if (config.hairStyle) hairParts.push(config.hairStyle);
  const hairDesc = hairParts.length > 0 
    ? `${hairParts.join(' ')} hair`
    : 'natural hair';

  // Build eye description
  const eyesDesc = config.eyeColor 
    ? `${config.eyeColor} eyes`
    : 'expressive eyes';

  // Build skin description based on skinColor (preferred) or ethnicity
  let skinDesc = 'smooth skin';
  if (config.skinColor) {
    const skinColorLower = config.skinColor.toLowerCase();
    if (skinColorLower === 'light') {
      skinDesc = 'fair smooth skin';
    } else if (skinColorLower === 'medium') {
      skinDesc = 'medium-toned smooth skin';
    } else if (skinColorLower === 'tan') {
      skinDesc = 'warm tanned skin';
    } else if (skinColorLower === 'dark') {
      skinDesc = 'rich dark skin';
    }
  } else if (config.ethnicity) {
    const ethnicityLower = config.ethnicity.toLowerCase();
    if (ethnicityLower.includes('asian')) {
      skinDesc = 'fair smooth skin';
    } else if (ethnicityLower.includes('african') || ethnicityLower.includes('black')) {
      skinDesc = 'rich dark skin';
    } else if (ethnicityLower.includes('latina') || ethnicityLower.includes('hispanic')) {
      skinDesc = 'warm tanned skin';
    } else if (ethnicityLower.includes('mediterranean') || ethnicityLower.includes('middle eastern')) {
      skinDesc = 'olive skin';
    } else {
      skinDesc = 'smooth skin with natural complexion';
    }
  }

  // Add skin features
  const skinFeatures: string[] = [];
  if (config.freckles && config.freckles !== 'none') {
    skinFeatures.push(`${config.freckles} freckles`);
  }
  if (config.scars && config.scars !== 'none') {
    skinFeatures.push(`${config.scars} scars`);
  }
  if (config.beautyMarks && config.beautyMarks !== 'none') {
    if (config.beautyMarks === 'single') {
      skinFeatures.push('beauty mark');
    } else {
      skinFeatures.push('beauty marks');
    }
  }
  if (skinFeatures.length > 0) {
    skinDesc += `, ${skinFeatures.join(', ')}`;
  }

  // Build facial features from face shape and other features
  const facialFeaturesParts: string[] = [];
  if (config.faceShape) {
    facialFeaturesParts.push(`${config.faceShape} face shape`);
  }
  // Add body modifications to facial features if visible
  if (config.piercings && config.piercings !== 'none') {
    facialFeaturesParts.push(`${config.piercings} piercings`);
  }
  // Combine with personality traits if available
  if (config.personalityTraits && config.personalityTraits.length > 0) {
    facialFeaturesParts.push(...config.personalityTraits);
  }
  const facialFeatures = facialFeaturesParts.length > 0
    ? facialFeaturesParts.join(', ')
    : undefined;

  // Build style description
  const styleParts: string[] = [];
  if (config.archetype) styleParts.push(config.archetype);
  if (config.style) styleParts.push(config.style);
  const styleDesc = styleParts.length > 0 
    ? styleParts.join(' ')
    : undefined;

  // Build enhanced body type description
  let bodyTypeDesc = config.bodyType;
  if (config.assSize && config.assSize !== 'none') {
    bodyTypeDesc = bodyTypeDesc 
      ? `${bodyTypeDesc}, ${config.assSize} ass`
      : `${config.assSize} ass`;
  }
  if (config.breastSize && config.breastSize !== 'none') {
    const breastDesc = config.breastType 
      ? `${config.breastSize} ${config.breastType} breasts`
      : `${config.breastSize} breasts`;
    bodyTypeDesc = bodyTypeDesc 
      ? `${bodyTypeDesc}, ${breastDesc}`
      : breastDesc;
  }

  // Add tattoos to body description if present
  if (config.tattoos && config.tattoos !== 'none') {
    bodyTypeDesc = bodyTypeDesc 
      ? `${bodyTypeDesc}, ${config.tattoos} tattoos`
      : `${config.tattoos} tattoos`;
  }

  return {
    name: characterName,
    age: config.age ? `${config.age}-year-old` : (config.ageRange ? `${config.ageRange} age range` : '24-year-old'),
    ethnicity: config.ethnicity,
    hair: hairDesc,
    eyes: eyesDesc,
    skin: skinDesc,
    bodyType: bodyTypeDesc,
    facialFeatures,
    style: styleDesc,
  };
}

