'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { StudioImage } from '../studio-image-card';
import { ALL_POSES, SCENES } from '../generation/types';
import { OUTFIT_OPTIONS } from '@ryla/shared';

interface DetailPanelGenerationDetailsProps {
  image: StudioImage;
  onCopyPrompt: () => void;
  copied: boolean;
}

export function DetailPanelGenerationDetails({
  image,
  onCopyPrompt,
  copied,
}: DetailPanelGenerationDetailsProps) {
  return (
    <div className="p-4 border-b border-[var(--border-default)]">
      <div className="flex items-center gap-2 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-[var(--purple-400)]"
        >
          <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
        </svg>
        <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Generation Details
        </h4>
      </div>

      <div className="space-y-3">
        {/* Prompt Enhancement Badge */}
        {image.promptEnhance && (
          <div className="flex items-center gap-2 rounded-xl bg-[var(--purple-500)]/10 border border-[var(--purple-500)]/30 px-3 py-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-[var(--purple-400)]"
            >
              <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
            </svg>
            <span className="text-xs font-medium text-[var(--purple-400)]">
              AI Enhanced
            </span>
          </div>
        )}

        {/* Original Prompt (if enhanced) */}
        {image.promptEnhance && image.originalPrompt && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Original Prompt
              </span>
            </div>
            <p className="rounded-xl bg-[var(--bg-base)] p-3 text-sm text-[var(--text-secondary)] leading-relaxed border border-[var(--border-default)] opacity-75">
              {image.originalPrompt}
              {image.originalPrompt === image.prompt && (
                <span className="ml-2 text-xs text-[var(--text-muted)] italic">
                  (No changes after enhancement)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Enhanced/Final Prompt */}
        {(image.prompt || image.enhancedPrompt) && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                {image.promptEnhance ? 'Enhanced Prompt' : 'Prompt'}
              </span>
              <Tooltip content="Copy prompt to clipboard">
                <button
                  onClick={onCopyPrompt}
                  className="flex items-center gap-1 text-xs text-[var(--purple-400)] hover:text-[var(--purple-300)] transition-colors"
                >
                  {copied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
            <p
              className={cn(
                'rounded-xl bg-[var(--bg-base)] p-3 text-sm leading-relaxed border',
                image.promptEnhance
                  ? 'text-[var(--text-primary)] border-[var(--purple-500)]/30'
                  : 'text-[var(--text-secondary)] border-[var(--border-default)]'
              )}
            >
              {image.enhancedPrompt || image.prompt}
            </p>
          </div>
        )}

        {/* Show message if no prompt but enhancement was attempted */}
        {!image.prompt && !image.enhancedPrompt && image.promptEnhance && (
          <div className="rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] p-3">
            <p className="text-sm text-[var(--text-muted)] italic">
              Prompt information not available for this image.
            </p>
          </div>
        )}

        {/* Generation Assets - Pose, Outfit, Scene, Environment */}
        <div className="space-y-3">
          {/* Pose */}
          {image.poseId &&
            (() => {
              const pose = ALL_POSES.find((p) => p.id === image.poseId);
              const poseThumbnail =
                pose?.thumbnail || `/poses/${image.poseId}.webp`;
              return (
                <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] p-3">
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                    <Image
                      src={poseThumbnail}
                      alt={pose?.name || image.poseId}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--text-muted)] mb-0.5">
                      Pose
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {pose?.name ||
                        image.poseId
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Outfit */}
          {image.outfit &&
            (() => {
              let outfitName = '';
              let outfitThumbnail = '';

              // Try to parse as OutfitComposition JSON first
              try {
                const parsed =
                  typeof image.outfit === 'string'
                    ? JSON.parse(image.outfit)
                    : image.outfit;
                if (
                  parsed &&
                  typeof parsed === 'object' &&
                  'pieces' in parsed
                ) {
                  // It's an OutfitComposition - build name from pieces
                  const pieces = parsed.pieces || [];
                  outfitName =
                    pieces.length > 0
                      ? pieces.map((p: any) => p.label || p.id).join(' + ')
                      : 'Custom Outfit';
                  // Use first piece thumbnail or fallback
                  outfitThumbnail =
                    pieces[0]?.thumbnail || '/outfits/custom.webp';
                } else {
                  throw new Error('Not a composition');
                }
              } catch {
                // It's a legacy string outfit
                const outfitId = image.outfit
                  .toLowerCase()
                  .replace(/\s+/g, '-');
                const outfit = OUTFIT_OPTIONS.find(
                  (o) =>
                    o.label.toLowerCase().replace(/\s+/g, '-') === outfitId ||
                    o.label.toLowerCase() === image.outfit!.toLowerCase()
                );
                outfitName = outfit?.label || image.outfit;
                outfitThumbnail =
                  outfit?.thumbnail || `/outfits/${outfitId}.webp`;
              }

              return (
                <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] p-3">
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                    <Image
                      src={outfitThumbnail}
                      alt={outfitName}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--text-muted)] mb-0.5">
                      Outfit
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {outfitName}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Scene */}
          {image.scene &&
            (() => {
              // Convert snake_case to kebab-case for lookup
              const sceneId = image.scene.replace(/_/g, '-');
              const scene = SCENES.find((s) => s.id === sceneId);
              const sceneThumbnail =
                scene?.thumbnail || `/scenes/${sceneId}.webp`;
              return (
                <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] p-3">
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                    <Image
                      src={sceneThumbnail}
                      alt={scene?.name || image.scene}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--text-muted)] mb-0.5">
                      Scene
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {scene?.name ||
                        image.scene
                          .replace(/_/g, ' ')
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* Environment */}
          {image.environment &&
            (() => {
              // Convert snake_case to kebab-case
              const envId = image.environment.replace(/_/g, '-');
              // Environment presets don't have a separate constant, so we'll use a generic path
              const envThumbnail = `/environments/${envId}.webp`;
              return (
                <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] p-3">
                  <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-elevated)]">
                    <Image
                      src={envThumbnail}
                      alt={image.environment}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--text-muted)] mb-0.5">
                      Environment
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {image.environment
                        .replace(/_/g, ' ')
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
