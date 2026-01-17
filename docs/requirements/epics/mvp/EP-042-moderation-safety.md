# [EPIC] EP-042: Content Moderation & Safety

## Overview

Content moderation and safety features to ensure compliance with platform policies, protect users, and handle inappropriate content. Critical for NSFW platforms to maintain legal compliance and user trust.

---

## Business Impact

**Target Metric**: Risk Mitigation, B - Retention

**Hypothesis**: When users feel safe and the platform enforces clear content policies, trust increases and legal risk decreases.

**Success Criteria**:
- Content policy filter blocks: **>95%** of disallowed prompts
- Flagged content review time: **<24 hours**
- False positive rate: **<5%**
- User report completion: **>80%**
- Zero legal incidents from policy violations

---

## Features

### F1: Content Policy Filter

- Pre-generation prompt filtering
- Block disallowed prompts before generation starts
- Real-time validation as user types (in prompt builder if added)
- Clear error messages explaining why prompt was blocked
- Whitelist/blacklist of keywords and patterns

**Blocked Content Types:**
- Minors (any age-related terms suggesting <18)
- Non-consensual scenarios
- Real person likeness requests (without consent verification)
- Extreme violence or gore
- Illegal activities
- Hate speech or discriminatory content

**Filter Implementation:**
- Keyword matching (blocked terms list)
- Pattern recognition (age indicators, non-consensual language)
- ML-based classification (optional, Phase 2)
- Configurable sensitivity levels

### F2: Flagged Output Handling

- Automatic flagging of generated content that violates policies
- Manual flagging by users (report button)
- Blur/block flagged content with reason displayed
- Admin review queue for flagged content
- User notification when content is flagged

**Flagging Triggers:**
- Post-generation content analysis
- User reports
- Admin manual review
- Automated detection (if ML available)

**Flagged Content States:**
- `pending_review` - Awaiting admin review
- `flagged` - Confirmed violation, blurred/blocked
- `approved` - False positive, restored
- `removed` - Permanently deleted

### F3: Report/Appeal System

- "Report Content" button on generated images
- Report form with:
  - Reason selection (inappropriate, copyright, other)
  - Optional description
  - Screenshot/evidence upload
- Appeal process for users whose content was flagged
- Appeal form with explanation
- Status tracking (pending, reviewed, resolved)

**Report Reasons:**
- Inappropriate content
- Copyright violation
- Harassment
- Spam
- Other (with description)

**Appeal Process:**
1. User receives notification of flag
2. User can appeal with explanation
3. Admin reviews appeal
4. Decision communicated to user
5. Content restored or permanently removed

### F4: Brand-Safe Mode Toggle

- Toggle in user settings or generation options
- Stricter content filter when enabled
- Blocks suggestive content, not just explicit
- Clear indication when brand-safe mode is active
- Applies to all generations while enabled

**Brand-Safe Filter Rules:**
- No nudity or suggestive poses
- No adult themes or innuendo
- Professional/editorial style only
- Conservative outfit requirements
- Safe-for-work environments only

### F5: Content Moderation Dashboard (Admin)

- Admin-only dashboard for reviewing flagged content
- Queue of pending reports and appeals
- Content preview with metadata (user, generation config, timestamp)
- Quick actions: Approve, Flag, Remove, Ban User
- Search and filter by user, date, reason
- Audit log of all moderation actions

**Admin Actions:**
- Review flagged content
- Approve appeals
- Remove violating content
- Warn or ban users
- View user history

### F6: Automated Detection (Basic)

- Post-generation image analysis
- Check for policy violations
- Auto-flag suspicious content
- Human review required for flagged items
- False positive handling

**Detection Methods (MVP):**
- Keyword analysis of generation prompts
- Basic image analysis (NSFW detection API)
- Pattern matching for known violations
- User behavior patterns (repeated violations)

---

## Acceptance Criteria

### AC-1: Content Policy Filter

- [ ] Prompt filtering blocks disallowed content before generation
- [ ] Blocked prompts show clear error message
- [ ] Error explains which policy was violated
- [ ] Filter works for all generation entry points (studio, wizard, etc.)
- [ ] Keyword list is configurable (admin)
- [ ] False positives are minimized (<5%)

### AC-2: Flagged Output Handling

- [ ] Generated content can be automatically flagged
- [ ] Flagged content is blurred/blocked with reason
- [ ] Users see notification when their content is flagged
- [ ] Flagged content goes to admin review queue
- [ ] Admin can approve/remove flagged content
- [ ] Removed content is permanently deleted

### AC-3: Report System

- [ ] "Report" button visible on all generated images
- [ ] Report form collects reason and optional description
- [ ] Reports are submitted to admin queue
- [ ] Users receive confirmation when report is submitted
- [ ] Users can view status of their reports
- [ ] Reports are reviewed within 24 hours

### AC-4: Appeal System

- [ ] Users can appeal flagged content
- [ ] Appeal form allows explanation
- [ ] Appeals go to admin review queue
- [ ] Users receive decision notification
- [ ] Approved appeals restore content
- [ ] Denied appeals show reason

### AC-5: Brand-Safe Mode

- [ ] Toggle available in settings or generation options
- [ ] When enabled, stricter filter applies
- [ ] Clear indication when brand-safe mode is active
- [ ] All generations respect brand-safe mode
- [ ] Toggle state persists across sessions

### AC-6: Admin Dashboard

