'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import {
  X,
  Heart,
  Play,
  Image as ImageIcon,
  Video,
  Mic,
  AudioLines,
  Layers,
  Eye,
  Tag,
} from 'lucide-react';
import { trpc } from '../../../lib/trpc';

export type ContentType = 'all' | 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';

interface TemplateDetailModalProps {
  templateId: string | null;
  isSet?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
}

const contentTypeConfig: Record<ContentType, { icon: React.ReactNode; label: string }> = {
  all: { icon: <Layers className="h-4 w-4" />, label: 'All' },
  image: { icon: <ImageIcon className="h-4 w-4" />, label: 'Image' },
  video: { icon: <Video className="h-4 w-4" />, label: 'Video' },
  lip_sync: { icon: <Mic className="h-4 w-4" />, label: 'Lip Sync' },
  audio: { icon: <AudioLines className="h-4 w-4" />, label: 'Audio' },
  mixed: { icon: <Layers className="h-4 w-4" />, label: 'Mixed' },
};

/**
 * TemplateDetailModal - Full template details modal
 * Epic: EP-047 (Template Gallery UX Redesign)
 */
export function TemplateDetailModal({
  templateId,
  isSet = false,
  isOpen,
  onClose,
  onApply,
}: TemplateDetailModalProps) {
  const [isLiked, setIsLiked] = React.useState(false);

  // Fetch template or set details
  const { data: templateData, isLoading } = trpc.templates.getById.useQuery(
    { id: templateId! },
    { enabled: isOpen && !!templateId && !isSet }
  );

  const { data: setData, isLoading: isSetLoading } = trpc.templateSets.getByIdWithMembers.useQuery(
    { id: templateId! },
    { enabled: isOpen && !!templateId && isSet }
  );

  const data = isSet ? setData?.set : templateData?.template;
  const loading = isSet ? isSetLoading : isLoading;

  // Member thumbnails for sets (how the templates in the set combine visually)
  const memberThumbnails = React.useMemo(() => {
    if (!isSet || !setData?.set || !('members' in setData.set)) return [];
    const members = (setData.set as { members?: Array<{ template?: { thumbnailUrl?: string; previewImageUrl?: string } }> }).members ?? [];
    return members
      .map((m) => m.template?.thumbnailUrl || m.template?.previewImageUrl)
      .filter(Boolean) as string[];
  }, [isSet, setData?.set]);

  // Full list of member templates for the "Templates in this set" grid
  type SetMember = { template?: { id: string; name: string; thumbnailUrl?: string; previewImageUrl?: string } };
  const setMembers = React.useMemo((): SetMember[] => {
    if (!isSet || !setData?.set || !('members' in setData.set)) return [];
    return (setData.set as { members?: SetMember[] }).members ?? [];
  }, [isSet, setData?.set]);

  // Like mutations
  const likeMutation = trpc.templateLikes.like.useMutation();
  const unlikeMutation = trpc.templateLikes.unlike.useMutation();

  // Check if liked
  const { data: likeStatus } = trpc.templateLikes.isLiked.useQuery(
    { templateId: templateId! },
    { enabled: isOpen && !!templateId && !isSet }
  );

  React.useEffect(() => {
    if (likeStatus) {
      setIsLiked(likeStatus.isLiked);
    }
  }, [likeStatus]);

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

  const handleLikeToggle = async () => {
    if (!templateId) return;
    try {
      if (isLiked) {
        await unlikeMutation.mutateAsync({ templateId });
        setIsLiked(false);
      } else {
        await likeMutation.mutateAsync({ templateId });
        setIsLiked(true);
      }
    } catch {
      // Handle error silently
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--bg-elevated)] rounded-2xl shadow-2xl',
          'border border-[var(--border-default)]',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 z-10 p-2 rounded-lg transition-colors',
            'bg-black/50 text-white hover:bg-black/70',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
          )}
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="p-8 space-y-4">
            <div className="aspect-video w-full rounded-xl bg-[var(--bg-subtle)] animate-pulse" />
            <div className="h-6 w-48 rounded bg-[var(--bg-subtle)] animate-pulse" />
            <div className="h-4 w-full rounded bg-[var(--bg-subtle)] animate-pulse" />
          </div>
        ) : data ? (
          <>
            {/* Preview: for sets show member thumbnails grid, else single image */}
            <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-subtle)]">
              {isSet && memberThumbnails.length > 0 ? (
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-1">
                  {memberThumbnails.slice(0, 4).map((thumb, idx) => (
                    <div key={idx} className="relative min-h-0 overflow-hidden bg-[var(--bg-subtle)]">
                      <Image
                        src={thumb}
                        alt={`${data.name} template ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Image
                  src={data.previewImageUrl || data.thumbnailUrl || '/placeholder.png'}
                  alt={data.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Title and like */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {data.name}
                </h2>
                <button
                  onClick={handleLikeToggle}
                  disabled={likeMutation.isPending || unlikeMutation.isPending}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all',
                    'border',
                    isLiked
                      ? 'text-pink-400 bg-pink-500/10 border-pink-500/30'
                      : 'text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-[var(--border-default)] hover:text-pink-400 hover:bg-pink-500/10'
                  )}
                >
                  <Heart
                    className={cn('h-4 w-4', isLiked && 'fill-current')}
                  />
                  Like {(data as any).likesCount > 0 && `(${(data as any).likesCount})`}
                </button>
              </div>

              {/* Description */}
              {data.description && (
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {data.description}
                </p>
              )}

              {/* Tags */}
              {(data as any).tags && (data as any).tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-[var(--text-tertiary)]" />
                  {(data as any).tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
                {/* Content type */}
                <div className="flex items-center gap-1.5">
                  {contentTypeConfig[(data as any).contentType as ContentType]?.icon || contentTypeConfig.image.icon}
                  <span>{contentTypeConfig[(data as any).contentType as ContentType]?.label || 'Image'}</span>
                </div>

                {/* Usage count */}
                {(data as any).usageCount !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    <span>Used {(data as any).usageCount.toLocaleString()} times</span>
                  </div>
                )}

                {/* Set member count */}
                {isSet && (data as any).memberCount && (
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    <span>{(data as any).memberCount} templates</span>
                  </div>
                )}
              </div>

              {/* Templates in this set - grid of all member templates */}
              {isSet && setMembers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Templates in this set
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {setMembers.map((member, idx) => {
                      const t = member.template;
                      if (!t) return null;
                      const thumb = t.thumbnailUrl || t.previewImageUrl;
                      return (
                        <div
                          key={t.id}
                          className="rounded-lg overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-default)]"
                        >
                          <div className="relative aspect-square">
                            {thumb ? (
                              <Image
                                src={thumb}
                                alt={t.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-[var(--text-tertiary)]" />
                              </div>
                            )}
                          </div>
                          <p className="p-2 text-xs font-medium text-[var(--text-secondary)] line-clamp-2">
                            {t.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Apply button */}
              <button
                onClick={() => onApply(templateId!)}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 text-base font-semibold rounded-xl',
                  'bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)]',
                  'text-white shadow-lg shadow-purple-500/25',
                  'transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)] focus-visible:ring-offset-2'
                )}
              >
                <Play className="h-5 w-5" />
                Apply to Influencer
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">Template not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
