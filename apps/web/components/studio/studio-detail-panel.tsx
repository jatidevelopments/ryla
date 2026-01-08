'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { StudioImage } from './studio-image-card';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { useLightbox } from './hooks/useLightbox';
import { useDeleteConfirmation } from './hooks/useDeleteConfirmation';
import { ImageLightbox } from './components/ImageLightbox';
import { DetailPanelHeader } from './components/DetailPanelHeader';
import { DetailPanelImagePreview } from './components/DetailPanelImagePreview';
import { DetailPanelQuickActions } from './components/DetailPanelQuickActions';
import { DetailPanelDeleteConfirmation } from './components/DetailPanelDeleteConfirmation';
import { DetailPanelInfluencerSection } from './components/DetailPanelInfluencerSection';
import { DetailPanelGenerationDetails } from './components/DetailPanelGenerationDetails';
import { DetailPanelMetadata } from './components/DetailPanelMetadata';
import { DetailPanelEmptyState } from './components/DetailPanelEmptyState';

interface StudioDetailPanelProps {
  image: StudioImage | null;
  onClose: () => void;
  onLike?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  onDownload?: (image: StudioImage) => void;
  onRetry?: (image: StudioImage) => void;
  className?: string;
  variant?: 'panel' | 'modal'; // 'panel' for desktop side panel, 'modal' for mobile bottom sheet
}

export function StudioDetailPanel({
  image,
  onClose,
  onLike,
  onDelete,
  onDownload,
  onRetry,
  className,
  variant = 'panel',
}: StudioDetailPanelProps) {
  const { showLightbox, setShowLightbox } = useLightbox();
  const {
    showDeleteConfirm,
    setShowDeleteConfirm,
    confirmDelete,
    cancelDelete,
  } = useDeleteConfirmation();
  const { copied, copiedId, copy } = useCopyToClipboard();

  const handleCopyPrompt = React.useCallback(() => {
    const promptToCopy = image?.enhancedPrompt || image?.prompt;
    if (promptToCopy) {
      copy(promptToCopy);
    }
  }, [image, copy]);

  const handleCopyId = React.useCallback(() => {
    if (image?.id) {
      copy(image.id, 'id');
    }
  }, [image, copy]);

  const handleDelete = React.useCallback(() => {
    if (image) {
      onDelete?.(image.id);
      setShowDeleteConfirm(false);
    }
  }, [image, onDelete, setShowDeleteConfirm]);

  // Render the main content (shared between mobile and desktop)
  const renderContent = () => {
    if (!image) return null;

    return (
      <>
        <DetailPanelImagePreview
          image={image}
          onOpenLightbox={() => setShowLightbox(true)}
          onRetry={onRetry}
        />

        <DetailPanelQuickActions
          image={image}
          onLike={onLike}
          onDownload={onDownload}
          onRetry={onRetry}
          onDeleteClick={confirmDelete}
        />

        {showDeleteConfirm && (
          <DetailPanelDeleteConfirmation
            onConfirm={handleDelete}
            onCancel={cancelDelete}
          />
        )}

        <DetailPanelInfluencerSection image={image} />

        <DetailPanelGenerationDetails
          image={image}
          onCopyPrompt={handleCopyPrompt}
          copied={copied}
        />

        <DetailPanelMetadata
          image={image}
          onCopyId={handleCopyId}
          copiedId={copiedId === 'id'}
        />
      </>
    );
  };

  // Mobile modal variant - bottom sheet
  if (variant === 'modal') {
    if (!image) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
            'bg-[var(--bg-elevated)] rounded-t-3xl border-t border-[var(--border-default)]',
            'max-h-[90vh] overflow-hidden',
            'animate-in slide-in-from-bottom-full duration-300',
            'lg:hidden',
            className
          )}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1.5 w-12 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <DetailPanelHeader
            onOpenLightbox={() => setShowLightbox(true)}
            onClose={onClose}
            isMobile={true}
          />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>

        {/* Lightbox */}
        {image && (
          <ImageLightbox
            image={image}
            isOpen={showLightbox}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </>
    );
  }

  // Desktop panel variant - empty state
  if (!image) {
    return <DetailPanelEmptyState className={className} />;
  }

  // Desktop panel variant - with content
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <DetailPanelHeader
        onOpenLightbox={() => setShowLightbox(true)}
        onClose={onClose}
        isMobile={false}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>

      {/* Lightbox */}
      <ImageLightbox
        image={image}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
      />
    </div>
  );
}
