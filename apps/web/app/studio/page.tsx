'use client';

import * as React from 'react';
import { useAllInfluencers, useInfluencerStore } from '@ryla/business';
import { ProtectedRoute } from '../../components/protected-route';
import {
  StudioGallery,
  StudioHeader,
  StudioToolbar,
  StudioDetailPanel,
  type StudioImage,
  type ViewMode,
  type AspectRatioFilter,
  type StatusFilter,
  type SortBy,
} from '../../components/studio';
import {
  StudioGenerationBar,
  type GenerationSettings,
} from '../../components/studio/generation';

export default function StudioPage() {
  return (
    <ProtectedRoute>
      <StudioContent />
    </ProtectedRoute>
  );
}

function StudioContent() {
  const influencers = useAllInfluencers() || [];
  const posts = useInfluencerStore((state) => state.posts) || [];
  const toggleLike = useInfluencerStore((state) => state.toggleLike);
  const deletePost = useInfluencerStore((state) => state.deletePost);

  // Filter states
  const [selectedInfluencerId, setSelectedInfluencerId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [aspectRatio, setAspectRatio] = React.useState<AspectRatioFilter>('all');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [sortBy, setSortBy] = React.useState<SortBy>('newest');

  // Detail panel state
  const [selectedImage, setSelectedImage] = React.useState<StudioImage | null>(null);
  const [showPanel, setShowPanel] = React.useState(true);

  // Generation state
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Transform posts to StudioImage format
  const allImages: StudioImage[] = React.useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) {
      return [];
    }
    return posts.map((post) => {
      const influencer = influencers.find((i) => i.id === post.influencerId);
      return {
        id: post.id,
        imageUrl: post.imageUrl,
        influencerId: post.influencerId,
        influencerName: influencer?.name || 'Unknown',
        influencerAvatar: influencer?.avatar || undefined,
        prompt: post.caption,
        scene: post.scene,
        environment: post.environment,
        aspectRatio: post.aspectRatio,
        status: 'completed' as const,
        createdAt: post.createdAt,
        isLiked: post.isLiked,
      };
    });
  }, [posts, influencers]);

  // Calculate image counts per influencer
  const influencerTabs = React.useMemo(() => {
    if (!Array.isArray(influencers) || influencers.length === 0) {
      return [];
    }
    return influencers.map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      avatar: influencer.avatar || undefined,
      imageCount: allImages.filter((img) => img.influencerId === influencer.id).length,
    }));
  }, [influencers, allImages]);

  // Get influencer list for generation bar
  const influencerList = React.useMemo(() => {
    if (!Array.isArray(influencers) || influencers.length === 0) {
      return [];
    }
    return influencers.map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      avatar: influencer.avatar || undefined,
    }));
  }, [influencers]);

  // Selected influencer for generation
  const selectedInfluencerForGeneration = React.useMemo(() => {
    if (selectedInfluencerId) {
      return influencerList.find((i) => i.id === selectedInfluencerId) || null;
    }
    return influencerList[0] || null;
  }, [selectedInfluencerId, influencerList]);

  // Filter images
  const filteredImages = React.useMemo(() => {
    let result = [...allImages];

    // Filter by influencer
    if (selectedInfluencerId) {
      result = result.filter((img) => img.influencerId === selectedInfluencerId);
    }

    // Filter by status
    if (status !== 'all') {
      result = result.filter((img) => img.status === status);
    }

    // Filter by aspect ratio
    if (aspectRatio !== 'all') {
      result = result.filter((img) => img.aspectRatio === aspectRatio);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.prompt?.toLowerCase().includes(search) ||
          img.influencerName.toLowerCase().includes(search) ||
          img.scene?.toLowerCase().includes(search) ||
          img.environment?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allImages, selectedInfluencerId, status, aspectRatio, searchQuery, sortBy]);

  // Handle image selection
  const handleSelectImage = (image: StudioImage | null) => {
    setSelectedImage(image);
    if (image) {
      setShowPanel(true);
    }
  };

  // Handle like
  const handleLike = (imageId: string) => {
    toggleLike(imageId);
    // Update selected image if it's the one being liked
    if (selectedImage?.id === imageId) {
      setSelectedImage((prev) =>
        prev ? { ...prev, isLiked: !prev.isLiked } : null
      );
    }
  };

  // Handle delete
  const handleDelete = (imageId: string) => {
    deletePost(imageId);
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  // Handle download
  const handleDownload = async (image: StudioImage) => {
    if (!image.imageUrl) return;
    
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryla-${image.influencerName.toLowerCase().replace(/\s+/g, '-')}-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Handle generate
  const handleGenerate = async (settings: GenerationSettings) => {
    console.log('Generating with settings:', settings);
    setIsGenerating(true);
    
    // Simulate generation delay (replace with actual API call)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    // TODO: Add actual generation logic and add new image to store
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#0a0a0b]">
      {/* Studio Header - Influencer Tabs */}
      <StudioHeader
        influencers={influencerTabs}
        selectedInfluencerId={selectedInfluencerId}
        onSelectInfluencer={setSelectedInfluencerId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={allImages.length}
      />

      {/* Toolbar - Filters and View Options */}
      <StudioToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        selectedCount={selectedImage ? 1 : 0}
        onClearSelection={() => setSelectedImage(null)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Gallery */}
        <div className="flex-1 overflow-y-auto p-4">
          <StudioGallery
            images={filteredImages}
            selectedImage={selectedImage}
            onSelectImage={handleSelectImage}
            onQuickLike={handleLike}
            onQuickDownload={handleDownload}
            viewMode={viewMode}
          />
        </div>

        {/* Right Panel - Detail View */}
        {showPanel && (
          <StudioDetailPanel
            image={selectedImage}
            onClose={() => {
              setSelectedImage(null);
              setShowPanel(false);
            }}
            onLike={handleLike}
            onDelete={handleDelete}
            onDownload={handleDownload}
            className="hidden w-[380px] flex-shrink-0 lg:flex"
          />
        )}
      </div>

      {/* Bottom Generation Bar */}
      <StudioGenerationBar
        influencers={influencerList}
        selectedInfluencer={selectedInfluencerForGeneration}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        creditsAvailable={250}
      />
    </div>
  );
}
