# EP-040: Redis Job Persistence and Recovery - Architecture (P3)

**Phase**: P3 - Architecture & API Design  
**Epic**: EP-040  
**Initiative**: IN-007  
**Status**: In Progress

---

## 1. Functional Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (apps/api)                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ComfyUIJobRunner                                  │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  submitBaseImage()                                │    │  │
│  │  │  → ComfyUIJobPersistenceService.saveJobState()   │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         ComfyUIJobPersistenceService (new)                 │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  saveJobState(jobState)                         │    │  │
│  │  │  updateJobState(promptId, updates)               │    │  │
│  │  │  getJobState(promptId)                           │    │  │
│  │  │  deleteJobState(promptId)                        │    │  │
│  │  │  recoverActiveJobs()                             │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Redis                                             │  │
│  │  ┌─────────────────────────────────────────────────┐    │  │
│  │  │  Key: comfyui:job:{promptId}                     │    │  │
│  │  │  Value: JSON(JobState)                           │    │  │
│  │  │  TTL: 7200 seconds (2 hours)                     │    │  │
│  │  └─────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model

### Job State Schema

```typescript
interface JobState {
  promptId: string;
  type: 'image_generation' | 'lora_training' | 'face_swap';
  userId: string;
  characterId?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;  // 0-100
  startedAt: number;  // timestamp
  clientId?: string;  // WebSocket client ID (if EP-039 implemented)
  serverUrl: string;  // ComfyUI server URL
}
```

### Redis Storage

- **Key Format**: `comfyui:job:{promptId}`
- **Value**: JSON stringified `JobState`
- **TTL**: 7200 seconds (2 hours) for long-running jobs
- **Operations**: SET, GET, DEL, EXPIRE

---

## 3. API Contracts

### ComfyUIJobPersistenceService API

```typescript
class ComfyUIJobPersistenceService {
  /**
   * Save job state to Redis
   */
  async saveJobState(jobState: JobState): Promise<void>;

  /**
   * Update job state in Redis
   */
  async updateJobState(
    promptId: string,
    updates: Partial<JobState>
  ): Promise<void>;

  /**
   * Get job state from Redis
   */
  async getJobState(promptId: string): Promise<JobState | null>;

  /**
   * Delete job state from Redis
   */
  async deleteJobState(promptId: string): Promise<void>;

  /**
   * Recover all active jobs from Redis
   */
  async recoverActiveJobs(): Promise<JobState[]>;

  /**
   * Clean up stale jobs (older than TTL)
   */
  async cleanupStaleJobs(): Promise<number>;
}
```

---

## 4. Component Architecture

```
libs/business/src/services/
├── comfyui-job-persistence.service.ts (NEW)
│   ├── ComfyUIJobPersistenceService class
│   ├── Redis operations
│   ├── Job recovery logic
│   └── State management
│
└── comfyui-job-runner.ts (MODIFY)
    ├── Save state on job start
    ├── Update state on progress
    └── Recover jobs on initialization
```

---

## 5. Event Schema (PostHog Analytics)

```typescript
// Job state saved
{
  event: 'comfyui_job_state_saved',
  properties: {
    promptId: string;
    jobType: string;
    userId: string;
  }
}

// Job recovered
{
  event: 'comfyui_job_recovered',
  properties: {
    promptId: string;
    jobAge: number;  // seconds
    recoveryTime: number;  // milliseconds
  }
}
```

---

**Created**: 2026-01-27  
**Last Updated**: 2026-01-27
