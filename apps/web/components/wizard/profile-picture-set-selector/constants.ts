// Map set IDs to their preview images, theme colors, and position previews
// Uses position IDs from profile-picture-sets.ts for actual pose previews
export const setConfigs = {
  'classic-influencer': {
    // All 8 position IDs for preview images
    positions: [
      'beach-full-body', 'cafe-cross-legged', 'gym-stretching', 'rooftop-back-view',
      'park-dancing', 'street-leaning', 'home-lounging', 'pool-sitting-edge'
    ],
    gradient: 'from-orange-500 to-pink-500',
    bgGradient: 'from-orange-500/20 to-pink-500/10',
    borderColor: 'border-orange-400',
    shadowColor: 'shadow-orange-500/20',
    iconBg: 'bg-gradient-to-br from-orange-500/30 to-pink-500/30',
    badgeColor: 'bg-orange-500/20 text-orange-300',
    emoji: '✨',
    shortDesc: 'Beach • Café • Gym • Rooftop • Pool • Street • Home',
  },
  'professional-model': {
    // All 9 position IDs for preview images
    positions: [
      'runway-walk', 'studio-pose', 'gallery-side', 'rooftop-dramatic', 'sitting-elegant',
      'street-strut', 'boutique-leaning', 'studio-dynamic', 'close-up-beauty'
    ],
    gradient: 'from-blue-500 to-indigo-500',
    bgGradient: 'from-blue-500/20 to-indigo-500/10',
    borderColor: 'border-blue-400',
    shadowColor: 'shadow-blue-500/20',
    iconBg: 'bg-gradient-to-br from-blue-500/30 to-indigo-500/30',
    badgeColor: 'bg-blue-500/20 text-blue-300',
    emoji: '👗',
    shortDesc: 'Runway • Studio • Gallery • Street • Boutique',
  },
  'natural-beauty': {
    // All 8 position IDs for preview images
    positions: [
      'yoga-pose', 'forest-stretching', 'lake-lying', 'mountain-arms-up',
      'beach-walking-water', 'garden-sitting-floor', 'reading-lying', 'sunrise-stretch'
    ],
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-400',
    shadowColor: 'shadow-emerald-500/20',
    iconBg: 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-300',
    emoji: '🧘',
    shortDesc: 'Yoga • Nature • Garden • Beach • Reading',
  },
} as const;

