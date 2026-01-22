# [EPIC] EP-054: Content Moderation & Gallery

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 2  
**Priority**: P1  
**Status**: Completed

---

## Overview

Build a content moderation system that allows admins to browse all generated images, flag inappropriate content, and manage content visibility. Includes a full gallery browser and generation job monitoring.

---

## Business Impact

**Target Metric**: E-CAC (Risk Mitigation)

**Hypothesis**: When we can quickly identify and remove inappropriate content, we reduce platform risk and maintain content quality standards.

**Success Criteria**:

- All images searchable and viewable
- Moderation actions take < 30 seconds
- Generation job status visible in real-time

---

## Features

### F1: Image Gallery Browser

- Browse all generated images across all users
- Filter by:
  - User (email or ID)
  - Character (ID or name)
  - Date range
  - Status (pending, generating, completed, failed)
  - NSFW flag
  - Quality mode (draft, hq)
  - Liked/favorited
- Sort by date, user, character
- Grid view with thumbnails
- Pagination or infinite scroll

### F2: Image Detail View

- Full-size image display
- Image metadata:
  - User (link to profile)
  - Character (link to character)
  - Generation date
  - Prompt used
  - Negative prompt
  - Seed
  - Scene, environment, outfit
  - Aspect ratio, quality mode
  - NSFW flag
  - Dimensions
  - S3 key
- Related images (same character, same session)

### F3: Moderation Actions

- Flag image as inappropriate
- Remove image (soft delete)
- Bulk moderation (select multiple)
- Moderation reason categories:
  - Illegal content
  - Terms violation
  - Copyright issue
  - User request
  - Other
- Audit log for all moderation actions

### F4: Generation Jobs Monitor

- List all generation jobs
- Filter by:
  - Status (queued, processing, completed, failed, cancelled)
  - Type (base_image, character_sheet, image_generation, etc.)
  - User
  - Date range
- Real-time status updates
- Job detail view:
  - Input parameters
  - Output (images, errors)
  - External job ID
  - Duration
  - Credits used
  - Retry count

### F5: Job Actions

- Retry failed job
- Cancel queued job
- View job logs
- Link to generated images

### F6: Influencer Requests Queue

- List all influencer creation requests
- Status workflow: pending → in_review → approved/rejected
- View request details:
  - User info
  - Consent confirmation
  - Instagram/TikTok links
  - Description
- Approve/reject with reason
- Admin notes

### F7: Content Stats Dashboard

- Total images generated (all time, today)
- Images by status
- NSFW vs SFW distribution
- Failed generation rate
- Average generation time
- Popular scenes/environments

---

## Acceptance Criteria

### AC-1: Image Gallery

- [ ] Can browse all images
- [ ] Filters work correctly
- [ ] Thumbnails load efficiently (lazy loading)
- [ ] Pagination/infinite scroll works
- [ ] Sort options work
- [ ] Grid responsive to screen size

### AC-2: Image Detail

- [ ] Full-size image loads
- [ ] All metadata displayed
- [ ] User/character links work
- [ ] Related images shown
- [ ] Can download image
- [ ] Can copy S3 key

### AC-3: Moderation Actions

- [ ] Can flag image
- [ ] Can remove image
- [ ] Reason is required
- [ ] Audit log created
- [ ] Bulk selection works
- [ ] Confirmation dialog shown

### AC-4: Generation Jobs

- [ ] All jobs listed
- [ ] Filters work correctly
- [ ] Status updates in real-time (or on refresh)
- [ ] Job details accurate
- [ ] Input/output displayed correctly

### AC-5: Job Actions

- [ ] Can retry failed jobs
- [ ] Can cancel queued jobs
- [ ] Retry creates new job correctly
- [ ] Cancel stops processing
- [ ] Audit log created

### AC-6: Influencer Requests

- [ ] All requests listed
- [ ] Status filter works
- [ ] Request details complete
- [ ] Can approve/reject
- [ ] Reason required for rejection
- [ ] Audit log created

### AC-7: Content Stats

