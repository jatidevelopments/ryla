'use client';

import * as React from 'react';
import { FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { StudioHeader, StudioToolbar } from '../components/studio';
import { StudioGenerationBar } from '../components/studio/generation';
import { useTutorial } from '@ryla/ui';
import { DevPanel } from '../components/dev/dev-panel';
import { studioTutorialSteps } from './constants';
import { useStudioState } from './hooks';
import {
  StudioBackground,
  StudioMainContent,
  StudioTutorial,
} from './components';

export default function StudioPage() {
  return (
    <ProtectedRoute>
      <StudioContent />
    </ProtectedRoute>
  );
}

function StudioContent() {
  // Tutorial state
  const tutorial = useTutorial('studio', studioTutorialSteps, {
    autoStart: true,
  });

  // Consolidated state management
  const state = useStudioState();

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[var(--bg-base)]">
      <StudioBackground />

      {/* Studio Header - Influencer Tabs */}
      <FadeInUp>
        <StudioHeader
          influencers={state.influencerTabs}
          selectedInfluencerId={state.selectedInfluencerId}
          onSelectInfluencer={state.setSelectedInfluencerId}
          searchQuery={state.searchQuery}
          onSearchChange={state.setSearchQuery}
          totalCount={state.totalImageCount}
        />
      </FadeInUp>

      {/* Toolbar - Filters and View Options */}
      <FadeInUp delay={50}>
        <StudioToolbar
          viewMode={state.viewMode}
          onViewModeChange={state.setViewMode}
          aspectRatios={state.aspectRatios}
          onAspectRatioChange={state.setAspectRatios}
          status={state.status}
          onStatusChange={state.setStatus}
          liked={state.liked}
          onLikedChange={state.setLiked}
          adult={state.adult}
          onAdultChange={state.setAdult}
          sortBy={state.sortBy}
          onSortByChange={state.setSortBy}
          selectedCount={state.selectedImage ? 1 : 0}
          onClearSelection={() => state.setSelectedImage(null)}
        />
      </FadeInUp>

      {/* Main Content Area */}
      <StudioMainContent
        filteredImages={state.filteredImages}
        selectedImage={state.selectedImage}
        showPanel={state.showPanel}
        viewMode={state.viewMode}
        isLoading={state.isLoadingImages}
        onSelectImage={state.handleSelectImage}
        onLike={state.handleLike}
        onDownload={state.handleDownload}
        onClosePanel={state.handleClosePanel}
        onDelete={state.handleDelete}
        onRetry={state.handleRetry}
      />

      {/* Bottom Generation Bar */}
      <FadeInUp delay={150}>
        <StudioGenerationBar
          influencers={state.influencerList}
          selectedInfluencer={state.selectedInfluencerForGeneration}
          onInfluencerChange={(influencerId) => {
            // Sync influencer selection from bottom toolbar to top bar
            state.setSelectedInfluencerId(influencerId);
          }}
          onGenerate={state.handleGenerate}
          isGenerating={state.activeGenerations.size > 0}
          creditsAvailable={state.creditsBalance}
          selectedImage={state.selectedImage}
          onClearSelectedImage={() =>
            state.handleClearSelectedImage(state.mode)
          }
          mode={state.mode}
          contentType={state.contentType}
          onModeChange={state.setMode}
          onContentTypeChange={state.setContentType}
          nsfwEnabled={state.nsfwEnabled}
          availableImages={state.allImages}
          hasUploadConsent={state.hasConsent}
          onAcceptConsent={state.acceptConsent}
          onUploadImage={state.handleUploadImage}
        />
      </FadeInUp>

      {/* Tutorial Overlay */}
      <StudioTutorial tutorial={tutorial} />

      {/* Dev Panel (Development Only) */}
      <DevPanel
        onResetTutorial={(tutorialId) => {
          if (tutorialId === 'studio') {
            tutorial.reset();
          }
        }}
      />
    </div>
  );
}
