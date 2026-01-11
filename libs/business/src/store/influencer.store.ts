import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import type { AIInfluencer, Post, InfluencerStore } from '@ryla/shared';

/**
 * Store for managing AI Influencers and their posts
 * Persists to localStorage for development
 */
export const useInfluencerStore = create<InfluencerStore>()(
  persist(
    immer((set, get) => ({
      // Initial state - empty (user creates their own influencers)
      influencers: [],
      posts: [],

      // Influencer actions
      addInfluencer: (influencer: AIInfluencer) => {
        set((state: any) => {
          state.influencers.push(influencer);
        });
      },

      updateInfluencer: (id: string, data: Partial<AIInfluencer>) => {
        set((state: any) => {
          const index = state.influencers.findIndex((i: AIInfluencer) => i.id === id);
          if (index !== -1) {
            state.influencers[index] = {
              ...state.influencers[index],
              ...data,
              updatedAt: new Date().toISOString(),
            };
          }
        });
      },

      deleteInfluencer: (id: string) => {
        set((state: any) => {
          state.influencers = state.influencers.filter((i: AIInfluencer) => i.id !== id);
          // Also delete all posts for this influencer
          state.posts = state.posts.filter((p: Post) => p.influencerId !== id);
        });
      },

      // Post actions
      addPost: (post: Post) => {
        set((state: any) => {
          state.posts.unshift(post); // Add to beginning
          // Update influencer stats
          const influencer = state.influencers.find(
            (i: AIInfluencer) => i.id === post.influencerId
          );
          if (influencer) {
            influencer.postCount += 1;
            influencer.imageCount += 1;
            influencer.updatedAt = new Date().toISOString();
          }
        });
      },

      toggleLike: (postId: string) => {
        set((state: any) => {
          const post = state.posts.find((p: Post) => p.id === postId);
          if (post) {
            const wasLiked = post.isLiked;
            post.isLiked = !wasLiked;
            // Update influencer liked count
            const influencer = state.influencers.find(
              (i: AIInfluencer) => i.id === post.influencerId
            );
            if (influencer) {
              influencer.likedCount += wasLiked ? -1 : 1;
            }
          }
        });
      },

      deletePost: (postId: string) => {
        set((state: any) => {
          const post = state.posts.find((p: Post) => p.id === postId);
          if (post) {
            // Update influencer stats
            const influencer = state.influencers.find(
              (i: AIInfluencer) => i.id === post.influencerId
            );
            if (influencer) {
              influencer.postCount -= 1;
              influencer.imageCount -= 1;
              if (post.isLiked) {
                influencer.likedCount -= 1;
              }
            }
            // Remove post
            state.posts = state.posts.filter((p: Post) => p.id !== postId);
          }
        });
      },

      // Selectors
      getInfluencer: (id: string) => {
        return get().influencers.find((i: AIInfluencer) => i.id === id);
      },

      getInfluencerPosts: (influencerId: string) => {
        return get()
          .posts.filter((p: Post) => p.influencerId === influencerId)
          .sort(
            (a: Post, b: Post) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },

      getLikedPosts: (influencerId: string) => {
        return get()
          .posts.filter((p: Post) => p.influencerId === influencerId && p.isLiked)
          .sort(
            (a: Post, b: Post) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },
    })),
    {
      name: 'ryla-influencer-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Helper hooks for common patterns - use useShallow to prevent infinite re-renders
export const useInfluencer = (id: string) => {
  return useInfluencerStore((state) => state.influencers.find((i: AIInfluencer) => i.id === id));
};

export const useInfluencerPosts = (influencerId: string) => {
  return useInfluencerStore(
    useShallow((state) =>
      state.posts
        .filter((p: Post) => p.influencerId === influencerId)
        .sort((a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    )
  );
};

export const useLikedPosts = (influencerId: string) => {
  return useInfluencerStore(
    useShallow((state) =>
      state.posts
        .filter((p: Post) => p.influencerId === influencerId && p.isLiked)
        .sort((a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    )
  );
};

/**
 * Hook to get all images for an influencer (gallery view)
 * Images are the same as posts but displayed in gallery format
 */
export const useInfluencerImages = (influencerId: string) => {
  return useInfluencerStore(
    useShallow((state) =>
      state.posts
        .filter((p: Post) => p.influencerId === influencerId)
        .sort((a: Post, b: Post) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    )
  );
};

export const useAllInfluencers = () => {
  return useInfluencerStore(useShallow((state) => state.influencers));
};