- [ ] Dashboard loads correctly
- [ ] Stats are accurate
- [ ] Charts render correctly
- [ ] Time period selector works

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_image_viewed` | Image detail opened | `image_id`, `user_id` |
| `admin_image_flagged` | Image flagged | `image_id`, `reason` |
| `admin_image_removed` | Image deleted | `image_id`, `reason` |
| `admin_images_bulk_action` | Bulk action | `action`, `count` |
| `admin_job_retried` | Job retried | `job_id`, `type` |
| `admin_job_cancelled` | Job cancelled | `job_id` |
| `admin_influencer_request_reviewed` | Request reviewed | `request_id`, `action` |

---

## User Stories

### ST-240: Browse All Images

**As a** content admin  
**I want to** browse all generated images  
**So that** I can monitor content quality

**AC**: AC-1

### ST-241: View Image Details

**As a** content admin  
**I want to** see full details of an image  
**So that** I can understand its context

**AC**: AC-2

### ST-242: Flag Inappropriate Content

**As a** support admin  
**I want to** flag inappropriate images  
**So that** they can be reviewed and removed

**AC**: AC-3

### ST-243: Monitor Generation Jobs

**As a** support admin  
**I want to** see the status of generation jobs  
**So that** I can identify and resolve issues

**AC**: AC-4

### ST-244: Retry Failed Job

**As a** support admin  
**I want to** retry a failed generation job  
**So that** the user can get their content

**AC**: AC-5

### ST-245: Review Influencer Request

**As a** support admin  
**I want to** review influencer creation requests  
**So that** I can approve or reject based on compliance

**AC**: AC-6

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router - Content
admin.content.images.list({ filters, sort, limit, offset })
admin.content.images.get({ imageId })
admin.content.images.flag({ imageId, reason, category })
admin.content.images.remove({ imageId, reason })
admin.content.images.bulkFlag({ imageIds, reason, category })
admin.content.images.bulkRemove({ imageIds, reason })
admin.content.images.getStats({ period })

// Generation Jobs
admin.content.jobs.list({ filters, limit, offset })
admin.content.jobs.get({ jobId })
admin.content.jobs.retry({ jobId })
admin.content.jobs.cancel({ jobId })

// Influencer Requests
admin.content.influencerRequests.list({ status?, limit, offset })
admin.content.influencerRequests.get({ requestId })
admin.content.influencerRequests.approve({ requestId, note? })
admin.content.influencerRequests.reject({ requestId, reason })
```

### Moderation Schema Addition

```typescript
// Add to images.schema.ts or new moderation.schema.ts
export const imageModeration = pgTable('image_moderation', {
  id: uuid('id').defaultRandom().primaryKey(),
  imageId: uuid('image_id')
    .notNull()
    .references(() => images.id, { onDelete: 'cascade' }),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUsers.id),
  action: text('action').notNull(), // 'flag', 'remove', 'restore'
  reason: text('reason').notNull(),
  category: text('category').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### UI Components

```
apps/admin/app/content/
├── gallery/
│   ├── page.tsx               # Image gallery
│   └── [id]/
│       └── page.tsx           # Image detail
├── jobs/
│   ├── page.tsx               # Jobs list
│   └── [id]/
│       └── page.tsx           # Job detail
├── influencer-requests/
│   ├── page.tsx               # Requests queue
│   └── [id]/
│       └── page.tsx           # Request detail
├── components/
│   ├── ImageGrid.tsx
│   ├── ImageFilters.tsx
│   ├── ImageCard.tsx
│   ├── ImageDetail.tsx
│   ├── ModerationDialog.tsx
│   ├── JobsTable.tsx
│   ├── JobDetail.tsx
│   ├── InfluencerRequestCard.tsx
│   └── ContentStats.tsx
└── hooks/
    ├── useImages.ts
    ├── useJobs.ts
    └── useInfluencerRequests.ts
```

### Image Grid Performance

```typescript
// Virtualized image grid for performance
import { useVirtualizer } from '@tanstack/react-virtual';

export function ImageGrid({ images }: { images: Image[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: Math.ceil(images.length / 4), // 4 columns
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated row height
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div key={virtualRow.key} className="grid grid-cols-4 gap-4">
            {/* Render 4 images per row */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Non-Goals (Phase 2+)

- AI-powered content moderation
- Real-time WebSocket job updates
- Image editing/manipulation
- Batch image download
- Content approval workflow (pre-publication)

---

## Dependencies

- EP-050: Admin Authentication
- EP-051: User Management (for user links)
- Existing images, generationJobs, influencerRequests schemas
- S3/R2 for image storage

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
