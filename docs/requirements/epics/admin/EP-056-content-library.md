# [EPIC] EP-056: Content Library Management

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 3  
**Priority**: P2  
**Status**: Completed

---

## Overview

Build comprehensive content library management tools for prompts, templates, poses, outfits, and profile picture sets. Enables content team to create, curate, and publish content that users can access in the web app.

---

## Business Impact

**Target Metric**: C-Core Value, A-Activation

**Hypothesis**: When we can efficiently manage and curate content, we can provide users with better options, improving their experience and output quality.

**Success Criteria**:

- All content manageable without database access
- Content publishing workflow: draft → review → published
- Content performance tracking available

---

## Features

### F1: Prompt Management

Full CRUD for prompts table:

**List View**:
- All prompts in paginated table
- Filter by category, rating, status (active, draft)
- Filter by system vs user-created
- Sort by usage, favorites, date
- Quick publish/unpublish toggle

**Create/Edit Prompt**:
- Name and description
- Category selection
- Template text (with placeholder documentation)
- Negative prompt
- Rating (SFW, suggestive, NSFW)
- Recommended workflow
- Aspect ratio
- Tags
- Required DNA fields
- Preview/test generation (future)

**Prompt Detail**:
- Full prompt configuration
- Usage statistics
- Favorite count
- Success rate
- Recent usages with outcomes

### F2: Template Management

Manage user and system templates:

**List View**:
- All templates
- Filter by public/private, curated, user
- Filter by category/tags
- Sort by usage, date, success rate

**Template Detail**:
- Preview image
- Full configuration
- Usage statistics
- User who created it

**Curation Actions**:
- Feature template (show prominently)
- Add to curated collection
- Add/edit tags
- Approve/reject for public visibility

### F3: Pose Preset Management

Manage pose presets (once schema exists):

**List View**:
- All poses
- Filter by category
- Preview thumbnails

**Create/Edit Pose**:
- Name and ID
- Category
- Preview image upload
- Prompt modifier
- Compatible scenes/environments
- NSFW flag

### F4: Outfit Preset Management

Manage outfit presets:

**List View**:
- All outfits
- Filter by category, user, influencer

**Create/Edit Outfit**:
- Name and description
- Composition (top, bottom, shoes, etc.)
- Category
- Preview image

### F5: Profile Picture Set Management

Manage starter sets for profile pictures:

**List View**:
- System sets and user sets
- Preview thumbnails
- Usage count

**Create/Edit Set**:
- Name, description, style
- Positions configuration
- Base prompt template
- Negative prompt
- Tags

### F6: Content Publishing Workflow

Standard workflow for all content types:

```
draft → pending_review → published/rejected
          ↓
        needs_changes
```

- Draft: Only visible to creator/admins
- Pending Review: Submitted for publishing
- Published: Visible to all users
- Rejected: Not published (with reason)
- Needs Changes: Returned for edits

### F7: Content Categories & Tags

Manage categories and tags:

- Create/edit categories
- Create/edit tags
- Assign colors to tags
- Tag usage statistics

### F8: Bulk Operations

Efficiency features:

- Bulk publish/unpublish
- Bulk tag assignment
- Bulk category change
- Import/export (CSV/JSON)

### F9: Content Performance Dashboard

Content analytics:

- Most used prompts/templates
- Success rate by content
- User favorites trends
- Conversion impact (which content leads to more generations)

---

## Acceptance Criteria

### AC-1: Prompt CRUD

- [ ] Can list all prompts with filters
- [ ] Can create new prompt
- [ ] Can edit existing prompt
- [ ] Can delete/archive prompt
- [ ] Validation for required fields
- [ ] Template placeholders documented

### AC-2: Prompt Publishing

- [ ] Can toggle active/inactive
- [ ] Status change is immediate
- [ ] Audit log created
- [ ] Users see updated content

### AC-3: Template Management

- [ ] Can list all templates
- [ ] Can view template details
- [ ] Can curate (feature/tag)
- [ ] Can approve/reject public templates

### AC-4: Pose Management

- [ ] Can list all poses
- [ ] Can create new pose
- [ ] Can edit existing pose
- [ ] Can upload preview image
- [ ] Categories work correctly

### AC-5: Outfit Management

- [ ] Can list all outfits
- [ ] Can create new outfit
- [ ] Composition editor works
- [ ] Can filter by category

### AC-6: Profile Picture Sets

- [ ] Can list all sets
- [ ] Can create new set
- [ ] Positions configuration works
- [ ] Can set as system set

### AC-7: Publishing Workflow

- [ ] Status transitions work
- [ ] Review queue visible
- [ ] Rejection requires reason
- [ ] Status history tracked

### AC-8: Tags & Categories

- [ ] Can create/edit tags
- [ ] Can create/edit categories
- [ ] Can assign to content
- [ ] Tag colors work

### AC-9: Bulk Operations

