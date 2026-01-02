/**
 * AI Influencer types
 */

export interface AIInfluencer {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string | null;
  // Character attributes
  gender: 'female' | 'male';
  style: 'realistic' | 'anime';
  ethnicity: string;
  age: number;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  breastSize?: string;
  archetype: string;
  personalityTraits: string[];
  outfit: string;
  // Settings
  nsfwEnabled: boolean;
  // Profile picture set (null = skip)
  profilePictureSetId?: 'classic-influencer' | 'professional-model' | 'natural-beauty' | null;
  // Stats
  postCount: number;
  imageCount: number;
  likedCount: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  influencerId: string;
  imageUrl: string;
  caption: string;
  isLiked: boolean;
  // Generation context
  scene?: string;
  environment?: string;
  outfit?: string;
  aspectRatio: '1:1' | '9:16' | '2:3';
  // Timestamps
  createdAt: string;
}

export interface InfluencerWithPosts extends AIInfluencer {
  posts: Post[];
}

// Store types
export interface InfluencerStore {
  influencers: AIInfluencer[];
  posts: Post[];
  // Actions
  addInfluencer: (influencer: AIInfluencer) => void;
  updateInfluencer: (id: string, data: Partial<AIInfluencer>) => void;
  deleteInfluencer: (id: string) => void;
  // Post actions
  addPost: (post: Post) => void;
  toggleLike: (postId: string) => void;
  deletePost: (postId: string) => void;
  // Selectors
  getInfluencer: (id: string) => AIInfluencer | undefined;
  getInfluencerPosts: (influencerId: string) => Post[];
  getLikedPosts: (influencerId: string) => Post[];
}

