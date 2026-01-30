'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import {
  useTrainingHistory,
  type TrainingHistoryItem,
} from '../../lib/hooks/use-lora-training';

interface TrainingHistorySectionProps {
  characterId: string;
}

export function TrainingHistorySection({
  characterId,
}: TrainingHistorySectionProps) {
  const { data, isLoading } = useTrainingHistory(characterId);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Only show if there's more than 1 training attempt
  if (!data || data.totalCount <= 1) {
    return null;
  }

  return (
    <section className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-white/40" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Training History
          </span>
          <span className="text-xs text-white/40">({data.totalCount})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-white/40" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/40" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin text-white/40" />
              <span className="text-sm text-white/60">Loading history...</span>
            </div>
          ) : (
            data.history.map((item, index) => (
              <HistoryItem key={item.id} item={item} isLatest={index === 0} />
            ))
          )}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// History Item Component
// ============================================================================

interface HistoryItemProps {
  item: TrainingHistoryItem;
  isLatest: boolean;
}

function HistoryItem({ item, isLatest }: HistoryItemProps) {
  const statusConfig = getStatusConfig(item.status);
  const formattedDate = formatDate(item.createdAt);
  const duration = item.trainingDurationMs
    ? formatDuration(item.trainingDurationMs)
    : null;

  return (
    <div
      className={cn(
        'p-3 rounded-lg border transition-colors',
        isLatest
          ? 'bg-white/5 border-white/15'
          : 'bg-white/[0.02] border-white/10'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0',
              statusConfig.bgColor
            )}
          >
            <statusConfig.icon
              className={cn('h-3.5 w-3.5', statusConfig.iconColor)}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn('text-sm font-medium', statusConfig.textColor)}
              >
                {statusConfig.label}
              </span>
              {isLatest && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-500/20 text-purple-300">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 mt-0.5">{formattedDate}</p>
            {item.errorMessage && (
              <p className="text-xs text-red-300/80 mt-1 line-clamp-2">
                {item.errorMessage}
              </p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {item.imageCount > 0 && (
            <p className="text-xs text-white/40">{item.imageCount} images</p>
          )}
          {duration && <p className="text-xs text-white/40">{duration}</p>}
          {item.creditsCharged != null && item.creditsCharged > 0 && (
            <p className="text-xs text-white/40">
              {item.creditsCharged.toLocaleString()} credits
              {item.creditsRefunded != null && item.creditsRefunded > 0 && (
                <span className="text-green-300"> (refunded)</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getStatusConfig(status: TrainingHistoryItem['status']) {
  switch (status) {
    case 'ready':
      return {
        label: 'Completed',
        icon: CheckCircle2,
        iconColor: 'text-green-400',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-300',
      };
    case 'training':
      return {
        label: 'Training',
        icon: Loader2,
        iconColor: 'text-amber-400 animate-spin',
        bgColor: 'bg-amber-500/20',
        textColor: 'text-amber-300',
      };
    case 'pending':
      return {
        label: 'Queued',
        icon: Clock,
        iconColor: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        textColor: 'text-amber-300',
      };
    case 'failed':
      return {
        label: 'Failed',
        icon: XCircle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-300',
      };
    case 'expired':
      return {
        label: 'Expired',
        icon: Clock,
        iconColor: 'text-white/40',
        bgColor: 'bg-white/10',
        textColor: 'text-white/50',
      };
    default:
      return {
        label: 'Unknown',
        icon: Sparkles,
        iconColor: 'text-white/40',
        bgColor: 'bg-white/10',
        textColor: 'text-white/50',
      };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}