- [ ] Can select multiple items
- [ ] Bulk actions work correctly
- [ ] Confirmation for destructive actions
- [ ] Progress shown for large operations

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_prompt_created` | Prompt created | `prompt_id`, `category` |
| `admin_prompt_updated` | Prompt edited | `prompt_id`, `fields_changed` |
| `admin_prompt_published` | Prompt activated | `prompt_id` |
| `admin_template_curated` | Template featured | `template_id`, `action` |
| `admin_content_bulk_action` | Bulk action | `type`, `action`, `count` |

---

## User Stories

### ST-260: Create New Prompt

**As a** content admin  
**I want to** create a new prompt template  
**So that** users can use it for generation

**AC**: AC-1, AC-2

### ST-261: Curate Template

**As a** content admin  
**I want to** feature high-quality templates  
**So that** users can easily find good content

**AC**: AC-3

### ST-262: Manage Poses

**As a** content admin  
**I want to** manage pose presets  
**So that** users have more pose options

**AC**: AC-4

### ST-263: Create Outfit Preset

**As a** content admin  
**I want to** create outfit presets  
**So that** users can quickly apply outfits

**AC**: AC-5

### ST-264: Manage Profile Picture Sets

**As a** content admin  
**I want to** create profile picture starter sets  
**So that** new users have great options

**AC**: AC-6

### ST-265: Bulk Tag Content

**As a** content admin  
**I want to** apply tags to multiple items  
**So that** I can organize content efficiently

**AC**: AC-8, AC-9

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router - Content Library
admin.library.prompts.list({ filters, sort, limit, offset })
admin.library.prompts.get({ promptId })
admin.library.prompts.create({ data })
admin.library.prompts.update({ promptId, data })
admin.library.prompts.delete({ promptId })
admin.library.prompts.publish({ promptId })
admin.library.prompts.unpublish({ promptId })
admin.library.prompts.getStats({ promptId })

admin.library.templates.list({ filters, sort, limit, offset })
admin.library.templates.get({ templateId })
admin.library.templates.curate({ templateId, featured, tags })
admin.library.templates.approve({ templateId })
admin.library.templates.reject({ templateId, reason })

admin.library.poses.list({ filters })
admin.library.poses.create({ data })
admin.library.poses.update({ poseId, data })
admin.library.poses.delete({ poseId })

admin.library.outfits.list({ filters })
admin.library.outfits.create({ data })
admin.library.outfits.update({ outfitId, data })
admin.library.outfits.delete({ outfitId })

admin.library.profileSets.list({ filters })
admin.library.profileSets.create({ data })
admin.library.profileSets.update({ setId, data })
admin.library.profileSets.delete({ setId })

admin.library.tags.list()
admin.library.tags.create({ name, color })
admin.library.tags.update({ tagId, data })
admin.library.tags.delete({ tagId })

admin.library.categories.list()
admin.library.categories.create({ name, parent? })
admin.library.categories.update({ categoryId, data })
admin.library.categories.delete({ categoryId })

admin.library.bulk.publish({ type, ids })
admin.library.bulk.unpublish({ type, ids })
admin.library.bulk.addTags({ type, ids, tags })
admin.library.bulk.setCategory({ type, ids, category })
```

### Prompt Editor Component

```typescript
// apps/admin/components/PromptEditor.tsx
const PROMPT_PLACEHOLDERS = [
  { key: '{{character}}', description: 'Character DNA description' },
  { key: '{{outfit}}', description: 'Outfit description' },
  { key: '{{scene}}', description: 'Scene setting' },
  { key: '{{environment}}', description: 'Environment details' },
  { key: '{{pose}}', description: 'Pose description' },
  { key: '{{lighting}}', description: 'Lighting style' },
];

export function PromptEditor({ value, onChange }) {
  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={onChange}
        className="min-h-[200px] font-mono"
        placeholder="Enter prompt template..."
      />
      <div className="bg-secondary rounded p-4">
        <h4 className="font-medium mb-2">Available Placeholders</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {PROMPT_PLACEHOLDERS.map(p => (
            <div key={p.key} className="flex gap-2">
              <code className="text-primary">{p.key}</code>
              <span className="text-muted-foreground">{p.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### UI Components

```
apps/admin/app/library/
├── prompts/
│   ├── page.tsx               # Prompts list
│   ├── new/
│   │   └── page.tsx           # Create prompt
│   └── [id]/
│       └── page.tsx           # Edit prompt
├── templates/
│   ├── page.tsx               # Templates list
│   └── [id]/
│       └── page.tsx           # Template detail
├── poses/
│   ├── page.tsx               # Poses list
│   └── [id]/
│       └── page.tsx           # Edit pose
├── outfits/
│   ├── page.tsx               # Outfits list
│   └── [id]/
│       └── page.tsx           # Edit outfit
├── profile-sets/
│   ├── page.tsx               # Sets list
│   └── [id]/
│       └── page.tsx           # Edit set
├── tags/
│   └── page.tsx               # Tags management
├── components/
│   ├── PromptEditor.tsx
│   ├── PromptForm.tsx
│   ├── TemplateCard.tsx
│   ├── PoseCard.tsx
│   ├── OutfitComposer.tsx
│   ├── ProfileSetEditor.tsx
│   ├── TagManager.tsx
│   ├── BulkActionBar.tsx
│   └── PublishingStatus.tsx
└── hooks/
    ├── usePrompts.ts
    ├── useTemplates.ts
    └── useContentLibrary.ts
```

### New Schema: Poses (if not exists)

```typescript
export const poses = pgTable('poses', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(), // e.g., 'standing-casual'
  name: text('name').notNull(),
  category: text('category').notNull(), // 'standing', 'sitting', 'action'
  description: text('description'),
  promptModifier: text('prompt_modifier').notNull(),
  previewImageUrl: text('preview_image_url'),
  isNsfw: boolean('is_nsfw').default(false),
  isActive: boolean('is_active').default(true),
  compatibleScenes: jsonb('compatible_scenes').$type<string[]>(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

---

## Non-Goals (Phase 2+)

- AI-assisted prompt generation
- A/B testing for content
- Localization/i18n for content
- User submission approval workflow
- Content versioning
- Content scheduling (publish at time)

---

## Dependencies

- EP-050: Admin Authentication
- EP-054: Content Moderation (viewing content)
- Existing prompts, templates, outfitPresets, promptSets schemas

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
