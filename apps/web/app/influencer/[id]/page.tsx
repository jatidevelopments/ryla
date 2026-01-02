'use client';

import * as React from 'react';
import { useParams, notFound } from 'next/navigation';
import {
  useInfluencer,
  useInfluencerPosts,
  useLikedPosts,
  useInfluencerImages,
  useInfluencerStore,
} from '@ryla/business';
import {
  PageContainer,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@ryla/ui';
import { InfluencerProfile } from '../../../components/influencer-profile';
import { ProfilePicturesPanel } from '../../../components/profile-pictures/profile-pictures-panel';
import { PostGrid } from '../../../components/post-grid';
import { ImageGallery } from '../../../components/image-gallery';
import { ProtectedRoute } from '../../../components/protected-route';
import { LayoutGrid, Images, Heart } from 'lucide-react';
import { trpc } from '../../../lib/trpc';

export default function InfluencerProfilePage() {
  return (
    <ProtectedRoute>
      <InfluencerProfileContent />
    </ProtectedRoute>
  );
}

function InfluencerProfileContent() {
  const params = useParams();
  const influencerId = params.id as string;

  const influencer = useInfluencer(influencerId);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const { data: character, isLoading } = trpc.character.getById.useQuery(
    { id: influencerId },
    { enabled: !influencer }
  );
  const allPosts = useInfluencerPosts(influencerId);
  const likedPosts = useLikedPosts(influencerId);
  const allImages = useInfluencerImages(influencerId);
  const likedImages = allImages.filter((img) => img.isLiked);

  React.useEffect(() => {
    if (!influencer && character) {
      addInfluencer({
        id: character.id,
        name: character.name,
        handle: character.handle || `@${character.name.toLowerCase().replace(/\s+/g, '.')}`,
        bio: character.config?.bio || 'New AI influencer ✨',
        avatar: character.baseImageUrl || null,
        gender: character.config?.gender || 'female',
        style: character.config?.style || 'realistic',
        ethnicity: character.config?.ethnicity || 'caucasian',
        age: character.config?.age || 25,
        hairStyle: character.config?.hairStyle || 'long-straight',
        hairColor: character.config?.hairColor || 'brown',
        eyeColor: character.config?.eyeColor || 'brown',
        bodyType: character.config?.bodyType || 'slim',
        breastSize: character.config?.breastSize,
        archetype: character.config?.archetype || 'girl-next-door',
        personalityTraits: character.config?.personalityTraits || [],
        outfit: character.config?.defaultOutfit || 'casual',
        nsfwEnabled: character.config?.nsfwEnabled || false,
        profilePictureSetId: character.config?.profilePictureSetId || undefined,
        postCount: parseInt(character.postCount || '0', 10),
        imageCount: 0,
        likedCount: parseInt(character.likedCount || '0', 10),
        createdAt: character.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: character.updatedAt?.toISOString() || new Date().toISOString(),
      });
    }
  }, [addInfluencer, character, influencer]);

  if (!influencer && isLoading) {
    return null;
  }

  if (!influencer && !character) {
    notFound();
  }

  const handleExport = (post: {
    id: string;
    caption: string;
    imageUrl: string;
  }) => {
    // Simulate export - in production this would trigger download + copy
    navigator.clipboard.writeText(post.caption);
    alert(`Exported: ${post.caption.substring(0, 50)}...`);
  };

  return (
    <>
      {/* Profile Header */}
      <InfluencerProfile influencer={influencer} />
      <ProfilePicturesPanel influencer={influencer} />

      {/* Content */}
      <PageContainer>
        <Tabs defaultValue="posts" className="mt-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <TabsList className="inline-flex h-auto bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-1 gap-1">
              {/* Posts Tab */}
              <TabsTrigger
                value="posts"
                className="relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--text-secondary)] data-[state=inactive]:hover:text-[var(--text-primary)]"
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Posts</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-[var(--purple-500)]/10 px-2 py-0.5 text-xs font-medium text-[var(--purple-400)]">
                    {allPosts.length}
                  </span>
                </span>
              </TabsTrigger>

              {/* Gallery Tab */}
              <TabsTrigger
                value="gallery"
                className="relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--text-secondary)] data-[state=inactive]:hover:text-[var(--text-primary)]"
              >
                <span className="flex items-center gap-2">
                  <Images className="h-4 w-4" />
                  <span className="hidden sm:inline">Gallery</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-[var(--purple-500)]/10 px-2 py-0.5 text-xs font-medium text-[var(--purple-400)]">
                    {allImages.length}
                  </span>
                </span>
              </TabsTrigger>

              {/* Liked Tab */}
              <TabsTrigger
                value="liked"
                className="relative rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-sm data-[state=inactive]:text-[var(--text-secondary)] data-[state=inactive]:hover:text-[var(--text-primary)]"
              >
                <span className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Liked</span>
                  <span className="inline-flex items-center justify-center rounded-full bg-[var(--pink-500)]/10 px-2 py-0.5 text-xs font-medium text-[var(--pink-400)]">
                    {likedPosts.length + likedImages.length}
                  </span>
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Posts Content */}
          <TabsContent value="posts" className="mt-0">
            <PostGrid
              posts={allPosts}
              onExport={handleExport}
              emptyMessage="No posts yet"
              emptyAction={{
                label: 'Create First Post',
                href: `/influencer/${influencerId}/studio`,
              }}
            />
          </TabsContent>

          {/* Gallery Content */}
          <TabsContent value="gallery" className="mt-0">
            <ImageGallery
              images={allImages}
              influencerId={influencerId}
              emptyMessage="No images generated yet"
              emptyAction={{
                label: 'Generate Images',
                href: `/influencer/${influencerId}/studio`,
              }}
            />
          </TabsContent>

          {/* Liked Content */}
          <TabsContent value="liked" className="mt-0">
            {likedPosts.length > 0 || likedImages.length > 0 ? (
              <div className="space-y-8">
                {likedPosts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Liked Posts ({likedPosts.length})
                    </h3>
                    <PostGrid posts={likedPosts} onExport={handleExport} />
                  </div>
                )}
                {likedImages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                      <Images className="h-4 w-4" />
                      Liked Images ({likedImages.length})
                    </h3>
                    <ImageGallery
                      images={likedImages}
                      influencerId={influencerId}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--pink-500)]/20 to-[var(--purple-500)]/20 rounded-2xl blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                    <Heart className="h-8 w-8 text-[var(--pink-400)]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  No liked content yet
                </h3>
                <p className="text-sm text-[var(--text-muted)] max-w-sm">
                  Like posts or images to save them here for quick access
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
}
