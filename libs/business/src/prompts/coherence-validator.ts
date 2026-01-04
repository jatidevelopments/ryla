/**
 * Coherence Validator
 * 
 * Validates that prompt elements work well together.
 * Prevents incompatible combinations like "laughing" expression with "mysterious" pose.
 * 
 * Usage:
 *   import { validateCoherence, CoherenceWarning } from '@ryla/business/prompts';
 *   
 *   const result = validateCoherence({
 *     expression: 'positive.laugh',
 *     pose: 'standing.confident',
 *     scene: 'indoor.gym',
 *     outfit: 'formal.eveningGown',
 *   });
 *   // Returns warnings if combinations don't work well
 */

/**
 * Coherence warning types
 */
export type CoherenceWarningType =
  | 'expression_pose_conflict'
  | 'scene_outfit_conflict'
  | 'scene_activity_conflict'
  | 'lighting_scene_conflict'
  | 'mood_expression_conflict';

/**
 * Coherence warning severity levels
 */
export type CoherenceSeverity = 'low' | 'medium' | 'high';

/**
 * A coherence warning returned by validation
 */
export interface CoherenceWarning {
  /** Type of conflict */
  type: CoherenceWarningType;
  /** Human-readable message */
  message: string;
  /** Severity level */
  severity: CoherenceSeverity;
  /** Elements involved in the conflict */
  elements: string[];
  /** Suggested alternatives */
  suggestions?: string[];
}

/**
 * Validation input
 */
export interface CoherenceInput {
  expression?: string;
  pose?: string;
  scene?: string;
  outfit?: string;
  lighting?: string;
  activity?: string;
}

/**
 * Validation result
 */
export interface CoherenceResult {
  /** Whether the combination is valid (no high-severity warnings) */
  valid: boolean;
  /** Total number of warnings */
  warningCount: number;
  /** All warnings */
  warnings: CoherenceWarning[];
  /** Combined suggestions for improvement */
  suggestions: string[];
}

/**
 * Expression categories for coherence checking
 */
type ExpressionCategory = 'energetic' | 'calm' | 'dramatic' | 'playful' | 'professional';

const expressionCategories: Record<string, ExpressionCategory> = {
  // Positive/energetic
  'positive.smile': 'playful',
  'positive.laugh': 'energetic',
  'positive.happy': 'energetic',
  'positive.excited': 'energetic',
  'positive.confident': 'professional',
  // Neutral/calm
  'neutral.serene': 'calm',
  'neutral.thoughtful': 'calm',
  'neutral.natural': 'calm',
  'neutral.subtle': 'calm',
  // Dramatic
  'dramatic.intense': 'dramatic',
  'dramatic.mysterious': 'dramatic',
  'dramatic.fierce': 'dramatic',
  'dramatic.sultry': 'dramatic',
};

/**
 * Pose categories for coherence checking
 */
type PoseCategory = 'active' | 'relaxed' | 'professional' | 'dynamic' | 'intimate';

const poseCategories: Record<string, PoseCategory> = {
  // Standing
  'standing.casual': 'relaxed',
  'standing.confident': 'professional',
  'standing.walking': 'dynamic',
  'standing.leaning': 'relaxed',
  // Sitting
  'sitting.relaxed': 'relaxed',
  'sitting.crossLegged': 'relaxed',
  'sitting.perched': 'professional',
  'sitting.lounging': 'intimate',
  // Action
  'action.dancing': 'active',
  'action.stretching': 'active',
  'action.exercising': 'active',
  'action.playing': 'active',
};

/**
 * Scene categories for outfit matching
 */
type SceneCategory = 'casual' | 'formal' | 'athletic' | 'outdoor' | 'professional' | 'intimate';

const sceneCategories: Record<string, SceneCategory> = {
  // Indoor casual
  'indoor.bedroom': 'intimate',
  'indoor.livingRoom': 'casual',
  'indoor.kitchen': 'casual',
  'indoor.bathroom': 'intimate',
  // Indoor professional
  'indoor.office': 'professional',
  'indoor.studio': 'professional',
  // Indoor social
  'indoor.cafe': 'casual',
  'indoor.restaurant': 'formal',
  // Athletic
  'indoor.gym': 'athletic',
  // Outdoor casual
  'outdoor.beach': 'casual',
  'outdoor.park': 'casual',
  'outdoor.garden': 'casual',
  'outdoor.pool': 'casual',
  // Outdoor urban
  'outdoor.city': 'casual',
  'outdoor.rooftop': 'formal',
  // Outdoor nature
  'outdoor.forest': 'outdoor',
  'outdoor.desert': 'outdoor',
  'outdoor.mountains': 'outdoor',
};

