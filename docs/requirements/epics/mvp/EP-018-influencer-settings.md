# [EPIC] EP-018: AI Influencer Settings

## Overview

Settings page for managing AI Influencer configuration, including NSFW content toggle, handle/slug editing, and future social media account connections. Provides users with control over their AI Influencer's identity and content settings.

> **Note**: Social media account connections are disabled in MVP and labeled as "Coming Soon".

---

## Business Impact

**Target Metric**: B - Retention

**Hypothesis**: When users can easily configure their AI Influencer settings (NSFW, handle, etc.), they will have better control over their content and return to use the platform more frequently.

**Success Criteria**:
- Settings page access rate: **>40%** of users with AI Influencers
- NSFW toggle usage: **>70%** (aligned with funnel data)
- Handle edit completion: **>80%** of attempts
- Settings page load time: **<2 seconds**

---

## Features

### F1: Settings Access Button

- Settings icon/button in influencer profile header (top banner)
- Icon fits seamlessly with existing UI design
- Positioned in top-right area of profile header
- Click navigates to settings page
- Visual indicator (gear icon) consistent with design system

### F2: Settings Page Layout

- Separate page route: `/influencer/[id]/settings`
- Back button to return to influencer profile
- Page title: "Settings" or "AI Influencer Settings"
- Clean, organized section layout
- Mobile responsive design

### F3: Adult Content Toggle

- Toggle switch to enable/disable NSFW content
- Clear label: "Enable Adult Content" or "NSFW Content"
- Helper text explaining what this setting controls
- Visual state indication (on/off)
- Immediate save on toggle change
- Confirmation for disabling (if currently enabled)
- Age verification reminder (18+)

### F4: Handle/Slug Editing

- Editable handle/slug field
- Current handle displayed
- Input validation:
  - Unique per user (no duplicates)
  - Valid format (alphanumeric, hyphens, underscores)
  - Length constraints (min 3, max 30 characters)
  - No spaces or special characters
- Real-time validation feedback
- Save button to apply changes
- Success/error notifications
- Handle format: `@username` or `username` (consistent with existing)

### F5: Social Media Connections (Coming Soon)

- Section for social media account connections
- Disabled state with "Coming Soon" label
- Visual placeholder for future integrations:
  - Instagram
  - Twitter/X
  - TikTok
  - OnlyFans
  - Fanvue
- Grayed out appearance
- Tooltip or helper text explaining future feature

### F6: Additional Settings (Future-Ready)

- Settings page structure allows for future additions:
  - Profile picture management
  - Bio editing
  - Privacy settings
  - Content preferences
- Organized in expandable sections

### F7: Save & Navigation

- Save button for handle changes
- Auto-save for toggle switches
- Back button returns to profile
- Unsaved changes warning (if applicable)
- Success confirmation messages
- Error handling and display

---

## Acceptance Criteria

### AC-1: Settings Access

- [ ] Settings icon/button visible in influencer profile header
- [ ] Icon positioned appropriately in top banner
- [ ] Icon matches existing UI design system
- [ ] Click navigates to `/influencer/[id]/settings`
- [ ] Icon is accessible and has proper hover states

### AC-2: Settings Page

- [ ] Settings page loads correctly
- [ ] Back button returns to influencer profile
- [ ] Page title is clear and descriptive
- [ ] Layout is organized and readable
- [ ] Mobile responsive (works on mobile devices)
- [ ] Loading states shown while fetching data

### AC-3: Adult Content Toggle

- [ ] Toggle switch displays current NSFW setting
- [ ] Toggle can be enabled/disabled
- [ ] Changes save immediately on toggle
- [ ] Success message shown on save
- [ ] Error handling if save fails
- [ ] Helper text explains what the setting does
- [ ] Age verification reminder visible (18+)

### AC-4: Handle/Slug Editing

- [ ] Current handle displayed in editable field
- [ ] User can edit handle value
- [ ] Validation runs on input:
  - [ ] Checks for uniqueness (per user)
  - [ ] Validates format (alphanumeric, hyphens, underscores)
  - [ ] Enforces length (3-30 characters)
  - [ ] Prevents invalid characters
