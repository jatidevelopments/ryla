# Documentation Reorganization Proposal

## Current Issues

### 1. Root-Level Files
- `NAMING_CONVENTIONS.md` - Should be in `process/` or `technical/guides/`
- `studio-tooltips-analysis.md` - Should be in `requirements/` or `technical/`
- `STRUCTURE.md` - Should stay at root (this is the index)

### 2. Ops Directory (83 files)
- Many status/summary files that could be consolidated:
  - `DEPLOYMENT-*.md` (15+ files) - Should be in `ops/deployment/status/` or archived
  - `SETUP-*.md` (10+ files) - Should be in `ops/setup/status/` or archived
  - `WHAT-I-*.md` - Should be in `ops/status/` or archived
- Active guides mixed with status files
- Need clear separation: active guides vs historical status

### 3. Technical Directory
- Root-level files that should be organized:
  - `CURSOR-RULES*.md` - Should be in `technical/guides/`
  - `FILE-ORGANIZATION-GUIDE.md` - Should be in `technical/guides/`
  - `DNA-IMPLEMENTATION-PLAN.md` - Should be in `technical/systems/`
  - `HUMAN-DESCRIPTION-SYSTEM.md` - Should be in `technical/systems/`
  - `PLATFORM-*.md` - Should be in `technical/systems/`
  - `QUALITY-MODE-REMOVAL.md` - Should be in `technical/refactoring/`
  - `WIZARD-DEFERRED-CREDITS.md` - Should be in `technical/systems/`
  - `STUDIO-UX-ANALYSIS.md` - Should be in `requirements/` or `technical/`
  - `MCP-YOUTUBE-TROUBLESHOOTING.md` - Should be in `technical/integrations/`
  - `PRE-COMMIT-HOOKS.md` - Should be in `technical/guides/`
  - `ATOMIC-LIB-BUILDS.md` - Should be in `technical/guides/`
  - `BROWSER-COMPATIBILITY*.md` - Should be in `technical/guides/`
- `prompts/` subdirectory should be moved to `research/prompts/` (already exists)

### 4. Research Directory
- Root-level files that could be better organized:
  - `AI-IDE-*.md` - Should be in `research/learnings/`
  - `CURSOR-*.md` - Should be in `research/learnings/`
  - `LOBECHAT-*.md` - Should be in `research/learnings/`
  - `RULES-TO-ADOPT-*.md` - Should be in `research/learnings/`
- `ai-influencer-course/` - Should be in `research/learnings/` or `research/competitors/`

### 5. Architecture Rule Outdated
- `.cursor/rules/architecture.mdc` has minimal docs structure
- Should reference full structure from `docs/STRUCTURE.md`

## Proposed Structure

