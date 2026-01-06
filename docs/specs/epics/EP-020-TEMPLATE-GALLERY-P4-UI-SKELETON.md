# EP-020 (P4) — Template Gallery: UI Skeleton

Working in **PHASE P4 (UI Skeleton)** on **EP-020, ST-031-ST-035**.

## Screens

### S1: Content Studio with Templates Tab (Modified)

- **Location**: `/influencer/[id]/studio`
- **Auth required**: Yes
- **Purpose**: Add "Templates" tab alongside existing "Generate" tab for browsing and applying templates
- **Modification**: Extend existing Content Studio page with tab navigation

### S2: Template Browsing Page (New)

- **Location**: `/templates`
- **Auth required**: No (public templates visible to all)
- **Purpose**: Dedicated page for discovering templates across all AI Influencers
- **Navigation**: Accessible from Content Studio, main navigation, and onboarding

### S3: Template Detail Modal (New)

- **Trigger**: Click on template card (from S1 or S2)
- **Auth required**: No (for viewing), Yes (for applying)
- **Purpose**: Show full template details, configuration breakdown, and apply action

### S4: Save Template Dialog (New)

- **Trigger**: After successful generation or from image gallery
- **Auth required**: Yes
- **Purpose**: Allow users to save successful generations as reusable templates

---

## Navigation Placement

### Content Studio Tabs

**File**: `apps/web/app/influencer/[id]/studio/page.tsx`

Add tab navigation above the generation form:

```
[Generate] [Templates]
─────────────────────
[Generation Form] or [Template Grid]
```

**Tab Structure:**
- **Generate Tab** (default): Current generation form (existing)
- **Templates Tab**: Template library grid with filters

### Template Browsing Page Link

**Locations:**
1. **Content Studio**: "Browse All Templates" link in Templates tab header
2. **Main Navigation**: "Templates" link (if main nav exists)
3. **Onboarding**: Link in tutorial/onboarding flow

---

## Components

### Content Studio Integration

#### `TemplateTabs` Component

**File**: `apps/web/components/studio/templates/template-tabs.tsx`

Composition:
- `Tabs` (from `@ryla/ui` or shadcn)
  - `TabsList`
    - `TabsTrigger`: "Generate"
    - `TabsTrigger`: "Templates"
  - `TabsContent`: Generation form (existing)
  - `TabsContent`: Template library grid

**Props:**
```typescript
interface TemplateTabsProps {
  influencerId: string;
  onTemplateApply: (templateId: string) => void;
  defaultTab?: 'generate' | 'templates';
}
```

#### `TemplateLibraryTab` Component

**File**: `apps/web/components/studio/templates/template-library-tab.tsx`

Composition:
- `TemplateLibraryTab` (container)
  - `TemplateSearch` (search bar)
  - `TemplateFilters` (filter sidebar/collapsible)
  - `TemplateGrid` (grid of template cards)
  - `TemplatePagination` (if needed)

**Props:**
```typescript
interface TemplateLibraryTabProps {
  influencerId?: string; // Optional: filter by influencer
  onTemplateClick: (templateId: string) => void;
  onTemplateApply: (templateId: string) => void;
}
```

#### `TemplateCard` Component

**File**: `apps/web/components/studio/templates/template-card.tsx`

Composition:
- `TemplateCard` (container)
  - `TemplatePreviewImage` (thumbnail)
  - `TemplateInfo` (scene, environment, outfit labels)
  - `TemplateMetadata` (aspect ratio, quality, model badges)
  - `TemplateStats` (usage count, success rate - optional)
  - `ApplyTemplateButton` ("Try Template" button)

**Props:**
```typescript
interface TemplateCardProps {
  template: Template;
  onApply: (templateId: string) => void;
  onViewDetails: (templateId: string) => void;
  showStats?: boolean;
}
```

**Template Card Layout:**
```
┌─────────────────────┐
│  [Preview Image]    │
│   (aspect ratio)    │
├─────────────────────┤
│ Scene: Professional │
│ Environment: Studio │
│ Outfit: Business    │
│                     │
│ 9:16 • HQ • Flux    │
│                     │
│ [Try Template]      │
│ Used 1.2k times     │
└─────────────────────┘
```

