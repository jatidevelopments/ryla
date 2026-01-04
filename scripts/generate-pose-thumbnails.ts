/**
 * Generate Studio Pose Thumbnails using Local RunPod ComfyUI with Z-Image Turbo
 * 
 * This script generates all pose thumbnail images using detailed character descriptions
 * extracted from the base character image. Uses local ComfyUI pod with Z-Image Turbo workflow.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { getCharacterPrompt } from './analyze-base-character';
import { ComfyUIPodClient } from '@ryla/business';
import { buildZImageSimpleWorkflow } from '@ryla/business';

// Load environment variables from .env files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env') });
dotenv.config({ path: path.join(process.cwd(), 'apps', 'api', '.env.local') });

// Thumbnail dimensions: 4:5 aspect ratio (matches UI aspect-[4/5])
const THUMBNAIL_WIDTH = 768;
const THUMBNAIL_HEIGHT = 960;

// Base prompt template for consistent style and quality
const BASE_STYLE = '8K hyper-realistic, photorealistic, professional photography, ultra high quality, extremely detailed, sharp focus, clean composition, studio lighting, editorial fashion photography, masterpiece, best quality';

// Pose definitions from types.ts
interface Pose {
  id: string;
  name: string;
  prompt: string;
  category: 'standing' | 'sitting' | 'lying' | 'action' | 'expressive';
  isAdult?: boolean;
}

const SFW_POSES: Pose[] = [
  // Standing poses
  { id: 'standing-casual', name: 'Casual', prompt: 'relaxed casual standing pose', category: 'standing' },
  { id: 'standing-confident', name: 'Confident', prompt: 'confident power stance', category: 'standing' },
  { id: 'standing-walking', name: 'Walking', prompt: 'natural walking mid-stride', category: 'standing' },
  { id: 'standing-leaning', name: 'Leaning', prompt: 'casually leaning against wall', category: 'standing' },
  // Sitting poses
  { id: 'sitting-relaxed', name: 'Relaxed', prompt: 'relaxed sitting position', category: 'sitting' },
  { id: 'sitting-cross', name: 'Cross-legged', prompt: 'sitting cross-legged', category: 'sitting' },
  { id: 'sitting-perched', name: 'Perched', prompt: 'perched on edge elegantly', category: 'sitting' },
  { id: 'sitting-lounging', name: 'Lounging', prompt: 'lounging comfortably', category: 'sitting' },
  // Action poses
  { id: 'action-dancing', name: 'Dancing', prompt: 'dynamic dancing movement', category: 'action' },
  { id: 'action-stretching', name: 'Stretching', prompt: 'graceful stretching pose', category: 'action' },
  { id: 'action-exercising', name: 'Exercising', prompt: 'active workout pose', category: 'action' },
  { id: 'action-playing', name: 'Playing', prompt: 'playful action pose', category: 'action' },
  { id: 'action-jumping', name: 'Jumping', prompt: 'mid-jump energetic pose', category: 'action' },
  { id: 'action-running', name: 'Running', prompt: 'running motion dynamic pose', category: 'action' },
  { id: 'action-yoga', name: 'Yoga', prompt: 'yoga pose peaceful', category: 'action' },
  { id: 'action-sports', name: 'Sports', prompt: 'sports pose dynamic', category: 'action' },
  // Additional Standing poses
  { id: 'standing-arms-crossed', name: 'Arms Crossed', prompt: 'arms crossed confident defensive', category: 'standing' },
  { id: 'standing-hands-pocket', name: 'Hands Pocket', prompt: 'hands in pockets casual', category: 'standing' },
  { id: 'standing-pointing', name: 'Pointing', prompt: 'pointing at something engaging', category: 'standing' },
  { id: 'standing-waving', name: 'Waving', prompt: 'waving hello friendly', category: 'standing' },
  { id: 'standing-thinking', name: 'Thinking', prompt: 'hand on chin thoughtful', category: 'standing' },
  // Additional Sitting poses
  { id: 'sitting-edge', name: 'Edge', prompt: 'sitting on edge alert', category: 'sitting' },
  { id: 'sitting-backward', name: 'Backward', prompt: 'sitting backward playful', category: 'sitting' },
  { id: 'sitting-reading', name: 'Reading', prompt: 'reading book phone relaxed', category: 'sitting' },
  { id: 'sitting-working', name: 'Working', prompt: 'at desk table professional', category: 'sitting' },
  // Expressive poses
  { id: 'expressive-laughing', name: 'Laughing', prompt: 'laughing joyful expression', category: 'expressive' },
  { id: 'expressive-thinking', name: 'Thinking', prompt: 'thinking pose contemplative', category: 'expressive' },
  { id: 'expressive-surprised', name: 'Surprised', prompt: 'surprised expression animated', category: 'expressive' },
];

const ADULT_POSES: Pose[] = [
  // Standing poses
  { id: 'adult-standing-seductive', name: 'Seductive', prompt: 'seductive standing pose', category: 'standing', isAdult: true },
  { id: 'adult-standing-alluring', name: 'Alluring', prompt: 'alluring confident pose', category: 'standing', isAdult: true },
  { id: 'adult-standing-sensual', name: 'Sensual', prompt: 'sensual standing pose', category: 'standing', isAdult: true },
  // Sitting poses
  { id: 'adult-sitting-sensual', name: 'Sensual', prompt: 'sensual sitting position', category: 'sitting', isAdult: true },
  { id: 'adult-sitting-suggestive', name: 'Suggestive', prompt: 'suggestive perched pose', category: 'sitting', isAdult: true },
  { id: 'adult-sitting-elegant', name: 'Elegant', prompt: 'elegant sensual sitting pose', category: 'sitting', isAdult: true },
  // Lying poses
  { id: 'adult-lying-elegant', name: 'Elegant', prompt: 'elegant reclining pose', category: 'lying', isAdult: true },
  { id: 'adult-lying-alluring', name: 'Alluring', prompt: 'alluring reclining pose', category: 'lying', isAdult: true },
  { id: 'adult-lying-sensual', name: 'Sensual', prompt: 'sensual reclining pose', category: 'lying', isAdult: true },
  // Sexual Positions (from MDC)
  { id: 'adult-pov-missionary', name: 'POV Missionary', prompt: 'POV missionary sex', category: 'lying', isAdult: true },
  { id: 'adult-sideview-missionary', name: 'Sideview Missionary', prompt: 'sideview missionary sex', category: 'lying', isAdult: true },
  { id: 'adult-anal-missionary', name: 'Anal Missionary', prompt: 'anal missionary sex', category: 'lying', isAdult: true },
  { id: 'adult-cowgirl', name: 'Cowgirl', prompt: 'cowgirl position', category: 'sitting', isAdult: true },
  { id: 'adult-pov-cowgirl', name: 'POV Cowgirl', prompt: 'POV cowgirl position', category: 'sitting', isAdult: true },
  { id: 'adult-sideview-cowgirl', name: 'Sideview Cowgirl', prompt: 'sideview cowgirl position', category: 'sitting', isAdult: true },
  { id: 'adult-reverse-cowgirl', name: 'Reverse Cowgirl', prompt: 'reverse cowgirl position', category: 'sitting', isAdult: true },
  { id: 'adult-doggystyle', name: 'Doggystyle', prompt: 'doggystyle sex', category: 'lying', isAdult: true },
  { id: 'adult-pov-doggystyle', name: 'POV Doggystyle', prompt: 'POV doggystyle sex', category: 'lying', isAdult: true },
  { id: 'adult-sideview-doggystyle', name: 'Sideview Doggystyle', prompt: 'sideview doggystyle sex', category: 'lying', isAdult: true },
  { id: 'adult-frontview-doggystyle', name: 'Frontview Doggystyle', prompt: 'frontview doggystyle sex', category: 'lying', isAdult: true },
  { id: 'adult-spooning', name: 'Spooning', prompt: 'spooning side lying sex', category: 'lying', isAdult: true },
  { id: 'adult-lotus-position', name: 'Lotus Position', prompt: 'lotus position sex', category: 'sitting', isAdult: true },
  { id: 'adult-amazon-position', name: 'Amazon Position', prompt: 'amazon position sex', category: 'sitting', isAdult: true },
  { id: 'adult-mating-press', name: 'Mating Press', prompt: 'mating press position', category: 'lying', isAdult: true },
  { id: 'adult-face-down-ass-up', name: 'Face Down Ass Up', prompt: 'face down ass up position', category: 'lying', isAdult: true },
  { id: 'adult-foot-focus-missionary', name: 'Foot Focus Missionary', prompt: 'foot focus missionary', category: 'lying', isAdult: true },
  { id: 'adult-orgy-missionary', name: 'Orgy Missionary', prompt: 'orgy missionary', category: 'lying', isAdult: true },
  { id: 'adult-full-nelson', name: 'Full Nelson', prompt: 'full nelson position', category: 'standing', isAdult: true },
  { id: 'adult-double-penetration', name: 'Double Penetration', prompt: 'double penetration', category: 'lying', isAdult: true },
  { id: 'adult-cheek-fuck', name: 'Cheek Fuck', prompt: 'cheek fuck insertion', category: 'lying', isAdult: true },
  { id: 'adult-thigh-sex', name: 'Thigh Sex', prompt: 'thigh sex', category: 'lying', isAdult: true },
  // Oral (from MDC)
  { id: 'adult-blowjob', name: 'Blowjob', prompt: 'blowjob deepthroat', category: 'sitting', isAdult: true },
  { id: 'adult-deepthroat', name: 'Deepthroat', prompt: 'deepthroat oral sex', category: 'sitting', isAdult: true },
  { id: 'adult-sloppy-facefuck', name: 'Sloppy Facefuck', prompt: 'sloppy facefuck', category: 'sitting', isAdult: true },
  { id: 'adult-cunnilingus', name: 'Cunnilingus', prompt: 'cunnilingus oral sex', category: 'lying', isAdult: true },
  { id: 'adult-lesbian-analingus', name: 'Lesbian Analingus', prompt: 'lesbian analingus', category: 'lying', isAdult: true },
  { id: 'adult-oral-insertion', name: 'Oral Insertion', prompt: 'oral insertion', category: 'sitting', isAdult: true },
  { id: 'adult-pov-insertion', name: 'POV Insertion', prompt: 'POV insertion', category: 'sitting', isAdult: true },
  { id: 'adult-cum-in-mouth', name: 'Cum in Mouth', prompt: 'cum in mouth', category: 'sitting', isAdult: true },
  { id: 'adult-double-cum-mouth', name: 'Double Cum Mouth', prompt: 'double cum in mouth', category: 'sitting', isAdult: true },
  { id: 'adult-blowbang', name: 'Blowbang', prompt: 'blowbang', category: 'sitting', isAdult: true },
  // Masturbation (from MDC)
  { id: 'adult-female-masturbation', name: 'Female Masturbation', prompt: 'female masturbation', category: 'lying', isAdult: true },
  { id: 'adult-futa-masturbation', name: 'Futa Masturbation', prompt: 'futa masturbation', category: 'lying', isAdult: true },
  { id: 'adult-futa-masturbation-cumshot', name: 'Futa Masturbation Cumshot', prompt: 'futa masturbation cumshot', category: 'lying', isAdult: true },
  { id: 'adult-male-masturbation', name: 'Male Masturbation', prompt: 'male masturbation cumshot', category: 'standing', isAdult: true },
  { id: 'adult-male-masturbation-no-cum', name: 'Male Masturbation No Cum', prompt: 'male masturbation without cum', category: 'standing', isAdult: true },
  { id: 'adult-fingering-pussy', name: 'Fingering Pussy', prompt: 'fingering pussy', category: 'lying', isAdult: true },
  { id: 'adult-two-fingers-squirting', name: 'Two Fingers Squirting', prompt: 'two fingers squirting', category: 'lying', isAdult: true },
  { id: 'adult-female-ejaculation', name: 'Female Ejaculation', prompt: 'female ejaculation squirt', category: 'lying', isAdult: true },
  // Handjobs & Manual (from MDC)
  { id: 'adult-handjob', name: 'Handjob', prompt: 'handjob', category: 'sitting', isAdult: true },
  { id: 'adult-aftersex-handjob', name: 'Aftersex Handjob', prompt: 'aftersex handjob cumshot', category: 'sitting', isAdult: true },
  { id: 'adult-balls-sucking-handjob', name: 'Balls Sucking Handjob', prompt: 'balls sucking handjob', category: 'sitting', isAdult: true },
  { id: 'adult-footjob', name: 'Footjob', prompt: 'footjob', category: 'sitting', isAdult: true },
  { id: 'adult-titjob', name: 'Titjob', prompt: 'titjob titfuck', category: 'sitting', isAdult: true },
  // Breasts (from MDC)
  { id: 'adult-boobs', name: 'Boobs', prompt: 'boobs focus', category: 'standing', isAdult: true },
  { id: 'adult-flashing-boobs', name: 'Flashing Boobs', prompt: 'flashing boobs', category: 'standing', isAdult: true },
  { id: 'adult-breast-squeeze-lactation', name: 'Breast Squeeze Lactation', prompt: 'breast squeeze lactation', category: 'standing', isAdult: true },
  { id: 'adult-licking-breasts', name: 'Licking Breasts', prompt: 'licking breasts', category: 'sitting', isAdult: true },
  { id: 'adult-fondled-boobs', name: 'Fondled Boobs', prompt: 'fondled boobs', category: 'standing', isAdult: true },
  { id: 'adult-groping-breasts', name: 'Groping Breasts', prompt: 'groping massage breasts', category: 'standing', isAdult: true },
  { id: 'adult-breast-pumping', name: 'Breast Pumping', prompt: 'breast pumping', category: 'standing', isAdult: true },
  { id: 'adult-self-nipple-sucking', name: 'Self Nipple Sucking', prompt: 'self nipple sucking', category: 'sitting', isAdult: true },
  // Anal (from MDC)
  { id: 'adult-anal-insertion', name: 'Anal Insertion', prompt: 'anal insertion', category: 'lying', isAdult: true },
  { id: 'adult-ass-stretch', name: 'Ass Stretch', prompt: 'ass stretch', category: 'lying', isAdult: true },
  { id: 'adult-futa-anal', name: 'Futa Anal', prompt: 'futa anal', category: 'lying', isAdult: true },
  // Cumshots (from MDC)
  { id: 'adult-pov-body-cumshot', name: 'POV Body Cumshot', prompt: 'POV body cumshot pullout', category: 'lying', isAdult: true },
  // Other (from MDC)
  { id: 'adult-twerk', name: 'Twerk', prompt: 'twerk showing ass', category: 'standing', isAdult: true },
  { id: 'adult-bouncy-walk', name: 'Bouncy Walk', prompt: 'bouncy walk', category: 'standing', isAdult: true },
  { id: 'adult-ahegao', name: 'Ahegao', prompt: 'ahegao face expression', category: 'standing', isAdult: true },
  { id: 'adult-dancing', name: 'Dancing', prompt: 'dancing', category: 'standing', isAdult: true },
  { id: 'adult-flirting', name: 'Flirting', prompt: 'flirting', category: 'standing', isAdult: true },
  { id: 'adult-bath-fun', name: 'Bath Fun', prompt: 'bath fun', category: 'sitting', isAdult: true },
  { id: 'adult-dildo-machine', name: 'Dildo Machine', prompt: 'dildo machine', category: 'lying', isAdult: true },
  { id: 'adult-giant-girls', name: 'Giant Girls', prompt: 'giant girls', category: 'standing', isAdult: true },
  { id: 'adult-butt-slapping', name: 'Butt Slapping', prompt: 'butt slapping', category: 'lying', isAdult: true },
  { id: 'adult-kissing-lesbian', name: 'Kissing Lesbian', prompt: 'kissing passionately lesbian', category: 'standing', isAdult: true },
  { id: 'adult-tribadism', name: 'Tribadism', prompt: 'tribadism', category: 'lying', isAdult: true },
  { id: 'adult-facesitting', name: 'Facesitting', prompt: 'facesitting', category: 'sitting', isAdult: true },
  { id: 'adult-sex-smash-cut', name: 'Sex Smash Cut', prompt: 'sex smash cut', category: 'lying', isAdult: true },
  { id: 'adult-finger-licking', name: 'Finger Licking', prompt: 'finger licking sucking', category: 'sitting', isAdult: true },
  { id: 'adult-side-splits', name: 'Side Splits', prompt: 'side splits start', category: 'sitting', isAdult: true },
  { id: 'adult-pussy-focus', name: 'Pussy Focus', prompt: 'pussy focus', category: 'lying', isAdult: true },
];

const ALL_POSES: Pose[] = [...SFW_POSES, ...ADULT_POSES];

interface PoseAsset {
  pose: Pose;
  outputPath: string;
  fullPrompt: string;
}

function getClothingForPose(pose: Pose): string {
  // Adult poses: no clothing (or minimal)
  if (pose.isAdult) {
    return 'nude, no clothing, bare skin';
  }

  // SFW poses: appropriate clothing based on pose category
  const clothingByCategory: Record<string, string> = {
    'standing': 'casual outfit, comfortable everyday clothing, stylish casual wear, modern fashion',
    'sitting': 'casual comfortable clothing, relaxed outfit, everyday wear, stylish casual attire',
    'action': 'athletic wear, sportswear, active clothing, fitness outfit, comfortable activewear',
    'expressive': 'casual outfit, comfortable everyday clothing, stylish casual wear, modern fashion',
  };

  // Default casual outfit for all SFW poses
  const defaultClothing = 'casual outfit, comfortable everyday clothing, stylish modern fashion, well-fitted clothes, appropriate attire';

  return clothingByCategory[pose.category] || defaultClothing;
}

function getAllPoseAssets(): PoseAsset[] {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const posesDir = path.join(publicDir, 'poses');

  if (!fs.existsSync(posesDir)) {
    fs.mkdirSync(posesDir, { recursive: true });
  }

  return ALL_POSES.map(pose => {
    // Build comprehensive prompt with character description + detailed pose + clothing + quality specs
    const characterDesc = getCharacterPrompt();
    const poseDescription = getDetailedPoseDescription(pose);
    const clothing = getClothingForPose(pose);

    // Combine: Character + Clothing + Pose + Quality + Style
    const fullPrompt = `${characterDesc}, ${clothing}, ${poseDescription}, ${BASE_STYLE}, full body visible, complete figure, professional studio photography`;

    return {
      pose,
      outputPath: path.join(posesDir, `${pose.id}.webp`),
      fullPrompt,
    };
  });
}

function getDetailedPoseDescription(pose: Pose): string {
  // Highly detailed pose descriptions with specific body positioning
  const detailedDescriptions: Record<string, string> = {
    'standing-casual': 'full body standing pose, relaxed casual stance, arms hanging naturally at sides, shoulders relaxed, feet positioned shoulder-width apart, natural weight distribution, comfortable posture, looking at camera with friendly expression',
    'standing-confident': 'full body standing pose, confident power stance, one hand placed on hip with elbow out, other arm relaxed at side, shoulders pulled back, chest slightly forward, feet planted firmly apart, strong upright posture, confident expression, looking directly at camera',
    'standing-walking': 'full body walking pose, natural mid-stride movement, one leg forward in walking motion, opposite arm swinging forward, dynamic body position, weight shifting, natural walking rhythm, captured in motion, looking ahead or at camera',
    'standing-leaning': 'full body standing pose, casually leaning against vertical surface, one shoulder and side of body touching wall, arms crossed comfortably in front, one leg crossed over the other at ankle, relaxed casual posture, looking at camera with relaxed expression',
    'sitting-relaxed': 'full body sitting pose, relaxed sitting position on comfortable surface, legs extended forward and slightly apart, back reclined against support, arms resting on armrests or lap, comfortable casual posture, looking at camera with relaxed expression',
    'sitting-cross': 'full body sitting pose, sitting cross-legged on floor or cushion, back straight and upright, hands resting on knees, legs crossed at ankles, meditative or yoga-like posture, calm expression, looking at camera or slightly downward',
    'sitting-perched': 'full body sitting pose, perched elegantly on edge of seat or surface, legs together and positioned to one side, leaning forward slightly with back straight, hands resting on thighs or seat edge, elegant poised posture, looking at camera with sophisticated expression',
    'sitting-lounging': 'full body sitting pose, lounging comfortably on sofa or chair, back reclined, one leg bent with foot on surface, other leg extended, arms relaxed, casual comfortable posture, looking at camera with relaxed expression',
    'action-dancing': 'full body dynamic pose, dancing movement captured mid-action, arms raised above head or extended to sides, one leg lifted or in motion, body twisted or turned, flowing movement, energetic expression, dynamic composition',
    'action-stretching': 'full body stretching pose, graceful stretching movement, arms reaching upward and extended, body elongated and extended, one leg may be raised or extended, yoga-like position, graceful lines, looking upward or at camera',
    'action-exercising': 'full body athletic pose, active workout position, athletic stance with muscles engaged, dynamic fitness position, body in motion or ready position, athletic clothing visible, energetic expression, fitness-focused composition',
    'action-playing': 'full body playful pose, dynamic action movement, engaging gesture with arms, playful body positioning, lively expression, movement captured, fun and energetic composition, looking at camera with playful expression',
    'action-jumping': 'full body jumping pose, mid-air jump captured, arms raised, legs extended, dynamic motion, energetic expression, movement frozen in time, looking at camera with joyful expression',
    'action-running': 'full body running pose, running motion captured, one leg forward, opposite arm swinging, dynamic body position, athletic movement, energetic expression, looking ahead or at camera',
    'action-yoga': 'full body yoga pose, peaceful meditative position, graceful stretching, balanced posture, calm expression, serene atmosphere, looking forward or at camera with peaceful expression',
    'action-sports': 'full body sports pose, athletic stance, dynamic sports position, muscles engaged, energetic expression, sports-focused composition, looking at camera with determined expression',
    'standing-arms-crossed': 'full body standing pose, arms crossed in front, confident or defensive stance, shoulders relaxed, feet positioned comfortably, looking at camera with determined or thoughtful expression',
    'standing-hands-pocket': 'full body standing pose, hands in pockets, casual relaxed stance, shoulders relaxed, comfortable posture, looking at camera with casual friendly expression',
    'standing-pointing': 'full body standing pose, one arm extended pointing, engaging gesture, body turned slightly, dynamic composition, looking at camera with engaging expression',
    'standing-waving': 'full body standing pose, one arm raised waving, friendly gesture, open body language, welcoming posture, looking at camera with friendly smile',
    'standing-thinking': 'full body standing pose, one hand on chin, thoughtful contemplative stance, head slightly tilted, introspective posture, looking at camera or slightly away with thoughtful expression',
    'sitting-edge': 'full body sitting pose, sitting on edge of seat, alert upright posture, leaning forward slightly, engaged position, looking at camera with attentive expression',
    'sitting-backward': 'full body sitting pose, sitting backward on chair, playful casual position, arms resting on chair back, relaxed but playful posture, looking at camera with playful expression',
    'sitting-reading': 'full body sitting pose, reading book or phone, relaxed comfortable position, focused on reading material, peaceful posture, looking down at reading material or at camera',
    'sitting-working': 'full body sitting pose, at desk or table, professional working position, focused on work, professional posture, looking at work or at camera with professional expression',
    'expressive-laughing': 'full body pose, laughing joyful expression, open mouth smile, eyes crinkled, body language showing joy, energetic happy composition, looking at camera with joyful expression',
    'expressive-thinking': 'full body pose, thinking contemplative expression, hand on chin or temple, thoughtful body language, introspective posture, looking at camera or away with thoughtful expression',
    'expressive-surprised': 'full body pose, surprised animated expression, wide eyes, open mouth, hands may be raised, dynamic surprised body language, looking at camera with surprised expression',
    'adult-standing-seductive': 'full body standing pose, seductive confident stance, one hand on hip with elbow out creating curve, other hand may touch hair or rest on body, slight hip tilt creating S-curve, shoulders back, confident alluring expression, looking at camera with sultry gaze',
    'adult-standing-alluring': 'full body standing pose, alluring confident posture, elegant body positioning with graceful curves, one hand on hip or touching body elegantly, sophisticated stance, refined posture, elegant expression, looking at camera with alluring gaze',
    'adult-standing-sensual': 'full body standing pose, sensual relaxed stance, natural curves emphasized through body positioning, relaxed but elegant posture, soft positioning, graceful lines, sensual expression, looking at camera with soft gaze',
    'adult-sitting-sensual': 'full body sitting pose, sensual sitting position, legs positioned elegantly to one side or crossed, graceful body curves, sophisticated posture, elegant positioning, sensual expression, looking at camera with sophisticated gaze',
    'adult-sitting-suggestive': 'full body sitting pose, suggestive perched position, leaning forward slightly on edge of seat, legs positioned elegantly, alluring body positioning, elegant and suggestive posture, looking at camera with alluring expression',
    'adult-sitting-elegant': 'full body sitting pose, elegant sensual positioning, refined sophisticated posture, graceful body lines, elegant leg positioning, sophisticated pose, refined expression, looking at camera with elegant gaze',
    'adult-lying-elegant': 'full body reclining pose, lying down gracefully on surface, elegant positioning with refined posture, graceful body curves, sophisticated reclining position, elegant expression, looking at camera with refined gaze',
    'adult-lying-alluring': 'full body reclining pose, lying down elegantly, graceful curves emphasized, sophisticated positioning, alluring reclining posture, elegant lines, alluring expression, looking at camera with alluring gaze',
    'adult-lying-sensual': 'full body reclining pose, lying down gracefully, natural elegant positioning, graceful body positioning, refined reclining posture, sensual expression, looking at camera with sensual gaze',
  };

  return detailedDescriptions[pose.id] || pose.prompt;
}

async function ensureDirectories(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'apps', 'web', 'public');
  const dirs = ['poses', 'characters'];

  for (const dir of dirs) {
    const dirPath = path.join(publicDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created directory: ${dirPath}`);
    }
  }
}


async function saveImageAsWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
  fs.writeFileSync(outputPath, imageBuffer);
}

async function generatePoseFromPrompt(
  prompt: string,
  outputPath: string,
  poseName: string,
  client: ComfyUIPodClient,
  isAdult: boolean = false
): Promise<void> {
  console.log(`\n📸 Generating: ${poseName}${isAdult ? ' (Adult)' : ' (SFW)'}`);
  console.log(`   Prompt: ${prompt.substring(0, 100)}...`);

  // Build negative prompt - add clothing-related negatives based on pose type
  const baseNegative = 'deformed, blurry, bad anatomy, ugly, low quality, watermark, signature, multiple people, extra limbs, distorted face, bad hands, missing fingers, extra fingers, mutated hands, poorly drawn hands, bad proportions, long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame, extra limbs, bad body, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes, text, watermark, signature';

  // For SFW poses, ensure clothing is present (negative: no clothing)
  const negativePrompt = isAdult
    ? baseNegative
    : `${baseNegative}, nude, naked, no clothing, bare skin, exposed`;

  // Build Z-Image Turbo workflow
  const workflow = buildZImageSimpleWorkflow({
    prompt,
    negativePrompt,
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
    steps: 9, // Z-Image Turbo uses 9 steps (8 DiT forwards)
    cfg: 1.0, // Z-Image Turbo uses cfg 1.0
    seed: Math.floor(Math.random() * 2 ** 32),
    filenamePrefix: `ryla_pose_${poseName.toLowerCase().replace(/\s+/g, '_')}`,
  });

  console.log(`   ✓ Workflow built, queuing to ComfyUI pod...`);

  // Execute workflow (queues and polls until complete)
  const result = await client.executeWorkflow(workflow);

  if (result.status === 'failed' || !result.images || result.images.length === 0) {
    throw new Error(result.error || 'ComfyUI generation failed - no images returned');
  }

  // Get first image (base64 data URL)
  const imageDataUrl = result.images[0];

  // Convert data URL to buffer
  const base64Data = imageDataUrl.split(',')[1];
  const imageBuffer = Buffer.from(base64Data, 'base64');

  // Save as WebP
  await saveImageAsWebP(imageBuffer, outputPath);

  console.log(`   ✓ Saved to ${outputPath}`);
}

async function main() {
  console.log('🎨 Studio Pose Thumbnail Generator');
  console.log('=====================================\n');

  // Check for ComfyUI pod URL
  const comfyuiPodUrl = process.env.COMFYUI_POD_URL;
  if (!comfyuiPodUrl) {
    console.error('❌ COMFYUI_POD_URL environment variable is required');
    console.error('   Set it in your .env file: COMFYUI_POD_URL=https://your-pod-id-8188.proxy.runpod.net');
    process.exit(1);
  }

  // Initialize ComfyUI pod client
  console.log(`🔗 Connecting to ComfyUI pod: ${comfyuiPodUrl}`);
  const client = new ComfyUIPodClient({
    baseUrl: comfyuiPodUrl,
    timeout: 180000, // 3 minutes timeout
  });

  // Health check
  const isHealthy = await client.healthCheck();
  if (!isHealthy) {
    console.error('❌ ComfyUI pod is not responding. Please check the pod URL and ensure the pod is running.');
    process.exit(1);
  }
  console.log('✓ ComfyUI pod is healthy\n');

  // Ensure directories exist
  await ensureDirectories();

  // Load character description
  console.log('📋 Character Analysis:');
  console.log(`   ${getCharacterPrompt().substring(0, 120)}...`);
  console.log('✓ Character description loaded\n');

  // Get all pose assets
  const poseAssets = getAllPoseAssets();
  console.log(`\n📋 Found ${poseAssets.length} poses to generate:`);
  console.log(`   - SFW: ${SFW_POSES.length}`);
  console.log(`   - Adult: ${ADULT_POSES.length}`);

  // Generate each pose
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < poseAssets.length; i++) {
    const asset = poseAssets[i];
    try {
      // Check if already exists
      if (fs.existsSync(asset.outputPath)) {
        console.log(`⏭️  Skipping ${asset.pose.name} (already exists)`);
        successCount++;
        continue;
      }

      await generatePoseFromPrompt(
        asset.fullPrompt,
        asset.outputPath,
        asset.pose.name,
        client,
        asset.pose.isAdult || false
      );
      successCount++;

      // Rate limiting: wait 1.5 seconds between requests
      if (i < poseAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error(`❌ Failed to generate ${asset.pose.name}:`, error);
      failCount++;

      // Wait longer on error
      if (i < poseAssets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Total: ${poseAssets.length}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { getAllPoseAssets, ensureDirectories, generatePoseFromPrompt };