- [ ] Real-time validation feedback shown
- [ ] Save button applies changes
- [ ] Success notification on save
- [ ] Error message if validation fails
- [ ] Error message if handle already exists
- [ ] Handle updates in database
- [ ] Handle updates in UI immediately

### AC-5: Social Media Connections

- [ ] Social media section visible
- [ ] All connection options shown as disabled
- [ ] "Coming Soon" label clearly displayed
- [ ] Placeholder icons/logos for each platform
- [ ] Section is visually distinct (grayed out)
- [ ] Helper text explains future feature
- [ ] No clickable actions (disabled state)

### AC-6: Navigation & UX

- [ ] Back button works correctly
- [ ] Unsaved changes warning (if applicable)
- [ ] Success messages clear and dismissible
- [ ] Error messages clear and actionable
- [ ] Page maintains scroll position appropriately
- [ ] Settings persist after page refresh

### AC-7: Data Persistence

- [ ] NSFW toggle state saved to database
- [ ] Handle changes saved to database
- [ ] Changes reflected in influencer profile
- [ ] Changes reflected in all relevant UI components
- [ ] Data validation on backend

### AC-8: Analytics

- [ ] Settings page view tracked
- [ ] NSFW toggle change tracked
- [ ] Handle edit attempt tracked
- [ ] Handle edit success tracked
- [ ] Handle edit failure tracked
- [ ] Back button click tracked

---

## User Stories

### ST-001: Access Settings

**As a** user  
**I want to** access settings from the influencer profile page  
**So that** I can configure my AI Influencer preferences

**Acceptance Criteria**: AC-1

---

### ST-002: Toggle Adult Content

**As a** user  
**I want to** enable or disable adult content for my AI Influencer  
**So that** I can control the type of content generated

**Acceptance Criteria**: AC-3

---

### ST-003: Edit Handle

**As a** user  
**I want to** edit my AI Influencer's handle/slug  
**So that** I can customize the public identifier

**Acceptance Criteria**: AC-4

---

### ST-004: View Social Media Placeholder

**As a** user  
**I want to** see that social media connections are coming soon  
**So that** I know this feature is planned

**Acceptance Criteria**: AC-5

---

## Technical Notes

### Data Model

The settings will update the existing `characters` table:

```typescript
// Existing fields that will be updated:
interface Character {
  id: string;
  userId: string;
  name: string;
  handle: string; // Editable via settings
  config: {
    nsfwEnabled: boolean; // Editable via settings
    // ... other config fields
  };
  // ... other fields
}
```

### API Endpoints

**Update Influencer Settings**
- `PATCH /api/influencer/[id]/settings`
- Payload:
  ```typescript
  {
    handle?: string;
    nsfwEnabled?: boolean;
  }
  ```
- Response:
  ```typescript
  {
    success: boolean;
    influencer: AIInfluencer;
    errors?: string[];
  }
  ```

**Get Influencer Settings**
- `GET /api/influencer/[id]/settings`
- Returns current settings for the influencer

### Validation Rules

**Handle Validation:**
- Required: Yes
- Min length: 3 characters
- Max length: 30 characters
- Allowed characters: `a-z`, `A-Z`, `0-9`, `-`, `_`
- Must be unique per user (case-insensitive)
- Cannot be empty or whitespace only
- Format: Can include `@` prefix (optional, stored without)

**NSFW Toggle:**
- Boolean value
- Default: `false`
- Requires user to be 18+ (verified during account creation)

### Route Structure

```
/influencer/[id]                    → Profile page
/influencer/[id]/settings           → Settings page (new)
/influencer/[id]/studio             → Content studio (existing)
```

### UI Components

**Settings Icon/Button:**
- Location: Top-right of influencer profile header
- Icon: Gear/Settings icon from lucide-react
- Size: Match existing action buttons
- Style: Glassy outline or subtle icon button