#### `TemplateFilters` Component

**File**: `apps/web/components/studio/templates/template-filters.tsx`

Composition:
- `TemplateFilters` (container)
  - `CategoryFilter` (All, My Templates, Curated, Popular)
  - `SceneFilter` (multi-select dropdown)
  - `EnvironmentFilter` (multi-select dropdown)
  - `AspectRatioFilter` (multi-select)
  - `QualityFilter` (Draft/HQ toggle)
  - `NSFWToggle` (show/hide NSFW)

**Props:**
```typescript
interface TemplateFiltersProps {
  filters: TemplateFilters;
  onFiltersChange: (filters: TemplateFilters) => void;
  influencerId?: string;
}
```

#### `TemplateSearch` Component

**File**: `apps/web/components/studio/templates/template-search.tsx`

Composition:
- `TemplateSearch` (container)
  - `SearchInput` (text input with search icon)
  - `ClearButton` (conditional, when query exists)

**Props:**
```typescript
interface TemplateSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
}
```

### Template Browsing Page

#### `TemplatesPage` Component

**File**: `apps/web/app/templates/page.tsx`

Composition:
- `TemplatesPage` (container)
  - `TemplateHero` (hero section with search)
  - `TemplateCategoryNav` (horizontal category tabs)
  - `TemplateFilters` (sidebar, collapsible on mobile)
  - `TemplateGrid` (main content area)
  - `TemplatePagination` (if needed)

#### `TemplateHero` Component

**File**: `apps/web/components/templates/template-hero.tsx`

Composition:
- `TemplateHero` (container)
  - `HeroTitle`: "Discover Successful Generations"
  - `HeroDescription`: "Browse curated templates and see what's possible"
  - `TemplateSearch` (prominent search bar)

#### `TemplateCategoryNav` Component

**File**: `apps/web/components/templates/template-category-nav.tsx`

Composition:
- `TemplateCategoryNav` (horizontal tabs)
  - Category buttons: All, By Scene, By Environment, Popular, Recent

**Categories:**
- All Templates
- By Scene (Professional, Candid, Fashion, etc.)
- By Environment (Beach, Home, Office, etc.)
- Popular (most used)
- Recent (newly added)

### Template Detail Modal

#### `TemplateDetailModal` Component

**File**: `apps/web/components/templates/template-detail-modal.tsx`

Composition:
- `TemplateDetailModal` (Dialog container)
  - `DialogHeader`
    - `DialogTitle`: Template name
    - `DialogDescription`: Template description
  - `TemplateDetailContent`
    - `TemplatePreviewImage` (full-size)
    - `TemplateConfigBreakdown` (all settings)
    - `TemplateStats` (usage count, success rate)
    - `TemplateMetadata` (created date, tags)
  - `DialogFooter`
    - `CancelButton`
    - `UseTemplateButton` ("Use This Template")

**Props:**
```typescript
interface TemplateDetailModalProps {
  templateId: string;
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
}
```

#### `TemplateConfigBreakdown` Component

**File**: `apps/web/components/templates/template-config-breakdown.tsx`

Composition:
- `TemplateConfigBreakdown` (container)
  - Config items:
    - Scene: [value]
    - Environment: [value]
    - Outfit: [value]
    - Pose: [value]
    - Style: [value]
    - Lighting: [value]
    - Model: [value]
    - Objects: [list]
    - Aspect Ratio: [value]
    - Quality: [value]
    - NSFW: [yes/no]

### Template Creation

#### `SaveTemplateDialog` Component

**File**: `apps/web/components/templates/save-template-dialog.tsx`

Composition:
- `SaveTemplateDialog` (Dialog container)
  - `DialogHeader`
    - `DialogTitle`: "Save as Template"
    - `DialogDescription`: "Save this generation configuration for reuse"
  - `SaveTemplateForm`
    - `TemplateNameInput` (required, with default)
    - `TemplateDescriptionInput` (optional textarea)
    - `TemplatePreviewSelector` (image selector)
    - `PublicToggle` (isPublic checkbox)
  - `DialogFooter`
    - `CancelButton`
    - `SaveButton`

