'use client';

import * as React from 'react';
import { FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { StudioHeader, StudioToolbar } from '../../components/studio';
import { StudioGenerationBar } from '../../components/studio/generation';
import { useTutorial } from '@ryla/ui';
import { DevPanel } from '../../components/dev/dev-panel';
import { studioTutorialSteps } from './constants';
import { useStudioState } from './hooks';
import {
  StudioBackground,
  StudioMainContent,
  StudioDetailPanels,
  StudioTutorial,
} from './components';
import { LockScreen } from '../../components/ui/lock-screen';

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

  // Check if user has any influencers
  const hasInfluencers = state.influencerList.length > 0;

  // Show lock screen if no influencers exist
  if (!hasInfluencers) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden bg-[var(--bg-base)] h-full">
        <LockScreen
          title="Studio Locked"
          description="Create your first AI influencer to unlock the Studio and start generating amazing content."
          createButtonText="Create Influencer"
          createButtonHref="/wizard/step-0"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-base)] relative">
      <StudioBackground />

      {/* Studio Header - Influencer Tabs (Full Width) */}
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

      {/* Toolbar - Filters and View Options (Full Width) */}
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

      {/* Main Integrated Layout - Flex Row (Everything here is pushed by side panel) */}
      <div className="flex flex-1 w-full overflow-hidden relative">
        {/* Left Column - Content (Gallery & Gen Bar) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Main Content Area (Gallery) */}
          <div className="flex-1 overflow-hidden relative">
            <StudioMainContent
              filteredImages={state.filteredImages}
              selectedImage={state.selectedImage}
              showPanel={state.showPanel}
              viewMode={state.viewMode}
              isLoading={state.isLoadingImages}
              onSelectImage={state.handleSelectImage}
              onOpenDetails={state.handleOpenDetails}
              onLike={state.handleLike}
              onDownload={state.handleDownload}
              onClosePanel={state.handleClosePanel}
              onDelete={state.handleDelete}
              onRetry={state.handleRetry}
            />
          </div>

          {/* Bottom Generation Bar - Integrated within the flex flow */}
          <div className="flex-shrink-0 z-40 pb-[64px] md:pb-1">
            <FadeInUp delay={150}>
              <StudioGenerationBar
                influencers={state.influencerList}
                selectedInfluencer={state.selectedInfluencerForGeneration}
                onInfluencerChange={(influencerId) => {
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
          </div>
        </div>

        {/* Right Column - Detail Panels (Integrated) */}
        <StudioDetailPanels
          showPanel={state.showPanel}
          selectedImage={state.selectedImage}
          onClose={state.handleClosePanel}
          onLike={state.handleLike}
          onDelete={state.handleDelete}
          onDownload={state.handleDownload}
          onRetry={state.handleRetry}
        />
      </div>

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
