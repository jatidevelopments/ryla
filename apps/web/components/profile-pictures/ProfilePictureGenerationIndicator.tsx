'use client';

import * as React from 'react';
import { useProfilePictures, useProfilePicturesStore, type GenerationJob } from '@ryla/business';
import { cn } from '@ryla/ui';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  X, 
  ChevronDown, 
  ChevronUp,
  ImageIcon,
  Loader2
} from 'lucide-react';

interface ProfilePictureGenerationIndicatorProps {
  influencerId: string;
  className?: string;
  /** Callback to retry a failed generation */
  onRetry?: (jobId: string, setId: string, nsfwEnabled: boolean) => void;
}

/**
 * Animated progress ring component
 */
function ProgressRing({ 
  progress, 
  size = 40, 
  strokeWidth = 3,
  className 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-purple-300 animate-pulse" />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md animate-pulse" />
    </div>
  );
}

/**
 * Individual job indicator row with improved design
 */
function GenerationJobRow({
  job,
  onRetry,
  onCancel,
  isOnly,
}: {
  job: GenerationJob;
  onRetry?: (job: GenerationJob) => void;
  onCancel?: (jobId: string) => void;
  isOnly?: boolean; // Is this the only job (affects styling)
}) {
  const progress = job.totalCount > 0 
    ? Math.round((job.completedCount / job.totalCount) * 100) 
    : 0;

  const isGenerating = job.status === 'generating';
  const isFailed = job.status === 'failed';
  const isCompleted = job.status === 'completed';

  return (
    <div
      className={cn(
        'group flex items-center gap-3 p-3 rounded-xl transition-all duration-200',
        isGenerating && 'bg-white/5 hover:bg-white/8',
        isFailed && 'bg-red-500/10 hover:bg-red-500/15 border border-red-500/20',
        isCompleted && 'bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20'
      )}
    >
      {/* Status Icon */}
      <div className="relative flex-shrink-0">
        {isGenerating && (
          <ProgressRing progress={progress} size={36} strokeWidth={3} />
        )}
        {isFailed && (
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
        {isCompleted && (
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Progress/Status Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-white truncate">
            {job.setName}
          </p>
          {job.nsfwEnabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-pink-500/20 text-pink-400 border border-pink-500/30">
              +NSFW
            </span>
          )}
        </div>
        
        {isGenerating && (
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out animate-shimmer"
                style={{ 
                  width: `${progress}%`,
                  backgroundSize: '200% 100%'
                }}
              />
            </div>
            {/* Counter */}
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <ImageIcon className="h-3 w-3" />
              <span className="font-mono">
                {job.completedCount}<span className="text-white/30">/</span>{job.totalCount}
              </span>
            </div>
          </div>
        )}
        
        {isFailed && (
          <p className="text-xs text-red-400/80 truncate">
            {job.lastError || 'Generation failed'}
            {job.retryCount && job.retryCount > 0 && (
              <span className="text-white/30 ml-1">· retry {job.retryCount}</span>
            )}
          </p>
        )}
        
        {isCompleted && (
          <p className="text-xs text-emerald-400/70 flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {job.totalCount} images ready
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isFailed && onRetry && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRetry(job);
            }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
            aria-label="Retry generation"
            title="Retry"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
        
        {(isGenerating || isFailed) && onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel(job.id);
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all hover:scale-105 active:scale-95"
            aria-label="Cancel"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading indicator that shows when profile pictures are being generated.
 * Displays stacked generation jobs with progress for each.
 * Shows failed jobs with retry option and completed jobs summary.
 */
export function ProfilePictureGenerationIndicator({
  influencerId,
  className,
  onRetry,
}: ProfilePictureGenerationIndicatorProps) {
  const state = useProfilePictures(influencerId);
  const cancelJob = useProfilePicturesStore((s) => s.cancelJob);
  const clearCompletedJobs = useProfilePicturesStore((s) => s.clearCompletedJobs);
  
  const [isExpanded, setIsExpanded] = React.useState(true);

  // Don't show if no active jobs (generating or failed)
  if (!state || (!state.isGenerating && !state.hasFailed)) {
    return null;
  }

  const { generatingJobs, failedJobs, completedJobs } = state;
  const totalActiveJobs = generatingJobs.length + failedJobs.length;
  const hasCompletedJobs = completedJobs.length > 0;
  const hasMultipleJobs = totalActiveJobs > 1;

  // Calculate total progress across all generating jobs
  const totalCompleted = generatingJobs.reduce((sum, j) => sum + j.completedCount, 0);
  const totalCount = generatingJobs.reduce((sum, j) => sum + j.totalCount, 0);
  const overallProgress = totalCount > 0 ? Math.round((totalCompleted / totalCount) * 100) : 0;

  const handleRetry = (job: GenerationJob) => {
    if (onRetry) {
      onRetry(job.id, job.setId, job.nsfwEnabled);
    }
  };

  const handleCancel = (jobId: string) => {
    cancelJob(influencerId, jobId);
  };

  const handleClearCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearCompletedJobs(influencerId);
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        'bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-pink-900/40',
        'border border-purple-500/20 backdrop-blur-xl',
        'shadow-lg shadow-purple-500/10',
        className
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-4 p-4 transition-colors',
          'hover:bg-white/5',
          isExpanded && 'border-b border-white/5'
        )}
      >
        {/* Progress Ring or Status Icon */}
        <div className="relative flex-shrink-0">
          {state.isGenerating ? (
            <ProgressRing progress={overallProgress} size={44} strokeWidth={3} />
          ) : (
            <div className="w-11 h-11 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
          )}
        </div>

        {/* Summary Text */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white">
              {state.isGenerating 
                ? 'Creating Your Profile' 
                : 'Generation Failed'}
            </h3>
            {hasMultipleJobs && (
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-white/10 text-white/60">
                {totalActiveJobs} sets
              </span>
            )}
          </div>
          
          {state.isGenerating && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>
                {totalCompleted} of {totalCount} images
              </span>
              <span className="text-white/30">·</span>
              <span className="text-purple-400 font-medium">{overallProgress}%</span>
            </div>
          )}
          
          {state.hasFailed && !state.isGenerating && (
            <p className="text-sm text-red-400/80">
              {failedJobs.length} set{failedJobs.length > 1 ? 's' : ''} need attention
            </p>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {hasMultipleJobs && (
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white',
            'transition-all duration-200'
          )}>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        )}
      </button>

      {/* Expanded Content - Job List */}
      {isExpanded && hasMultipleJobs && (
        <div className="p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {/* Generating Jobs */}
          {generatingJobs.map((job) => (
            <GenerationJobRow
              key={job.id}
              job={job}
              onCancel={handleCancel}
              isOnly={totalActiveJobs === 1}
            />
          ))}

          {/* Failed Jobs */}
          {failedJobs.map((job) => (
            <GenerationJobRow
              key={job.id}
              job={job}
              onRetry={onRetry ? handleRetry : undefined}
              onCancel={handleCancel}
              isOnly={totalActiveJobs === 1}
            />
          ))}

          {/* Completed Jobs Summary */}
          {hasCompletedJobs && (
            <div className="flex items-center justify-between px-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-emerald-400/80">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  {completedJobs.length} set{completedJobs.length > 1 ? 's' : ''} completed
                </span>
              </div>
              <button
                onClick={handleClearCompleted}
                className="text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Single job - show inline without expansion */}
      {!hasMultipleJobs && totalActiveJobs === 1 && (
        <div className="px-4 pb-4">
          {generatingJobs[0] && (
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${overallProgress}%`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite'
                  }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(generatingJobs[0].id);
                }}
                className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {failedJobs[0] && (
            <div className="flex items-center gap-2 pt-2">
              <p className="flex-1 text-sm text-red-400/80 truncate">
                {failedJobs[0].lastError || 'Generation failed'}
              </p>
              {onRetry && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRetry(failedJobs[0]);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