**Props:**
```typescript
interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveTemplateData) => void;
  defaultName?: string;
  availableImages: Image[]; // From generation job
  defaultConfig: GenerationConfig; // From job
}
```

#### `TemplatePreviewSelector` Component

**File**: `apps/web/components/templates/template-preview-selector.tsx`

Composition:
- `TemplatePreviewSelector` (container)
  - Image grid (thumbnails from generation)
  - Selected image highlighted
  - Radio buttons or click-to-select

**Props:**
```typescript
interface TemplatePreviewSelectorProps {
  images: Image[];
  selectedImageId: string | null;
  onImageSelect: (imageId: string) => void;
}
```

---

## Interactions → API

### Open Templates Tab (Content Studio)

1. User clicks "Templates" tab in Content Studio
2. Frontend: `GET /api/templates?category=all&limit=20`
3. Show loading state (skeleton cards)
4. Display template grid
5. Analytics: `template_library_opened` (influencer_id, source: "studio")

### Browse Templates (Filter/Search)

1. User applies filter or types search query
2. Frontend: Debounce search (300ms)
3. Frontend: `GET /api/templates?{filters}&search={query}&sort={sort}`
4. Update template grid with filtered results
5. Analytics: 
   - `template_filtered` (filter_type, filter_value)
   - `template_searched` (query, filters_applied)

### View Template Details

1. User clicks template card
2. Frontend: `GET /api/templates/:id`
3. Open `TemplateDetailModal` with template data
4. Analytics: `template_browsed` (template_id, scene, environment, pose, style)

### Apply Template (Content Studio)

1. User clicks "Try Template" button
2. Frontend: `GET /api/templates/:id` (if not already loaded)
3. Extract `config` from template
4. Load config into `GenerationSettings` state:
   - Update scene selector
   - Update environment selector
   - Update outfit selector
   - Update pose selector
   - Update style selector
   - Update lighting selector
   - Update model selector
   - Update objects array
   - Update aspect ratio
   - Update quality mode
   - Update NSFW toggle
5. Switch to "Generate" tab
6. Show "Template applied" toast notification
7. Update credit cost preview
8. Analytics: `template_applied` (template_id, influencer_id)

### Apply Template (From Detail Modal)

1. User clicks "Use This Template" in modal
2. If not authenticated: Show login prompt, redirect after login
3. If authenticated: 
   - Extract config from template
   - Navigate to `/influencer/[id]/studio?template=:template_id`
   - Load template config into generation form
   - Close modal
4. Analytics: `template_applied` (template_id, influencer_id, source: "modal")

### Save Template (After Generation)

1. After successful generation (all images completed)
2. Show `SaveTemplateDialog` with:
   - Default name: "Scene + Environment + Pose"
   - Available images from generation
   - Pre-filled config from job
3. User optionally:
   - Edit template name
   - Add description
   - Select preview image (default: first image)
   - Toggle public/private
4. User clicks "Save"
5. Frontend: `POST /api/templates`
   - Body: { name, description, previewImageId, config, isPublic }
6. On success:
   - Show "Template saved" notification
   - Close dialog
   - Template appears in "My Templates" section
7. Analytics: `template_saved` (template_id, source_job_id, source_image_id)

### Save Template (From Gallery)

1. User selects image in gallery
2. User clicks "Save as Template" action
3. Show `SaveTemplateDialog` with:
   - Image metadata extracted
   - Config from image record
4. User edits and saves (same flow as above)

### Generate with Template

