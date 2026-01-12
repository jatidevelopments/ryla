'use client';

import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { StudioImage } from '../studio-image-card';
import { formatRelativeDate } from '../utils/date-formatting';

interface DetailPanelMetadataProps {
  image: StudioImage;
  onCopyId: () => void;
  copiedId: boolean;
}

export function DetailPanelMetadata({
  image,
  onCopyId,
  copiedId,
}: DetailPanelMetadataProps) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-[var(--text-muted)]"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Info
        </h4>
      </div>
      <div className="space-y-3 text-sm">
        {/* ID - Moved to top with copy functionality */}
        <div className="flex justify-between items-center group">
          <span className="text-[var(--text-muted)]">ID</span>
          <Tooltip content="Copy image ID to clipboard">
            <button
              onClick={onCopyId}
              className="flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)] hover:text-[var(--purple-400)] transition-colors"
            >
              <span>{image.id.slice(0, 12)}...</span>
              {copiedId ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 text-[var(--purple-400)]"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                </svg>
              )}
            </button>
          </Tooltip>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Created</span>
          <span className="text-[var(--text-secondary)]">
            {formatRelativeDate(image.createdAt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Aspect Ratio</span>
          <span className="text-[var(--text-secondary)]">{image.aspectRatio}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-muted)]">Status</span>
          <span
            className={cn(
              'capitalize font-medium',
              image.status === 'completed' && 'text-emerald-400',
              image.status === 'generating' && 'text-[var(--purple-400)]',
              image.status === 'failed' && 'text-red-400'
            )}
          >
            {image.status}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)]">NSFW</span>
          <span
            className={cn(
              'font-medium flex items-center gap-1.5',
              image.nsfw
                ? 'text-[var(--pink-400)]'
                : 'text-[var(--text-secondary)]'
            )}
          >
            {image.nsfw ? (
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
                Enabled
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                Disabled
              </>
            )}
          </span>
        </div>
        {/* Prompt Enhancement Status */}
        {typeof image.promptEnhance !== 'undefined' && (
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">Prompt Enhancement</span>
            <span
              className={cn(
                'font-medium flex items-center gap-1.5',
                image.promptEnhance
                  ? 'text-[var(--purple-400)]'
                  : 'text-[var(--text-secondary)]'
              )}
            >
              {image.promptEnhance ? (
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
                  Enabled
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Disabled
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