/**
 * Outfit categories for scene matching
 */
type OutfitCategory = 'casual' | 'formal' | 'athletic' | 'fashion' | 'intimate';

const outfitCategories: Record<string, OutfitCategory> = {
  // Casual
  'casual.jeans': 'casual',
  'casual.sundress': 'casual',
  'casual.sweater': 'casual',
  'casual.loungewear': 'intimate',
  'casual.streetwear': 'casual',
  // Formal
  'formal.cocktailDress': 'formal',
  'formal.eveningGown': 'formal',
  'formal.businessSuit': 'formal',
  'formal.blazer': 'formal',
  // Athletic
  'athletic.yogaOutfit': 'athletic',
  'athletic.gymWear': 'athletic',
  'athletic.runningGear': 'athletic',
  'athletic.swimwear': 'casual',
  // Fashion
  'fashion.designer': 'fashion',
  'fashion.bohemian': 'fashion',
  'fashion.minimalist': 'fashion',
  'fashion.vintage': 'fashion',
};

/**
 * Expression-Pose compatibility matrix
 */
const expressionPoseCompatibility: Record<ExpressionCategory, PoseCategory[]> = {
  energetic: ['active', 'dynamic', 'relaxed'],
  calm: ['relaxed', 'intimate', 'professional'],
  dramatic: ['professional', 'dynamic', 'intimate'],
  playful: ['active', 'relaxed', 'dynamic'],
  professional: ['professional', 'relaxed'],
};

/**
 * Scene-Outfit compatibility matrix
 */
const sceneOutfitCompatibility: Record<SceneCategory, OutfitCategory[]> = {
  casual: ['casual', 'fashion', 'athletic'],
  formal: ['formal', 'fashion'],
  athletic: ['athletic', 'casual'],
  outdoor: ['casual', 'athletic'],
  professional: ['formal', 'fashion', 'casual'],
  intimate: ['intimate', 'casual'],
};

/**
 * Validate expression-pose coherence
 */
function validateExpressionPose(
  expression?: string,
  pose?: string
): CoherenceWarning | null {
  if (!expression || !pose) return null;

  const exprCategory = expressionCategories[expression];
  const poseCategory = poseCategories[pose];

  if (!exprCategory || !poseCategory) return null;

  const compatible = expressionPoseCompatibility[exprCategory];
  if (compatible && !compatible.includes(poseCategory)) {
    const suggestions: string[] = [];
    
    // Suggest compatible expressions for the pose
    for (const [expr, cat] of Object.entries(expressionCategories)) {
      if (expressionPoseCompatibility[cat]?.includes(poseCategory)) {
        suggestions.push(`Try ${expr.split('.')[1]} expression`);
        if (suggestions.length >= 2) break;
      }
    }

    return {
      type: 'expression_pose_conflict',
      message: `"${expression.split('.')[1]}" expression may look awkward with "${pose.split('.')[1]}" pose`,
      severity: 'medium',
      elements: [expression, pose],
      suggestions,
    };
  }

  return null;
}

/**
 * Validate scene-outfit coherence
 */
function validateSceneOutfit(
  scene?: string,
  outfit?: string
): CoherenceWarning | null {
  if (!scene || !outfit) return null;

  const sceneCategory = sceneCategories[scene];
  const outfitCategory = outfitCategories[outfit];

  if (!sceneCategory || !outfitCategory) return null;

  const compatible = sceneOutfitCompatibility[sceneCategory];
  if (compatible && !compatible.includes(outfitCategory)) {
    const suggestions: string[] = [];
    
    // Suggest compatible outfits for the scene
    for (const [out, cat] of Object.entries(outfitCategories)) {
      if (compatible.includes(cat)) {
        suggestions.push(`Try ${out.split('.')[1]} outfit`);
        if (suggestions.length >= 2) break;
      }
    }

    return {
      type: 'scene_outfit_conflict',
      message: `"${outfit.split('.')[1]}" outfit may look out of place in "${scene.split('.')[1]}" scene`,
      severity: 'low',
      elements: [scene, outfit],
      suggestions,
    };
  }

  return null;
}

