import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

export type ProfilePicturesStatus = 'idle' | 'generating' | 'completed' | 'failed';
export type ProfilePictureSetId = 'classic-influencer' | 'professional-model' | 'natural-beauty';

import { ProfilePictureImage } from './types';

/**
 * Individual generation job that can be stacked
 */
export interface GenerationJob {
  id: string; // Unique job ID (UUID)
  setId: ProfilePictureSetId;
  setName: string; // Human-readable name for UI
  status: ProfilePicturesStatus;
  jobIds: string[];
  images: ProfilePictureImage[];
  completedCount: number;
  totalCount: number;
  nsfwEnabled: boolean;
  lastError?: string;
  startedAt: string;
  completedAt?: string;
  retryCount?: number;
}

export interface ProfilePicturesState {
  /**
   * All generation jobs by influencer ID
   * Each influencer can have multiple stacked generation jobs
   */
  byInfluencerId: Record<
    string,
    {
      /** List of all generation jobs (stacked) */
      jobs: GenerationJob[];
      /** ID of the currently active/primary set (last completed or generating) */
      activeSetId?: ProfilePictureSetId;
      /** All profile picture images across all completed jobs */
      allImages: ProfilePictureImage[];
    }
  >;

  /**
   * Legacy support - single generation state (for backward compatibility)
   * @deprecated Use jobs array instead
   */
  legacyState?: Record<
    string,
    {
      status: ProfilePicturesStatus;
      setId: ProfilePictureSetId;
      images: ProfilePictureImage[];
      jobIds?: string[];
      completedCount?: number;
      totalCount?: number;
      lastError?: string;
      startedAt?: string;
      completedAt?: string;
    }
  >;

  // Actions
  ensure: (influencerId: string, setId?: ProfilePictureSetId) => void;
  
  /**
   * Start a new generation job (stacked)
   */
  startJob: (
    influencerId: string,
    data: {
      jobId: string; // Unique ID for this generation job
      setId: ProfilePictureSetId;
      setName: string;
      jobIds: string[]; // Backend job IDs for polling
      totalCount: number;
      nsfwEnabled: boolean;
    }
  ) => void;
  
  /**
   * Update progress of a specific job
   */
  updateJobProgress: (influencerId: string, jobId: string, completedCount: number) => void;
  
  /**
   * Add/update an image for a specific job
   */
  upsertJobImage: (influencerId: string, jobId: string, image: ProfilePictureImage) => void;
  
  /**
   * Mark a specific job as completed
   */
  completeJob: (influencerId: string, jobId: string) => void;
  
  /**
   * Mark a specific job as failed
   */
  failJob: (influencerId: string, jobId: string, error: string) => void;
  
  /**
   * Retry a failed job
   */
  retryJob: (influencerId: string, jobId: string) => void;
  
  /**
   * Cancel/remove a specific job
   */
  cancelJob: (influencerId: string, jobId: string) => void;
  
  /**
   * Clear all completed jobs for an influencer (keep active ones)
   */
  clearCompletedJobs: (influencerId: string) => void;

  // Legacy methods for backward compatibility
  start: (
    influencerId: string,
    data: {
      setId: ProfilePictureSetId;
      jobIds: string[];
      totalCount?: number;
    }
  ) => void;
  updateProgress: (influencerId: string, completedCount: number) => void;
  upsertImage: (influencerId: string, image: ProfilePictureImage) => void;
  complete: (influencerId: string) => void;
  fail: (influencerId: string, error: string) => void;
  reset: (influencerId: string) => void;
}

const SET_NAMES: Record<ProfilePictureSetId, string> = {
  'classic-influencer': 'Classic Influencer',
  'professional-model': 'Professional Model',
  'natural-beauty': 'Natural Beauty',
};

/**
 * Profile pictures store (per influencer).
 * Supports stacked generations - users can trigger multiple sets.
 * Persisted so users can navigate away while generation completes.
 */
