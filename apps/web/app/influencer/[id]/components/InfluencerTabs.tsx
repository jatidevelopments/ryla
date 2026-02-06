'use client';

import { LayoutGrid, Images, Heart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@ryla/ui';
import type { Post } from '@ryla/shared';
import { LoadingState } from '../../../../components/ui/loading-state';

interface InfluencerTabsProps {
  allImages: Post[];
  allPosts: Post[];
  likedPosts: Post[];
  likedImages: Post[];
  isLoadingImages: boolean;
  influencerId: string;
  onImageLike: (imageId: string) => void;
  onExport?: (post: { id: string; caption: string; imageUrl: string }) => void;
  influencerName?: string;
  influencerAvatar?: string;
}

export function InfluencerTabs({
  allImages,
  allPosts,
  likedPosts,
  likedImages,
  isLoadingImages,
  influencerId,
  onImageLike,
  onExport,
  influencerName,
  influencerAvatar,
}: InfluencerTabsProps) {
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
    <Tabs defaultValue="gallery" className="mt-4">
      {/* Tab Navigation */}
      <div className="mb-6">
        <TabsList className="inline-flex h-auto bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-1 gap-1">
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

      {/* Gallery Content */}
      <TabsContent value="gallery" className="mt-0">
        {isLoadingImages ? (
          <LoadingState
            title="Loading Images"
            message="Fetching gallery..."
            className="py-16"
          />
        ) : (
          <GalleryTab
            images={allImages}
            influencerId={influencerId}
            onLike={onImageLike}
            influencerName={influencerName}
            influencerAvatar={influencerAvatar}
          />
        )}
      </TabsContent>

      {/* Posts Content */}
      <TabsContent value="posts" className="mt-0">
        <PostsTab posts={allPosts} onExport={onExport || handleExport} />
      </TabsContent>

      {/* Liked Content */}
      <TabsContent value="liked" className="mt-0">
        <LikedTab
          likedPosts={likedPosts}
          likedImages={likedImages}
          influencerId={influencerId}
          onImageLike={onImageLike}
          onExport={onExport || handleExport}
          influencerName={influencerName}
          influencerAvatar={influencerAvatar}
        />
      </TabsContent>
    </Tabs>
  );
}

// Gallery Tab Component
function GalleryTab({
  images,
  influencerId,
  onLike,
  influencerName,
  influencerAvatar,
}: {
  images: Post[];
  influencerId: string;
  onLike: (imageId: string) => void;
  influencerName?: string;
  influencerAvatar?: string;
}) {
  const {
    ImageGallery,
  } = require('../../../../components/image-gallery/ImageGallery');

  return (
    <ImageGallery
      images={images}
      influencerId={influencerId}
      emptyMessage="No images generated yet"
      emptyAction={{
        label: 'Generate',
        href: `/studio?influencer=${influencerId}`,
      }}
      onLike={onLike}
      influencerName={influencerName}
      influencerAvatar={influencerAvatar}
    />
  );
}

// Posts Tab Component
function PostsTab({
  posts,
  onExport,
}: {
  posts: Post[];
  onExport: (post: { id: string; caption: string; imageUrl: string }) => void;
}) {
  const { PostGrid } = require('../../../../components/posts/PostGrid');

  return (
    <PostGrid posts={posts} onExport={onExport} emptyMessage="No posts yet" />
  );
}

// Liked Tab Component
function LikedTab({
  likedPosts,
  likedImages,
  influencerId,
  onImageLike,
  onExport,
  influencerName,
  influencerAvatar,
}: {
  likedPosts: Post[];
  likedImages: Post[];
  influencerId: string;
  onImageLike: (imageId: string) => void;
  onExport: (post: { id: string; caption: string; imageUrl: string }) => void;
  influencerName?: string;
  influencerAvatar?: string;
}) {
  const {
    ImageGallery,
  } = require('../../../../components/image-gallery/ImageGallery');
  const { PostGrid } = require('../../../../components/posts/PostGrid');
  const { LayoutGrid, Images } = require('lucide-react');

  if (likedPosts.length === 0 && likedImages.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-8">
      {likedPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Liked Posts ({likedPosts.length})
          </h3>
          <PostGrid posts={likedPosts} onExport={onExport} />
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
            onLike={onImageLike}
            influencerName={influencerName}
            influencerAvatar={influencerAvatar}
          />
        </div>
      )}
    </div>
  );
}