- [ ] Admin-only access to moderation dashboard
- [ ] Queue shows pending reports and appeals
- [ ] Content preview with full context
- [ ] Quick actions available (approve, flag, remove)
- [ ] Search and filter functionality
- [ ] Audit log of all actions

### AC-7: Automated Detection

- [ ] Post-generation analysis runs automatically
- [ ] Suspicious content is auto-flagged
- [ ] Auto-flagged content requires human review
- [ ] False positive rate is tracked
- [ ] Detection rules are configurable

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `content_filter_blocked` | Prompt blocked by filter | `reason`, `prompt_preview`, `user_id` |
| `content_flagged_auto` | Content auto-flagged | `content_id`, `reason`, `user_id` |
| `content_flagged_manual` | User reports content | `content_id`, `reason`, `reporter_id` |
| `content_appeal_submitted` | User appeals flag | `content_id`, `user_id` |
| `content_appeal_approved` | Appeal approved | `content_id`, `user_id` |
| `content_appeal_denied` | Appeal denied | `content_id`, `user_id`, `reason` |
| `brand_safe_mode_toggled` | User toggles brand-safe | `enabled`, `user_id` |
| `admin_moderation_action` | Admin takes action | `action`, `content_id`, `user_id`, `admin_id` |

---

## User Stories

### ST-200: Block Inappropriate Prompts

**As a** platform operator  
**I want to** block disallowed prompts before generation  
**So that** we prevent policy violations proactively

**AC**: AC-1

### ST-201: Report Inappropriate Content

**As a** user  
**I want to** report content that violates policies  
**So that** the platform stays safe and compliant

**AC**: AC-3

### ST-202: Appeal Flagged Content

**As a** user whose content was flagged  
**I want to** appeal the decision  
**So that** false positives can be corrected

**AC**: AC-4

### ST-203: Use Brand-Safe Mode

**As a** user creating professional content  
**I want to** enable brand-safe mode  
**So that** all my generations are safe for work

**AC**: AC-5

### ST-204: Review Flagged Content (Admin)

**As an** admin  
**I want to** review flagged content and reports  
**So that** I can maintain platform safety

**AC**: AC-6

---

## Technical Notes

### Content Filter Implementation

```typescript
// libs/business/src/services/content-filter.service.ts
interface ContentFilter {
  checkPrompt(prompt: string, nsfwEnabled: boolean): FilterResult;
  checkImage(imageUrl: string): FilterResult;
}

interface FilterResult {
  allowed: boolean;
  reason?: string;
  confidence?: number;
  flaggedKeywords?: string[];
}

// Blocked keywords (configurable)
const BLOCKED_KEYWORDS = [
  'minor', 'underage', 'teen', 'child', 'kid',
  'non-consensual', 'rape', 'forced',
  // ... more keywords
];

// Pattern matching
const AGE_PATTERNS = [
  /\b(1[0-7]|under\s*18|below\s*18)\b/i,
  // ... more patterns
];
```

### Flagged Content Storage

```sql
-- Flagged content table
CREATE TABLE flagged_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL, -- Reference to image/post
  user_id UUID REFERENCES auth.users(id),
  flagged_by UUID REFERENCES auth.users(id), -- Reporter or system
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending_review', -- pending_review, flagged, approved, removed
  appeal_id UUID REFERENCES content_appeals(id),
  admin_reviewed_by UUID REFERENCES auth.users(id),
  admin_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content appeals table
CREATE TABLE content_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flagged_content_id UUID REFERENCES flagged_content(id),
  user_id UUID REFERENCES auth.users(id),
  explanation TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, denied
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  decision_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  reported_by UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, reviewed, resolved
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

```
POST /api/content/check-prompt
  Body: { prompt: string, nsfwEnabled: boolean }
  Response: { allowed: boolean, reason?: string }

POST /api/content/:id/report
  Body: { reason: string, description?: string }
  Response: { report_id: string, status: 'submitted' }

POST /api/content/:id/appeal
  Body: { explanation: string }
  Response: { appeal_id: string, status: 'submitted' }

GET /api/admin/moderation/queue
  Response: { reports: Report[], appeals: Appeal[], flagged: FlaggedContent[] }

POST /api/admin/moderation/:id/review
  Body: { action: 'approve' | 'flag' | 'remove', reason?: string }
  Response: { success: boolean }
```

### NSFW Detection Integration

```typescript
// Use external NSFW detection API (e.g., Sightengine, AWS Rekognition)
import { detectNSFW } from '@ryla/business/services/nsfw-detection';

async function checkImageSafety(imageUrl: string): Promise<FilterResult> {
  const result = await detectNSFW(imageUrl);
  
  if (result.nsfw && result.confidence > 0.8) {
    return {
      allowed: false,
      reason: 'NSFW content detected',
      confidence: result.confidence,
    };
  }
  
  return { allowed: true };
}
```

---

## Dependencies

- User authentication (EP-002)
- Content generation (EP-005)
- Admin dashboard (future epic or manual process)
- NSFW detection API (external service)
- Legal review of content policies

---

## Non-Goals (Phase 2+)

- ML-based content classification (basic keyword/pattern matching for MVP)
- Real-time video moderation
- Automated user banning (manual only for MVP)
- Multi-language content filtering
- Advanced image analysis (beyond basic NSFW detection)

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| False positives too high | Medium | High | Start with conservative rules, iterate based on feedback |
| Filter too permissive | Medium | High | Regular review of blocked content, update keyword lists |
| Admin review bottleneck | High | Medium | Clear prioritization, automated triage where possible |
| Legal liability | Low | High | Legal review of policies, clear documentation |

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