export const useProfilePicturesStore = create<ProfilePicturesState>()(
  persist(
    immer((set, get) => ({
      byInfluencerId: {},

      ensure: (influencerId, setId = 'classic-influencer') => {
        set((state) => {
          if (!state.byInfluencerId[influencerId]) {
            state.byInfluencerId[influencerId] = {
              jobs: [],
              activeSetId: setId,
              allImages: [],
            };
          }
        });
      },

      // New stacked job methods
      startJob: (influencerId, data) => {
        set((state) => {
          if (!state.byInfluencerId[influencerId]) {
            state.byInfluencerId[influencerId] = {
              jobs: [],
              activeSetId: data.setId,
              allImages: [],
            };
          }
          
          const newJob: GenerationJob = {
            id: data.jobId,
            setId: data.setId,
            setName: data.setName || SET_NAMES[data.setId],
            status: 'generating',
            jobIds: data.jobIds,
            images: [],
            completedCount: 0,
            totalCount: data.totalCount,
            nsfwEnabled: data.nsfwEnabled,
            startedAt: new Date().toISOString(),
            retryCount: 0,
          };
          
          state.byInfluencerId[influencerId].jobs.push(newJob);
          state.byInfluencerId[influencerId].activeSetId = data.setId;
        });
      },

      updateJobProgress: (influencerId, jobId, completedCount) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          const job = influencerData.jobs.find((j) => j.id === jobId);
          if (job) {
            job.completedCount = completedCount;
          }
        });
      },

      upsertJobImage: (influencerId, jobId, image) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          const job = influencerData.jobs.find((j) => j.id === jobId);
          if (!job) return;
          
          const idx = job.images.findIndex(
            (i) => i.positionId === image.positionId && i.isNSFW === image.isNSFW
          );
          
          if (idx === -1) {
            job.images.push(image);
            job.completedCount = job.images.length;
          } else {
            job.images[idx] = { ...job.images[idx], ...image };
          }
          
          // Also update allImages
          const allIdx = influencerData.allImages.findIndex(
            (i) => i.positionId === image.positionId && i.isNSFW === image.isNSFW
          );
          if (allIdx === -1) {
            influencerData.allImages.push(image);
          } else {
            influencerData.allImages[allIdx] = { ...influencerData.allImages[allIdx], ...image };
          }
        });
      },

      completeJob: (influencerId, jobId) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          const job = influencerData.jobs.find((j) => j.id === jobId);
          if (job) {
            job.status = 'completed';
            job.completedAt = new Date().toISOString();
            job.lastError = undefined;
          }
        });
      },

      failJob: (influencerId, jobId, error) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          const job = influencerData.jobs.find((j) => j.id === jobId);
          if (job) {
            job.status = 'failed';
            job.lastError = error;
          }
        });
      },

      retryJob: (influencerId, jobId) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          const job = influencerData.jobs.find((j) => j.id === jobId);
          if (job && job.status === 'failed') {
            job.status = 'generating';
            job.lastError = undefined;
            job.retryCount = (job.retryCount || 0) + 1;
          }
        });
      },

      cancelJob: (influencerId, jobId) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          influencerData.jobs = influencerData.jobs.filter((j) => j.id !== jobId);
        });
      },

      clearCompletedJobs: (influencerId) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          influencerData.jobs = influencerData.jobs.filter(
            (j) => j.status === 'generating'
          );
        });
      },

      // Legacy methods for backward compatibility
      start: (influencerId, data) => {
        const jobId = `legacy-${Date.now()}`;
        get().startJob(influencerId, {
          jobId,
          setId: data.setId,
          setName: SET_NAMES[data.setId],
          jobIds: data.jobIds,
          totalCount: data.totalCount ?? data.jobIds.length,
          nsfwEnabled: false,
        });
      },

      updateProgress: (influencerId, completedCount) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData || influencerData.jobs.length === 0) return;
          
          // Update the most recent generating job
          const generatingJob = influencerData.jobs.find((j) => j.status === 'generating');
          if (generatingJob) {
            generatingJob.completedCount = completedCount;
          }
        });
      },

      upsertImage: (influencerId, image) => {
        set((state) => {
          let influencerData = state.byInfluencerId[influencerId];
          
          if (!influencerData) {
            state.byInfluencerId[influencerId] = {
              jobs: [],
              activeSetId: 'classic-influencer',
              allImages: [],
            };
            influencerData = state.byInfluencerId[influencerId];
          }
          
          // Find the most recent generating job
          const generatingJob = influencerData.jobs.find((j) => j.status === 'generating');
          
          if (generatingJob) {
            const idx = generatingJob.images.findIndex(
              (i) => i.positionId === image.positionId && i.isNSFW === image.isNSFW
            );
            
            if (idx === -1) {
              generatingJob.images.push(image);
              generatingJob.completedCount = generatingJob.images.length;
            } else {
              generatingJob.images[idx] = { ...generatingJob.images[idx], ...image };
            }
          }
          
          // Also update allImages
          const allIdx = influencerData.allImages.findIndex(
            (i) => i.positionId === image.positionId && i.isNSFW === image.isNSFW
          );
          if (allIdx === -1) {
            influencerData.allImages.push(image);
          } else {
            influencerData.allImages[allIdx] = { ...influencerData.allImages[allIdx], ...image };
          }
        });
      },

      complete: (influencerId) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          // Complete the most recent generating job
          const generatingJob = influencerData.jobs.find((j) => j.status === 'generating');
          if (generatingJob) {
            generatingJob.status = 'completed';
            generatingJob.completedAt = new Date().toISOString();
            generatingJob.lastError = undefined;
          }
        });
      },

      fail: (influencerId, error) => {
        set((state) => {
          const influencerData = state.byInfluencerId[influencerId];
          if (!influencerData) return;
          
          // Fail the most recent generating job
          const generatingJob = influencerData.jobs.find((j) => j.status === 'generating');
          if (generatingJob) {
            generatingJob.status = 'failed';
            generatingJob.lastError = error;
          }
        });
      },

      reset: (influencerId) => {
        set((state) => {
          delete state.byInfluencerId[influencerId];
        });
      },
    })),
    {
      name: 'ryla-profile-pictures-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

/**
 * Hook to get all profile picture generation state for an influencer
 * Returns both active jobs and overall status
 * Handles migration from legacy data structure (without jobs array)
 */
export const useProfilePictures = (influencerId: string) => {
  const data = useProfilePicturesStore(
    useShallow((s) => s.byInfluencerId[influencerId])
  );
  
  if (!data) {
    return undefined;
  }
  
  // Handle legacy data structure (before jobs array was added)
  // Legacy data had: status, setId, images, jobIds, completedCount, totalCount, etc.
  // New data has: jobs[], activeSetId, allImages
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  const allImages = Array.isArray(data.allImages) ? data.allImages : [];
  
  // If legacy data exists (has 'status' but no 'jobs'), migrate it
  const legacyData = data as unknown as {
    status?: ProfilePicturesStatus;
    setId?: ProfilePictureSetId;
    images?: ProfilePictureImage[];
    jobIds?: string[];
    completedCount?: number;
    totalCount?: number;
    lastError?: string;
    startedAt?: string;
    completedAt?: string;
  };
  
  // Check if this is legacy data (has 'status' at top level but no jobs array)
  if (legacyData.status && !Array.isArray(data.jobs)) {
    // Return legacy-compatible format
    return {
      status: legacyData.status,
      setId: legacyData.setId || 'classic-influencer',
      images: legacyData.images || [],
      jobs: [],
      generatingJobs: [],
      failedJobs: [],
      completedJobs: [],
      completedCount: legacyData.completedCount || 0,
      totalCount: legacyData.totalCount || 0,
      lastError: legacyData.lastError,
      isGenerating: legacyData.status === 'generating',
      hasFailed: legacyData.status === 'failed',
      hasCompleted: legacyData.status === 'completed',
    };
  }
  
  // Calculate aggregate status for new data structure
  const generatingJobs = jobs.filter((j) => j.status === 'generating');
  const failedJobs = jobs.filter((j) => j.status === 'failed');
  const completedJobs = jobs.filter((j) => j.status === 'completed');
  
  const isGenerating = generatingJobs.length > 0;
  const hasFailed = failedJobs.length > 0;
  const hasCompleted = completedJobs.length > 0;
  
  // Overall status
  let status: ProfilePicturesStatus = 'idle';
  if (isGenerating) {
    status = 'generating';
  } else if (hasFailed && !hasCompleted) {
    status = 'failed';
  } else if (hasCompleted) {
    status = 'completed';
  }
  
  // Aggregate counts across all generating jobs
  const totalCount = generatingJobs.reduce((sum, j) => sum + j.totalCount, 0);
  const completedCount = generatingJobs.reduce((sum, j) => sum + j.completedCount, 0);
  
  return {
    status,
    setId: data.activeSetId || 'classic-influencer',
    images: allImages,
    jobs,
    generatingJobs,
    failedJobs,
    completedJobs,
    completedCount,
    totalCount,
    lastError: failedJobs[0]?.lastError,
    isGenerating,
    hasFailed,
    hasCompleted,
  };
};

/**
 * Hook to get generation jobs for display
 * Returns empty array if data doesn't exist or is legacy format
 */
export const useProfilePictureJobs = (influencerId: string) => {
  return useProfilePicturesStore(
    useShallow((s) => {
      const data = s.byInfluencerId[influencerId];
      // Handle legacy data that doesn't have jobs array
      return Array.isArray(data?.jobs) ? data.jobs : [];
    })
  );
};