```
docs/
├── README.md                    # Main docs index
├── STRUCTURE.md                 # Detailed structure guide (keep at root)
│
├── requirements/                # Product requirements
│   ├── epics/                  # Epic requirements
│   │   ├── mvp/               # EP-001, EP-002, EP-004, EP-005, EP-007, EP-008
│   │   ├── funnel/            # EP-003 (Payment)
│   │   ├── landing/           # EP-006 (Landing Page)
│   │   ├── admin/             # Admin epics
│   │   ├── ops/               # Operations epics
│   │   └── future/            # Phase 2+ planned epics
│   ├── MVP-SCOPE.md
│   ├── PRODUCT-HYPOTHESIS.md
│   ├── ICP-PERSONAS.md
│   └── studio-tooltips-analysis.md  # Moved from root
│
├── architecture/                # System architecture
│   ├── general/               # General architecture docs
│   └── epics/                 # Epic-specific architecture
│
├── specs/                      # Technical specifications
│   ├── general/               # General specs
│   ├── epics/                 # Epic-specific specs
│   └── integrations/          # Integration specs
│
├── technical/                  # Implementation guides
│   ├── guides/                # General guides
│   │   ├── cursor-rules/     # Cursor rules docs (moved from root)
│   │   ├── file-organization.md
│   │   ├── browser-compatibility.md
│   │   ├── atomic-lib-builds.md
│   │   └── pre-commit-hooks.md
│   ├── systems/               # System design docs
│   │   ├── dna-implementation.md
│   │   ├── human-description-system.md
│   │   ├── platform-aspect-ratio-mapping.md
│   │   ├── platform-export-implementation.md
│   │   └── wizard-deferred-credits.md
│   ├── models/                # Model technical docs
│   ├── infrastructure/        # Infrastructure & deployment
│   │   ├── runpod/
│   │   ├── comfyui/
│   │   └── deployment/
│   ├── integrations/          # Integration guides
│   │   └── mcp-youtube-troubleshooting.md
│   ├── refactoring/           # Refactoring docs
│   │   └── quality-mode-removal.md
│   ├── mobile/                # Mobile-specific docs
│   └── mdc/                   # MDC copy guides
│
├── ops/                        # Operations & deployment
│   ├── deployment/            # Deployment guides
│   │   ├── guides/           # Active deployment guides
│   │   └── status/           # Historical status files (archive)
│   ├── setup/                 # Setup guides
│   │   ├── guides/           # Active setup guides
│   │   └── status/           # Historical status files (archive)
│   ├── runpod/                # RunPod operations
│   ├── ghcr/                  # Container registry
│   ├── workflows/             # Workflow conversion
│   ├── status/                # General status files (archive)
│   └── README.md              # Ops index
│
├── analytics/                  # Analytics tracking
│
├── decisions/                  # Architecture decision records
│
├── initiatives/                # Business initiatives
│
├── journeys/                   # User journeys
│
├── marketing/                   # Marketing strategies
│
├── process/                     # Process documentation
│   ├── naming-conventions.md   # Moved from root
│   └── ...
│
├── planning/                    # Planning documents
│
├── releases/                    # Release documentation
│
├── research/                    # Market & technical research
│   ├── competitors/
│   ├── models/
│   ├── providers/
│   ├── workflows/
│   ├── techniques/
│   ├── prompts/
│   ├── learnings/              # Research learnings
│   │   ├── ai-ide-*.md
│   │   ├── cursor-*.md
│   │   ├── lobechat-*.md
│   │   └── rules-to-adopt-*.md
│   ├── infrastructure/
│   ├── legal_references/
│   ├── ai-influencer-course/   # Moved from root
│   ├── recordings/
│   ├── screenshots/
│   └── youtube-videos/
│
├── testing/                     # Testing documentation
│
└── templates/                   # Documentation templates
```

## Migration Plan

### Phase 1: Root-Level Files
1. Move `NAMING_CONVENTIONS.md` → `process/naming-conventions.md`
2. Move `studio-tooltips-analysis.md` → `requirements/studio-tooltips-analysis.md`
3. Keep `STRUCTURE.md` at root (update it with new structure)

### Phase 2: Technical Directory
1. Move Cursor rules docs → `technical/guides/cursor-rules/`
2. Move other root-level files to appropriate subdirectories
3. Move `prompts/` → `research/prompts/` (merge with existing)

### Phase 3: Ops Directory
1. Create `ops/deployment/guides/` and `ops/deployment/status/`
2. Create `ops/setup/guides/` and `ops/setup/status/`
3. Create `ops/status/` for general status files
4. Move active guides to `guides/`, status files to `status/`
5. Update `ops/README.md` with new structure

### Phase 4: Research Directory
1. Move root-level learning files → `research/learnings/`
2. Move `ai-influencer-course/` → `research/learnings/ai-influencer-course/`

### Phase 5: Update Cursor Rules
1. Update `architecture.mdc` with full docs structure
2. Create/update `docs-organization.mdc` rule (if needed)
3. Update any rules that reference docs paths

## Benefits

1. **Clearer Organization**: Related documents grouped logically
2. **Easier Discovery**: Topic-based structure makes finding docs easier
3. **Better Scalability**: Structure supports growth without clutter
4. **Separation of Concerns**: Active guides vs historical status files
5. **Consistent Patterns**: Similar organization across all folders
6. **Updated Rules**: Cursor rules reflect actual structure

## Implementation Notes

- **Backward Compatibility**: Update all internal links after moving files
- **Git History**: Use `git mv` to preserve history
- **Search & Replace**: Update all references in code/docs after migration
- **Documentation**: Update `STRUCTURE.md` and cursor rules after migration

## Next Steps

1. Review and approve this proposal
2. Execute migration phase by phase
3. Update all internal references
4. Update cursor rules
5. Verify all links work
