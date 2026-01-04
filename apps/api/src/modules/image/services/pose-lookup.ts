/**
 * Pose lookup utility
 * Maps poseId to prompt text
 * 
 * This should match the pose definitions in the frontend.
 * For now, we'll use a simple lookup. In the future, this could be
 * moved to a shared library or database.
 */

interface PoseDefinition {
  id: string;
  prompt: string;
}

// SFW Poses
const SFW_POSES: PoseDefinition[] = [
  // Standing poses
  { id: 'standing-casual', prompt: 'standing casually' },
  { id: 'standing-confident', prompt: 'standing confidently' },
  { id: 'standing-elegant', prompt: 'standing elegantly' },
  { id: 'standing-walking', prompt: 'walking naturally mid-stride, full body in motion' },
  { id: 'standing-leaning', prompt: 'casually leaning against wall, one foot up, relaxed cool pose' },
  { id: 'standing-arms-crossed', prompt: 'arms crossed confident defensive' },
  { id: 'standing-hands-pocket', prompt: 'hands in pockets casual' },
  { id: 'standing-pointing', prompt: 'pointing at something engaging' },
  { id: 'standing-waving', prompt: 'waving hello friendly' },
  { id: 'standing-thinking', prompt: 'hand on chin thoughtful' },
  // Sitting poses
  { id: 'sitting-casual', prompt: 'sitting casually' },
  { id: 'sitting-elegant', prompt: 'sitting elegantly' },
  { id: 'sitting-lounging', prompt: 'lounging comfortably' },
  { id: 'sitting-cross', prompt: 'sitting cross-legged relaxed, comfortable pose' },
  { id: 'sitting-perched', prompt: 'perched on edge elegantly, legs crossed, leaning forward' },
  { id: 'sitting-edge', prompt: 'sitting on edge alert' },
  { id: 'sitting-backward', prompt: 'sitting backward playful' },
  { id: 'sitting-reading', prompt: 'reading book phone relaxed' },
  { id: 'sitting-working', prompt: 'at desk table professional' },
  // Lying poses
  { id: 'lying-casual', prompt: 'lying down casually' },
  { id: 'lying-elegant', prompt: 'lying elegantly' },
  { id: 'lying-relaxed', prompt: 'lying relaxed' },
  // Action poses
  { id: 'action-dancing', prompt: 'dynamic dancing movement' },
  { id: 'action-stretching', prompt: 'graceful stretching pose' },
  { id: 'action-exercising', prompt: 'active workout pose' },
  { id: 'action-playing', prompt: 'playful action pose' },
  { id: 'action-jumping', prompt: 'mid-jump energetic pose' },
  { id: 'action-running', prompt: 'running motion dynamic pose' },
  { id: 'action-yoga', prompt: 'yoga pose peaceful' },
  { id: 'action-sports', prompt: 'sports pose dynamic' },
  // Expressive poses
  { id: 'expressive-laughing', prompt: 'laughing joyful expression' },
  { id: 'expressive-thinking', prompt: 'thinking pose contemplative' },
  { id: 'expressive-surprised', prompt: 'surprised expression animated' },
];