1. User applies template (config loaded)
2. User optionally modifies any setting
3. User clicks "Generate"
4. Frontend: Start generation with current settings
5. Frontend: `POST /api/template-usage` (async, don't block)
   - Body: { template_id, job_id }
6. Backend: Track usage, increment usage_count
7. Analytics: `template_used` (template_id, job_id, modified: boolean)

### Visit Templates Page

1. User navigates to `/templates`
2. Frontend: `GET /api/templates?category=all&limit=20`
3. Display hero section and template grid
4. Analytics: `template_page_visited` (source: "nav_link" | "onboarding" | "direct")

---

## States

### Template Library Tab (Loading)

- **Grid**: Skeleton cards (3-4 rows)
- **Filters**: Disabled
- **Search**: Enabled but shows "Loading..."
- **No data message**: Hidden

### Template Library Tab (Loaded)

- **Grid**: Template cards displayed
- **Filters**: Enabled
- **Search**: Enabled
- **Empty state**: "No templates found" (if filters return empty)
- **Pagination**: Show if hasMore

### Template Library Tab (Error)

- **Grid**: Error message
- **Filters**: Disabled
- **Retry button**: Show
- **Message**: "Failed to load templates. Please try again."

### Template Application (Success)

- **Toast notification**: "Template applied successfully"
- **Generate tab**: Active, form pre-filled
- **Settings**: All template config loaded
- **Credit cost**: Updated based on template settings

### Template Application (Error)

- **Toast notification**: "Failed to apply template"
- **Error message**: API error details
- **Fallback**: User can still configure manually

### Save Template Dialog (Initial)

- **Name**: Pre-filled with default
- **Description**: Empty
- **Preview selector**: First image selected
- **Public toggle**: Unchecked (private by default)
- **Save button**: Enabled if name valid

### Save Template Dialog (Saving)

- **Form**: Disabled
- **Save button**: Loading spinner, "Saving..."
- **Cancel**: Disabled

### Save Template Dialog (Success)

- **Form**: Hidden
- **Message**: "Template saved successfully"
- **Auto-close**: After 2 seconds

### Save Template Dialog (Error)

- **Form**: Re-enabled
- **Error banner**: API error message
- **Save button**: Re-enabled
- **Retry**: User can fix and resubmit

### Template Detail Modal (Loading)

- **Preview image**: Skeleton/placeholder
- **Config breakdown**: Skeleton items
- **Stats**: Loading spinner
- **Use button**: Disabled

### Template Detail Modal (Loaded)

- **Preview image**: Full-size image displayed
- **Config breakdown**: All settings shown
- **Stats**: Usage count, success rate displayed
- **Use button**: Enabled

---

## Component Structure

### File: `apps/web/components/studio/templates/template-tabs.tsx`

```typescript
export interface TemplateTabsProps {
  influencerId: string;
  onTemplateApply: (templateId: string) => void;
  defaultTab?: 'generate' | 'templates';
}

export function TemplateTabs({
  influencerId,
  onTemplateApply,
  defaultTab = 'generate',
}: TemplateTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="generate">Generate</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
      </TabsList>
      
      <TabsContent value="generate">
        {/* Existing generation form */}
      </TabsContent>
      
      <TabsContent value="templates">
        <TemplateLibraryTab
          influencerId={influencerId}
          onTemplateApply={onTemplateApply}
        />
      </TabsContent>
    </Tabs>
  );
}
```

### File: `apps/web/components/studio/templates/template-library-tab.tsx`

```typescript
export function TemplateLibraryTab({
  influencerId,
  onTemplateApply,
}: TemplateLibraryTabProps) {
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch templates with filters
  useEffect(() => {
    fetchTemplates();
  }, [filters, searchQuery, influencerId]);
  
  const handleTemplateClick = (templateId: string) => {
    // Open detail modal
  };
  
  return (
    <div className="flex flex-col gap-4">
      <TemplateSearch
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
      
      <div className="flex gap-4">
        <TemplateFilters
          filters={filters}
          onFiltersChange={setFilters}
          influencerId={influencerId}
        />
        
        <TemplateGrid
          templates={templates}
          isLoading={isLoading}
          onTemplateClick={handleTemplateClick}
          onTemplateApply={onTemplateApply}
        />
      </div>
    </div>
  );
}
```

### File: `apps/web/components/studio/templates/template-card.tsx`

```typescript
export function TemplateCard({
  template,
  onApply,
  onViewDetails,
  showStats = false,
}: TemplateCardProps) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-[var(--bg-elevated)] hover:border-white/20 transition-colors">
      {/* Preview Image */}
      <div className="relative aspect-[9/16] bg-black/20">
        <img
          src={template.thumbnailUrl}
          alt={template.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onViewDetails(template.id)}
          className="absolute inset-0"
          aria-label={`View details for ${template.name}`}
        />
      </div>
      
      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="space-y-1">
          <div className="text-sm font-medium">Scene: {template.config.scene}</div>
          <div className="text-sm text-white/60">Environment: {template.config.environment}</div>
          <div className="text-sm text-white/60">Outfit: {template.config.outfit}</div>
        </div>
        
        {/* Metadata badges */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">{template.config.aspectRatio}</Badge>
          <Badge variant="outline">{template.config.qualityMode.toUpperCase()}</Badge>
          {template.config.modelId && (
            <Badge variant="outline">{template.config.modelId}</Badge>
          )}
        </div>
        
        {/* Stats (optional) */}
        {showStats && template.metadata.usageCount > 0 && (
          <div className="text-xs text-white/40">
            Used {template.metadata.usageCount} times
          </div>
        )}
        
        {/* Apply button */}
        <Button
          onClick={() => onApply(template.id)}
          className="w-full"
          size="sm"
        >
          Try Template
        </Button>
      </div>
    </div>
  );
}
```

---

## Analytics Mapping (UI)

### Template Discovery Events

- **Library opened**: `template_library_opened`
  - Properties: `influencer_id`, `source` ("studio" | "browse_page")
  - Trigger: User opens Templates tab

- **Template browsed**: `template_browsed`
  - Properties: `template_id`, `scene`, `environment`, `pose`, `style`
  - Trigger: User clicks template card (views details)

- **Template searched**: `template_searched`
  - Properties: `query`, `filters_applied` (object with filter keys)
  - Trigger: User types in search (debounced, after 300ms)

- **Template filtered**: `template_filtered`
  - Properties: `filter_type` ("scene" | "environment" | "aspect_ratio" | etc.), `filter_value`
  - Trigger: User applies filter

### Template Application Events

- **Template applied**: `template_applied`
  - Properties: `template_id`, `influencer_id`, `source` ("card" | "modal")
  - Trigger: User clicks "Try Template" or "Use This Template"

- **Template used**: `template_used`
  - Properties: `template_id`, `job_id`, `modified` (boolean - did user change settings?)
  - Trigger: Generation starts with template applied

### Template Creation Events

- **Template saved**: `template_saved`
  - Properties: `template_id`, `source_job_id`, `source_image_id`, `is_public`
  - Trigger: User saves template after generation or from gallery

### Page Navigation Events

- **Template page visited**: `template_page_visited`
  - Properties: `source` ("nav_link" | "onboarding" | "direct" | "studio_link")
  - Trigger: User navigates to `/templates`

---

## Accessibility Notes

### Tabs

- **ARIA**: `role="tablist"`, `role="tab"`, `role="tabpanel"`
- **Keyboard**: Arrow keys to navigate tabs
- **Focus**: Focus trap within active tab panel

### Template Cards

- **Images**: `alt` text with template name and key settings
- **Buttons**: Clear labels ("Try Template", "View Details")
- **Keyboard**: Tab navigation, Enter/Space to activate

### Filters

- **Labels**: All filter controls have visible labels
- **Keyboard**: Tab navigation, Enter to apply
- **Screen readers**: Announce filter changes

### Search

- **Input**: `aria-label` "Search templates"
- **Clear button**: `aria-label` "Clear search"
- **Results**: Announce result count when search completes

### Modal

- **Focus trap**: Focus stays within modal
- **Escape key**: Closes modal
- **Backdrop click**: Closes modal
- **ARIA**: `aria-labelledby`, `aria-describedby`

---

## Mobile Considerations

### Content Studio Tabs

- **Mobile**: Tabs scroll horizontally if needed
- **Touch targets**: Min 44px height
- **Template grid**: 1 column on mobile, 2-3 on tablet, 3-4 on desktop

### Template Browsing Page

- **Hero**: Full width, search bar prominent
- **Filters**: Collapsible sidebar on mobile, always visible on desktop
- **Grid**: Responsive (1/2/3/4 columns)
- **Modal**: Full screen on mobile, centered on desktop

### Template Cards

- **Mobile**: Full width minus padding
- **Preview image**: Maintain aspect ratio
- **Touch targets**: Buttons min 44px height

---

## Error Handling (UI)

### Template Load Failure

**Display:**
```
⚠️ Failed to load templates
Please try again or contact support.
[Retry Button]
```

**Behavior:**
- Show error message
- Retry button reloads templates
- Fallback: User can still use generation form

### Template Apply Failure

**Display:**
```
❌ Failed to apply template
[Error message from API]
You can still configure settings manually.
```

**Behavior:**
- Show error toast
- User can continue with manual configuration
- Log error for debugging

### Template Save Failure

**Display:**
```
❌ Failed to save template
[Error message from API]
Please try again.
```

**Behavior:**
- Re-enable form
- Allow retry
- Keep form data

### No Templates Found

**Display:**
```
No templates found
Try adjusting your filters or search query.
```

**Behavior:**
- Show empty state message
- Suggest clearing filters
- Show "Browse All Templates" link

---

## Loading States

### Template Grid (Loading)

- **Skeleton cards**: 6-8 placeholder cards
- **Animation**: Pulse animation
- **Filters**: Disabled

### Template Grid (Empty)

- **Icon**: Empty state icon
- **Message**: "No templates found"
- **Action**: "Clear filters" or "Browse all"

### Template Application (Loading)

- **Button**: Loading spinner
- **Form**: Disabled
- **Toast**: "Applying template..."

### Template Save (Loading)

- **Form**: Disabled
- **Button**: "Saving..." with spinner
- **Cancel**: Disabled

---

## Success States

### Template Applied

- **Toast**: "Template applied successfully" (2s auto-dismiss)
- **Visual**: Form fields highlight with template values
- **Tab**: Switch to "Generate" tab automatically

### Template Saved

- **Toast**: "Template saved successfully" (2s auto-dismiss)
- **Dialog**: Auto-closes after 2s
- **Update**: Template appears in "My Templates" section

---

## Integration Points

### Content Studio Page

**File**: `apps/web/app/influencer/[id]/studio/page.tsx`

**Changes:**
- Wrap generation form in `TemplateTabs` component
- Handle template application: load config into `GenerationSettings`
- Handle template query param: `?template=:id` applies template on load

### Generation Settings State

**File**: `apps/web/components/studio/generation/types.ts` (or wherever settings state is)

**Changes:**
- Add method: `applyTemplateConfig(template: Template)`
- Update all selectors with template config values
- Track if template was applied: `appliedTemplateId?: string`

### Image Gallery

**File**: `apps/web/components/gallery/` (wherever image actions are)

**Changes:**
- Add "Save as Template" action to image context menu
- Extract config from image metadata
- Open `SaveTemplateDialog` with image data

### tRPC Client

**File**: `apps/web/lib/trpc/` (wherever tRPC is set up)

**Usage:**
```typescript
// Get templates
const { data: templates } = trpc.templates.list.useQuery({ filters });

// Get template by ID
const { data: template } = trpc.templates.getById.useQuery({ id });

// Apply template (returns config)
const applyTemplate = trpc.templates.apply.useMutation();

// Save template
const saveTemplate = trpc.templates.create.useMutation();

// Track usage
const trackUsage = trpc.templates.trackUsage.useMutation();
```

---

## Design Tokens

### Colors

- **Template card border**: `border-white/10` (default), `border-white/20` (hover)
- **Badge**: `bg-white/10`, `text-white/80`
- **Success**: Green (`var(--green-500)`)
- **Error**: Red (`var(--red-500)`)

### Spacing

- **Template grid gap**: `gap-4` (16px)
- **Card padding**: `p-4` (16px)
- **Filter sidebar width**: `w-64` (256px) on desktop

### Typography

- **Template name**: `text-sm font-medium` (14px, medium)
- **Template metadata**: `text-sm text-white/60` (14px, gray)
- **Stats**: `text-xs text-white/40` (12px, lighter gray)

---

## Next Steps (P5)

- File plan (exact file locations in apps/web, apps/api, libs/)
- Component imports and dependencies
- Task breakdown (TSK-XXX for each story)
- Implementation order (prerequisites first)
- API endpoint implementation details
- Database migration scripts

