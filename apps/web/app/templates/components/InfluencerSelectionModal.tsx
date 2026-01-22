'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { X, Plus, User, ImageIcon } from 'lucide-react';
import { trpc } from '../../../lib/trpc';

interface Influencer {
  id: string;
  name: string;
  avatarUrl?: string | null;
  imageCount?: number;
}

interface InfluencerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (influencerId: string) => void;
  templateName?: string;
}

/**
 * InfluencerSelectionModal - Modal to select which influencer to apply a template to
 * Epic: EP-047 (Template Gallery UX Redesign)
 */
export function InfluencerSelectionModal({
  isOpen,
  onClose,
  onSelect,
  templateName,
}: InfluencerSelectionModalProps) {
  const { data, isLoading } = trpc.character.list.useQuery(undefined, {
    enabled: isOpen,
  });

  const influencers: Influencer[] = React.useMemo(() => {
    if (!data?.items) return [];
    return data.items.map((char) => ({
      id: char.id,
      name: char.name,
      avatarUrl: char.baseImageUrl ?? null,
      imageCount: char.imageCount ?? 0,
    }));
  }, [data]);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-md bg-[var(--bg-elevated)] rounded-2xl shadow-2xl',
          'border border-[var(--border-default)]',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Select Influencer
            </h2>
            {templateName && (
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Apply &ldquo;{templateName}&rdquo; to...
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]',
              'hover:bg-[var(--bg-subtle)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-subtle)] animate-pulse"
                >
                  <div className="h-12 w-12 rounded-full bg-[var(--bg-elevated)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 rounded bg-[var(--bg-elevated)]" />
                    <div className="h-3 w-16 rounded bg-[var(--bg-elevated)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : influencers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-[var(--text-tertiary)] mb-4" />
              <p className="text-[var(--text-secondary)] mb-4">
                No influencers yet
              </p>
              <a
                href="/wizard/step-0"
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl',
                  'bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)]',
                  'text-white hover:opacity-90 transition-opacity'
                )}
              >
                <Plus className="h-4 w-4" />
                Create Your First Influencer
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {influencers.map((influencer) => (
                <button
                  key={influencer.id}
                  onClick={() => onSelect(influencer.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
                    'bg-[var(--bg-subtle)] hover:bg-[var(--bg-primary)]',
                    'border border-transparent hover:border-[var(--purple-500)]/50',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-[var(--bg-elevated)] flex-shrink-0">
                    {influencer.avatarUrl ? (
                      <Image
                        src={influencer.avatarUrl}
                        alt={influencer.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <User className="h-6 w-6 text-[var(--text-tertiary)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {influencer.name}
                    </h3>
                    <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {influencer.imageCount ?? 0} images
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="text-[var(--text-tertiary)] group-hover:text-[var(--purple-400)]">
                    →
                  </div>
                </button>
              ))}

              {/* Create new option */}
              <a
                href="/wizard/step-0"
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl transition-all',
                  'bg-[var(--purple-500)]/5 hover:bg-[var(--purple-500)]/10',
                  'border border-dashed border-[var(--purple-500)]/30 hover:border-[var(--purple-500)]/50'
                )}
              >
                <div className="h-12 w-12 rounded-full bg-[var(--purple-500)]/20 flex items-center justify-center flex-shrink-0">
                  <Plus className="h-6 w-6 text-[var(--purple-400)]" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-[var(--purple-400)]">
                    Create New Influencer
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Start from scratch
                  </p>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