// Adult poses (NSFW)
const ADULT_POSES: PoseDefinition[] = [
  // Standing
  { id: 'adult-standing-seductive', prompt: 'seductive standing pose' },
  { id: 'adult-standing-alluring', prompt: 'alluring confident pose' },
  { id: 'adult-standing-sensual', prompt: 'sensual standing pose' },
  // Sitting
  { id: 'adult-sitting-sensual', prompt: 'sensual sitting position' },
  { id: 'adult-sitting-suggestive', prompt: 'suggestive perched pose' },
  { id: 'adult-sitting-elegant', prompt: 'elegant sensual sitting pose' },
  // Lying
  { id: 'adult-lying-elegant', prompt: 'elegant reclining pose' },
  { id: 'adult-lying-alluring', prompt: 'alluring reclining pose' },
  { id: 'adult-lying-sensual', prompt: 'sensual reclining pose' },
  // Sexual positions
  { id: 'adult-pov-missionary', prompt: 'POV missionary sex' },
  { id: 'adult-sideview-missionary', prompt: 'sideview missionary sex' },
  { id: 'adult-anal-missionary', prompt: 'anal missionary sex' },
  { id: 'adult-cowgirl', prompt: 'cowgirl position' },
  { id: 'adult-pov-cowgirl', prompt: 'POV cowgirl position' },
  { id: 'adult-sideview-cowgirl', prompt: 'sideview cowgirl position' },
  { id: 'adult-reverse-cowgirl', prompt: 'reverse cowgirl position' },
  { id: 'adult-doggystyle', prompt: 'doggystyle sex' },
  { id: 'adult-pov-doggystyle', prompt: 'POV doggystyle sex' },
  { id: 'adult-sideview-doggystyle', prompt: 'sideview doggystyle sex' },
  { id: 'adult-frontview-doggystyle', prompt: 'frontview doggystyle sex' },
  { id: 'adult-spooning', prompt: 'spooning side lying sex' },
  { id: 'adult-lotus-position', prompt: 'lotus position sex' },
  { id: 'adult-amazon-position', prompt: 'amazon position sex' },
  { id: 'adult-mating-press', prompt: 'mating press position' },
  { id: 'adult-face-down-ass-up', prompt: 'face down ass up position' },
  { id: 'adult-foot-focus-missionary', prompt: 'foot focus missionary' },
  { id: 'adult-orgy-missionary', prompt: 'orgy missionary' },
  { id: 'adult-full-nelson', prompt: 'full nelson position' },
  { id: 'adult-double-penetration', prompt: 'double penetration' },
  { id: 'adult-cheek-fuck', prompt: 'cheek fuck insertion' },
  { id: 'adult-thigh-sex', prompt: 'thigh sex' },
  // Oral
  { id: 'adult-blowjob', prompt: 'blowjob deepthroat' },
  { id: 'adult-deepthroat', prompt: 'deepthroat oral sex' },
  { id: 'adult-sloppy-facefuck', prompt: 'sloppy facefuck' },
  { id: 'adult-cunnilingus', prompt: 'cunnilingus oral sex' },
  { id: 'adult-lesbian-analingus', prompt: 'lesbian analingus' },
  { id: 'adult-oral-insertion', prompt: 'oral insertion' },
  { id: 'adult-pov-insertion', prompt: 'POV insertion' },
  { id: 'adult-cum-in-mouth', prompt: 'cum in mouth' },
  { id: 'adult-double-cum-mouth', prompt: 'double cum in mouth' },
  { id: 'adult-blowbang', prompt: 'blowbang' },
  // Masturbation
  { id: 'adult-female-masturbation', prompt: 'female masturbation' },
  { id: 'adult-futa-masturbation', prompt: 'futa masturbation' },
  { id: 'adult-futa-masturbation-cumshot', prompt: 'futa masturbation cumshot' },
  { id: 'adult-male-masturbation', prompt: 'male masturbation cumshot' },
  { id: 'adult-male-masturbation-no-cum', prompt: 'male masturbation without cum' },
  { id: 'adult-fingering-pussy', prompt: 'fingering pussy' },
  { id: 'adult-two-fingers-squirting', prompt: 'two fingers squirting' },
  { id: 'adult-female-ejaculation', prompt: 'female ejaculation squirt' },
  // Handjobs & Manual
  { id: 'adult-handjob', prompt: 'handjob' },
  { id: 'adult-aftersex-handjob', prompt: 'aftersex handjob cumshot' },
  { id: 'adult-balls-sucking-handjob', prompt: 'balls sucking handjob' },
  { id: 'adult-footjob', prompt: 'footjob' },
  { id: 'adult-titjob', prompt: 'titjob titfuck' },
  // Breasts
  { id: 'adult-boobs', prompt: 'boobs focus' },
  { id: 'adult-flashing-boobs', prompt: 'flashing boobs' },
  { id: 'adult-breast-squeeze-lactation', prompt: 'breast squeeze lactation' },
  { id: 'adult-licking-breasts', prompt: 'licking breasts' },
  { id: 'adult-fondled-boobs', prompt: 'fondled boobs' },
  { id: 'adult-groping-breasts', prompt: 'groping massage breasts' },
  { id: 'adult-breast-pumping', prompt: 'breast pumping' },
  { id: 'adult-self-nipple-sucking', prompt: 'self nipple sucking' },
  // Anal
  { id: 'adult-anal-insertion', prompt: 'anal insertion' },
  { id: 'adult-ass-stretch', prompt: 'ass stretch' },
  { id: 'adult-futa-anal', prompt: 'futa anal' },
  // Cumshots
  { id: 'adult-pov-body-cumshot', prompt: 'POV body cumshot pullout' },
  // Other
  { id: 'adult-twerk', prompt: 'twerk showing ass' },
  { id: 'adult-bouncy-walk', prompt: 'bouncy walk' },
  { id: 'adult-ahegao', prompt: 'ahegao face expression' },
  { id: 'adult-dancing', prompt: 'dancing' },
  { id: 'adult-flirting', prompt: 'flirting' },
  { id: 'adult-bath-fun', prompt: 'bath fun' },
  { id: 'adult-dildo-machine', prompt: 'dildo machine' },
  { id: 'adult-giant-girls', prompt: 'giant girls' },
  { id: 'adult-butt-slapping', prompt: 'butt slapping' },
  { id: 'adult-kissing-lesbian', prompt: 'kissing passionately lesbian' },
  { id: 'adult-tribadism', prompt: 'tribadism' },
  { id: 'adult-facesitting', prompt: 'facesitting' },
  { id: 'adult-sex-smash-cut', prompt: 'sex smash cut' },
  { id: 'adult-finger-licking', prompt: 'finger licking sucking' },
  { id: 'adult-side-splits', prompt: 'side splits start' },
  { id: 'adult-pussy-focus', prompt: 'pussy focus' },
];

const ALL_POSES: PoseDefinition[] = [...SFW_POSES, ...ADULT_POSES];

/**
 * Get pose prompt by poseId
 */
export function getPosePrompt(poseId: string | null | undefined): string | undefined {
  if (!poseId) return undefined;
  const pose = ALL_POSES.find(p => p.id === poseId);
  return pose?.prompt;
}

