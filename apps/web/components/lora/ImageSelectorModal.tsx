'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@ryla/ui';
import {
  X,
  Check,
  Heart,
  Loader2,
  Sparkles,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import {
  useAvailableTrainingImages,
  type TrainingImage,
} from '../../lib/hooks/use-lora-training';
import { calculateLoraTrainingCost } from '@ryla/shared';

interface ImageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedImageUrls: string[]) => void;
  characterId: string;
  characterName: string;
  isSubmitting?: boolean;
  creditBalance?: number;
}

const MIN_IMAGES = 5;
const MAX_IMAGES = 10;

export function ImageSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  characterId,
  characterName,
  isSubmitting = false,
  creditBalance = 0,
}: ImageSelectorModalProps) {
  const { data, isLoading, error } = useAvailableTrainingImages(
    isOpen ? characterId : null
  );

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Pre-select liked images on initial load
  React.useEffect(() => {
    if (data?.images && selectedIds.size === 0) {
      const likedImages = data.images.filter((img) => img.liked);
      if (likedImages.length >= MIN_IMAGES) {
        setSelectedIds(
          new Set(likedImages.slice(0, MAX_IMAGES).map((img) => img.id))
        );
      } else {
        // Pre-select all images up to MAX_IMAGES
        setSelectedIds(
          new Set(data.images.slice(0, MAX_IMAGES).map((img) => img.id))
        );
      }
    }
  }, [data?.images, selectedIds.size]);

  // Reset selection when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const toggleImage = (imageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else if (next.size < MAX_IMAGES) {
        next.add(imageId);
      }
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const canStartTraining = selectedCount >= MIN_IMAGES;
  const trainingCost = calculateLoraTrainingCost('flux', selectedCount);
  const hasEnoughCredits = creditBalance >= trainingCost;

  const handleConfirm = () => {
    if (!data?.images || !canStartTraining) return;
    const selectedUrls = data.images
      .filter((img) => selectedIds.has(img.id))
      .map((img) => img.url);
    onConfirm(selectedUrls);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-[var(--bg-elevated)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Select Training Images
                </h2>
                <p className="text-sm text-white/60 mt-0.5">
                  Choose images for LoRA training • {characterName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                  <p className="mt-3 text-sm text-white/60">
                    Loading images...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                  <p className="mt-3 text-sm text-red-300">
                    Failed to load images
                  </p>
                </div>
              ) : !data?.images.length ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-8 w-8 text-white/40" />
                  <p className="mt-3 text-sm text-white/60">
                    No images available for training
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Generate some images first in the Studio
                  </p>
                </div>
              ) : (
                <>
                  {/* Selection Info */}
                  <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            canStartTraining
                              ? 'text-green-300'
                              : 'text-amber-300'
                          )}
                        >
                          {selectedCount} / {MIN_IMAGES} minimum
                        </span>
                        {selectedCount > 0 && selectedCount < MIN_IMAGES && (
                          <span className="text-xs text-white/50">
                            (select {MIN_IMAGES - selectedCount} more)
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-white/50">
                        Max {MAX_IMAGES} images
                      </span>
                    </div>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {data.images.map((image) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        isSelected={selectedIds.has(image.id)}
                        isDisabled={
                          !selectedIds.has(image.id) &&
                          selectedCount >= MAX_IMAGES
                        }
                        onClick={() => toggleImage(image.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-[var(--bg-subtle)]">
              <div className="flex items-center justify-between gap-4">
                {/* Cost Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-white/80">
                      {trainingCost.toLocaleString()} credits
                    </span>
                  </div>
                  {!hasEnoughCredits && selectedCount >= MIN_IMAGES && (
                    <p className="text-xs text-red-300 mt-1">
                      Insufficient credits
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={
                      !canStartTraining || !hasEnoughCredits || isSubmitting
                    }
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
                      canStartTraining && hasEnoughCredits && !isSubmitting
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Start Training
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Image Card Component
// ============================================================================

interface ImageCardProps {
  image: TrainingImage;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

function ImageCard({ image, isSelected, isDisabled, onClick }: ImageCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative aspect-square rounded-xl overflow-hidden transition-all duration-200 group',
        isSelected
          ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[var(--bg-elevated)]'
          : 'hover:ring-1 hover:ring-white/20',
        isDisabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {/* Image */}
      <img
        src={image.thumbnailUrl || image.url}
        alt="Training image"
        className="w-full h-full object-cover"
      />

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity',
          isSelected ? 'bg-purple-500/20' : 'bg-black/0 group-hover:bg-black/20'
        )}
      />

      {/* Liked indicator */}
      {image.liked && (
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-pink-500/80 flex items-center justify-center">
          <Heart className="h-3.5 w-3.5 text-white fill-white" />
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-purple-500/30 shadow-lg">
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Unselected placeholder */}
      {!isSelected && !isDisabled && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full border-2 border-white/30 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
