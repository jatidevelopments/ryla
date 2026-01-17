import Link from 'next/link';
import { ImageIcon, Sparkles } from 'lucide-react';

interface GalleryEmptyStateProps {
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

export function GalleryEmptyState({ message, action }: GalleryEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4 text-center">
      {/* Empty state illustration */}
      <div className="relative mb-4 md:mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 rounded-xl md:rounded-2xl blur-lg md:blur-xl" />
        <div className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-xl md:rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
          <ImageIcon className="h-6 w-6 md:h-8 md:w-8 text-[var(--text-muted)]" />
        </div>
      </div>
      <h3 className="text-base md:text-lg font-semibold text-[var(--text-primary)] mb-1 md:mb-2">
        {message}
      </h3>
      <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-[200px] md:max-w-sm mb-4 md:mb-6">
        Generate images to build your AI influencer&apos;s gallery
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-600)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--purple-500)]/20 transition-all hover:shadow-xl hover:shadow-[var(--purple-500)]/30 hover:scale-[1.02] whitespace-nowrap min-w-fit"
        >
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span>{action.label}</span>
        </Link>
      )}
    </div>
  );
}