/**
 * Validate gym scene requires athletic wear
 */
function validateGymOutfit(
  scene?: string,
  outfit?: string
): CoherenceWarning | null {
  if (!scene || !outfit) return null;

  const isGym = scene.includes('gym');
  const isAthletic = outfit.includes('athletic') || outfit.includes('gym') || outfit.includes('yoga');

  if (isGym && !isAthletic) {
    return {
      type: 'scene_outfit_conflict',
      message: 'Gym scene typically requires athletic wear',
      severity: 'high',
      elements: [scene, outfit],
      suggestions: ['Use athletic.gymWear or athletic.yogaOutfit'],
    };
  }

  return null;
}

/**
 * Validate beach scene with formal outfit
 */
function validateBeachOutfit(
  scene?: string,
  outfit?: string
): CoherenceWarning | null {
  if (!scene || !outfit) return null;

  const isBeach = scene.includes('beach') || scene.includes('pool');
  const isFormal = outfit.includes('formal') || outfit.includes('business');

  if (isBeach && isFormal) {
    return {
      type: 'scene_outfit_conflict',
      message: 'Formal attire looks unusual at the beach/pool',
      severity: 'high',
      elements: [scene, outfit],
      suggestions: ['Use casual.sundress or athletic.swimwear'],
    };
  }

  return null;
}

/**
 * Validate all coherence rules
 */
export function validateCoherence(input: CoherenceInput): CoherenceResult {
  const warnings: CoherenceWarning[] = [];

  // Expression-Pose validation
  const exprPoseWarning = validateExpressionPose(input.expression, input.pose);
  if (exprPoseWarning) warnings.push(exprPoseWarning);

  // Scene-Outfit validation
  const sceneOutfitWarning = validateSceneOutfit(input.scene, input.outfit);
  if (sceneOutfitWarning) warnings.push(sceneOutfitWarning);

  // Specific rule: Gym requires athletic wear
  const gymWarning = validateGymOutfit(input.scene, input.outfit);
  if (gymWarning) warnings.push(gymWarning);

  // Specific rule: Beach/pool with formal wear
  const beachWarning = validateBeachOutfit(input.scene, input.outfit);
  if (beachWarning) warnings.push(beachWarning);

  // Collect all suggestions
  const suggestions = warnings
    .flatMap(w => w.suggestions || [])
    .filter((s, i, arr) => arr.indexOf(s) === i); // Deduplicate

  // Valid if no high-severity warnings
  const hasHighSeverity = warnings.some(w => w.severity === 'high');

  return {
    valid: !hasHighSeverity,
    warningCount: warnings.length,
    warnings,
    suggestions,
  };
}

/**
 * Get compatible expressions for a given pose
 */
export function getCompatibleExpressions(pose: string): string[] {
  const poseCategory = poseCategories[pose];
  if (!poseCategory) return [];

  const compatible: string[] = [];
  for (const [category, poses] of Object.entries(expressionPoseCompatibility)) {
    if (poses.includes(poseCategory)) {
      for (const [expr, cat] of Object.entries(expressionCategories)) {
        if (cat === category) {
          compatible.push(expr);
        }
      }
    }
  }

  return compatible;
}

/**
 * Get compatible poses for a given expression
 */
export function getCompatiblePoses(expression: string): string[] {
  const exprCategory = expressionCategories[expression];
  if (!exprCategory) return [];

  const compatiblePoseCategories = expressionPoseCompatibility[exprCategory] || [];
  const compatible: string[] = [];

  for (const [pose, category] of Object.entries(poseCategories)) {
    if (compatiblePoseCategories.includes(category)) {
      compatible.push(pose);
    }
  }

  return compatible;
}

/**
 * Get compatible outfits for a given scene
 */
export function getCompatibleOutfits(scene: string): string[] {
  const sceneCategory = sceneCategories[scene];
  if (!sceneCategory) return [];

  const compatibleOutfitCategories = sceneOutfitCompatibility[sceneCategory] || [];
  const compatible: string[] = [];

  for (const [outfit, category] of Object.entries(outfitCategories)) {
    if (compatibleOutfitCategories.includes(category)) {
      compatible.push(outfit);
    }
  }

  return compatible;
}