**Settings Page Components:**
- `InfluencerSettingsPage` - Main page component
- `SettingsSection` - Reusable section wrapper
- `ToggleSwitch` - NSFW toggle component
- `HandleInput` - Handle editing input with validation
- `SocialMediaPlaceholder` - Coming soon section

### Analytics Events

```typescript
// Settings page view
analytics.capture('settings_page_viewed', {
  influencer_id: string;
});

// NSFW toggle changed
analytics.capture('nsfw_toggle_changed', {
  influencer_id: string;
  nsfw_enabled: boolean;
});

// Handle edit started
analytics.capture('handle_edit_started', {
  influencer_id: string;
});

// Handle edit completed
analytics.capture('handle_edit_completed', {
  influencer_id: string;
  handle: string;
  success: boolean;
});

// Handle edit failed
analytics.capture('handle_edit_failed', {
  influencer_id: string;
  error: string;
  reason: 'validation' | 'duplicate' | 'server_error';
});
```

---

## Dependencies

- **EP-004**: Dashboard (influencer profile page exists)
- **EP-001**: Influencer wizard (influencer creation)
- **EP-002**: Authentication (user context)

---

## Out of Scope (MVP)

- Social media account connections (Phase 2)
- Profile picture management via settings (handled elsewhere)
- Bio editing via settings (handled elsewhere)
- Advanced privacy settings
- Content moderation settings
- Bulk settings for multiple influencers

---

## Future Enhancements (Phase 2+)

- Social media account OAuth connections
- Auto-posting to connected platforms
- Content scheduling preferences
- Advanced NSFW filters and controls
- Profile visibility settings
- Export format preferences

---

## Testing Requirements

### Unit Tests
- Handle validation logic
- NSFW toggle state management
- Settings form validation

### Integration Tests
- Settings API endpoint
- Database updates
- Error handling

### E2E Tests (Playwright)
- Navigate to settings from profile
- Toggle NSFW setting
- Edit handle successfully
- Edit handle with validation errors
- Navigate back to profile
- Settings persist after refresh

---

## Design Considerations

### Settings Icon Placement

The settings icon should be placed in the top banner of the influencer profile, likely:
- Top-right corner, near the stats/actions area
- Or integrated into the header navigation area
- Should be subtle but discoverable
- Match the visual weight of other header elements

### Settings Page Layout

```
┌─────────────────────────────────────┐
│ ← Back to Profile                    │
├─────────────────────────────────────┤
│ Settings                             │
├─────────────────────────────────────┤
│                                      │
│ Content Settings                     │
│ ┌─────────────────────────────────┐ │
│ │ Enable Adult Content    [Toggle]│ │
│ │ 18+ only                        │ │
│ └─────────────────────────────────┘ │
│                                      │
│ Identity Settings                     │
│ ┌─────────────────────────────────┐ │
│ │ Handle/Slug                      │ │
│ │ [@username____________] [Save]   │ │
│ │ Must be unique, 3-30 chars      │ │
│ └─────────────────────────────────┘ │
│                                      │
│ Social Media (Coming Soon)           │
│ ┌─────────────────────────────────┐ │
│ │ [Instagram] [Disabled]          │ │
│ │ [Twitter]   [Disabled]          │ │
│ │ [TikTok]    [Disabled]          │ │
│ │ Coming Soon                     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Related Epics

- **EP-004**: Dashboard (influencer profile page)
- **EP-001**: Influencer wizard (initial NSFW setting)
- **EP-005**: Content studio (NSFW setting affects generation)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Settings page access rate | >40% | % of users with influencers who visit settings |
| NSFW toggle usage | >70% | % of users who toggle NSFW at least once |
| Handle edit completion | >80% | % of edit attempts that succeed |
| Settings page load time | <2s | Average page load time |
| Settings save success rate | >95% | % of save operations that succeed |

---

## Notes

- Handle editing should check for uniqueness across all user's influencers
- NSFW toggle change should be logged for compliance
- Settings page should be accessible only to the influencer owner
- Consider adding confirmation dialog when disabling NSFW if it's currently enabled
- Social media section should be clearly marked as "Coming Soon" to set expectations

