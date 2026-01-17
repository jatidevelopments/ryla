# EP-039 (P3) — ComfyUI Dependency Management: Architecture

Working in **PHASE P3 (Architecture + API)** on **EP-039, ST-040-ST-046**.

## Goal

Ship an automated dependency management system that:
- Analyzes all ComfyUI workflows to extract dependencies
- Discovers and verifies versions from external APIs (Manager, GitHub, HuggingFace)
- Generates install scripts and Dockerfiles automatically
- Ensures reproducible builds with version pinning
- Integrates into CI/CD for automatic updates

---

## Architecture (Layers)

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCRIPTS LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/setup/                                           │  │
│  │  ├── comfyui-dependency-resolver.ts  (F1: Analyzer)      │  │
│  │  ├── version-discovery.ts            (F2: Discovery)      │  │
│  │  ├── version-verification.ts         (F3: Verification)   │  │
│  │  ├── node-package-mapper.ts          (F4: Registry)       │  │
│  │  ├── model-registry.ts               (F4: Registry)       │  │
│  │  ├── generate-install-script.ts      (F5: Script Gen)      │  │
│  │  ├── generate-dockerfile.ts           (F6: Docker Gen)     │  │
│  │  └── comfyui-registry.ts             (F4: Centralized)    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRY LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/setup/comfyui-registry.ts                        │  │
│  │  - COMFYUI_NODE_REGISTRY (NodeInstallSource[])            │  │
│  │  - COMFYUI_MODEL_REGISTRY (ModelSource[])                 │  │
│  │  - Type definitions (NodeInstallSource, ModelSource)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATED LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/generated/                                       │  │
│  │  ├── install-all-models.sh        (F5: Pod script)        │  │
│  │  ├── Dockerfile.comfyui-worker    (F6: Serverless)        │  │
│  │  └── dependencies.json             (F1: Report)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CI/CD LAYER                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  .github/workflows/                                       │  │
│  │  ├── regenerate-dependencies.yml  (F7: Auto-regenerate)   │  │
│  │  └── verify-registry.yml         (F7: Pre-commit)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**1. Dependency Analysis Flow:**
```
Workflow Files (libs/business/src/workflows/*.ts)
    ↓
Dependency Analyzer (comfyui-dependency-resolver.ts)
    ↓
Dependency Report (dependencies.json)
    ↓
Registry Update (if new dependencies found)
```

**2. Version Discovery Flow:**
```
Registry (comfyui-registry.ts)
    ↓
Version Discovery (version-discovery.ts)
    ├── Manager API → Manager node versions
    ├── GitHub API → GitHub node versions
    └── HuggingFace API → Model commit hashes
    ↓
Version Verification (version-verification.ts)
    ↓
Registry Update (with verified versions)
```

**3. Script Generation Flow:**
```
Registry (with verified versions)
    ↓
Script Generator (generate-install-script.ts)
    ↓
Install Script (install-all-models.sh)
    ↓
Dockerfile Generator (generate-dockerfile.ts)
    ↓
Dockerfile (Dockerfile.comfyui-worker)
```

**4. CI/CD Flow:**
```
Workflow File Change (git push)
    ↓
GitHub Actions (regenerate-dependencies.yml)
    ↓
Run Analyzer → Discovery → Verification → Generation
    ↓
Commit Generated Files (or create PR)
```

---

## Data Model

### Registry Data Structures

#### `NodeInstallSource` (TypeScript Interface)

```typescript
interface NodeInstallSource {
  // Method 1: ComfyUI Manager (preferred)
  managerPackage?: string;  // e.g., "res4lyf", "controlaltai-nodes"
  expectedVersion?: string; // "latest" or specific version
  
  // Method 2: GitHub direct (for nodes not in Manager)
  gitRepo?: {
    url: string;           // e.g., "https://github.com/cubiq/ComfyUI_PuLID.git"
    version?: string;      // Git tag/commit hash for version pinning
    branch?: string;       // Default branch if no version
  };
  
  // Verification metadata
  verified?: boolean;
  lastVerified?: string;  // ISO timestamp
  availableVersions?: string[]; // Auto-discovered versions
  error?: string;         // Error message if verification failed
}
```

#### `ModelSource` (TypeScript Interface)

```typescript
interface ModelSource {
  // HuggingFace source (primary)
  huggingface?: {
    repo: string;          // e.g., "huchenlei/PuLID"
    file: string;          // e.g., "pulid_flux_v0.9.1.safetensors"
    commit?: string;       // Commit hash for version pinning
    path: string;          // Local path: "models/pulid/"
  };
  
  // Direct URL source (fallback)
  directUrl?: {
    url: string;
    path: string;
  };
  
  // Verification metadata
  verified?: boolean;
  lastVerified?: string;  // ISO timestamp
  fileSize?: number;      // Bytes
  downloadUrl?: string;  // Full download URL with commit hash
  error?: string;         // Error message if verification failed
}
```

#### `DependencyReport` (Generated JSON)

```typescript
interface DependencyReport {
  generatedAt: string;  // ISO timestamp
  workflows: {
    id: string;         // Workflow ID (e.g., "z-image-danrisi")
    name: string;       // Human-readable name
    file: string;       // Source file path
    nodes: string[];    // Custom node class_types
    models: string[];   // Model filenames
  }[];
  uniqueNodes: string[];  // All unique custom nodes
  uniqueModels: string[];  // All unique models
  missingFromRegistry: {
    nodes: string[];
    models: string[];
  };
  verificationStatus: {
    nodes: {
      [nodeName: string]: {
        verified: boolean;
        version: string;
        availableVersions?: string[];
        error?: string;
      };
    };
    models: {
      [modelName: string]: {
        verified: boolean;
        commit: string;
        fileSize?: number;
        error?: string;
      };
    };
  };
}
```

### Registry File Structure

```typescript
// scripts/setup/comfyui-registry.ts

export const COMFYUI_NODE_REGISTRY: Record<string, NodeInstallSource> = {
  // Manager nodes
  'res4lyf': {
    managerPackage: 'res4lyf',
    expectedVersion: 'latest',
    verified: true,
    lastVerified: '2026-01-27T10:00:00Z',
  },
  'controlaltai-nodes': {
    managerPackage: 'controlaltai-nodes',
    expectedVersion: 'latest',
    verified: true,
    lastVerified: '2026-01-27T10:00:00Z',
  },
  
  // GitHub nodes
  'ComfyUI-PuLID': {
    gitRepo: {
      url: 'https://github.com/cubiq/ComfyUI_PuLID.git',
      version: 'v1.0.0',
      verified: true,
      availableVersions: ['v1.0.0', 'v0.9.1', 'main'],
    },
    lastVerified: '2026-01-27T10:00:00Z',
  },
  'ComfyUI-InstantID': {
    gitRepo: {
      url: 'https://github.com/cubiq/ComfyUI_InstantID.git',
      version: 'main', // Use latest from main branch
      verified: true,
    },
    lastVerified: '2026-01-27T10:00:00Z',
  },
  'LoadImageBase64': {
    gitRepo: {
      url: 'https://github.com/Extraltodeus/LoadImageBase64-ComfyUI.git',
      version: 'main',
      verified: true,
    },
    lastVerified: '2026-01-27T10:00:00Z',
  },
};

export const COMFYUI_MODEL_REGISTRY: Record<string, ModelSource> = {
  'pulid_flux_v0.9.1.safetensors': {
    huggingface: {
      repo: 'huchenlei/PuLID',
      file: 'pulid_flux_v0.9.1.safetensors',
      commit: 'abc123def456', // Auto-discovered commit hash
      path: 'models/pulid/',
      verified: true,
      fileSize: 1200000000,
      downloadUrl: 'https://huggingface.co/huchenlei/PuLID/resolve/abc123def456/pulid_flux_v0.9.1.safetensors',
    },
    lastVerified: '2026-01-27T10:00:00Z',
  },
  // ... more models
};
```

---

## API Contracts

### External APIs

#### 1. ComfyUI Manager Registry API

**Endpoint**: `https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json`

**Response Format** (expected):
```json
[
  {
    "package": "res4lyf",
    "version": "1.0.0",
    "repository": "https://github.com/...",
    "description": "..."
  }
]
```

**Usage**:
- Query for available Manager packages
- Verify package exists
- Get latest version (if available)

#### 2. GitHub API

**Endpoints**:
- Tags: `GET https://api.github.com/repos/{owner}/{repo}/tags`
- Commits: `GET https://api.github.com/repos/{owner}/{repo}/commits/{branch}`
- Rate Limit: 60 requests/hour (unauthenticated), 5000/hour (authenticated)

**Response Format**:
```json
// Tags
[
  {
    "name": "v1.0.0",
    "commit": {
      "sha": "abc123def456"
    }
  }
]

// Commits
{
  "sha": "abc123def456",
  "commit": {
    "message": "...",
    "author": {...}
  }
}
```

**Usage**:
- Fetch all git tags for version discovery
- Verify specific tag/commit exists
- Get latest commit hash from main branch

#### 3. HuggingFace API

**Endpoints**:
- Model Info: `GET https://huggingface.co/api/models/{repo}`
- File Tree: `GET https://huggingface.co/api/models/{repo}/tree/main`
- File Info: `GET https://huggingface.co/api/models/{repo}/resolve/main/{file}`

**Response Format**:
```json
// File Tree
[
  {
    "path": "pulid_flux_v0.9.1.safetensors",
    "oid": "abc123def456", // Commit hash
    "size": 1200000000,
    "type": "file"
  }
]
```

**Usage**:
- Get commit hash for specific file
- Verify file exists
- Get file size
- Generate download URL with commit hash

### Internal Interfaces

#### `DependencyAnalyzer` Interface

```typescript
interface DependencyAnalyzer {
  /**
   * Analyze all workflow files and extract dependencies
   */
  analyzeWorkflows(): Promise<DependencyReport>;
  
  /**
   * Extract dependencies from a single workflow file
   */
  analyzeWorkflowFile(filePath: string): Promise<{
    nodes: string[];
    models: string[];
  }>;
  
  /**
   * Map node class_type to package name
   */
  mapNodeToPackage(nodeType: string): string | null;
}
```

#### `VersionDiscovery` Interface

```typescript
interface VersionDiscovery {
  /**
   * Discover versions for ComfyUI Manager node
   */
  discoverManagerNodeVersions(packageName: string): Promise<{
    available: boolean;
    latestVersion?: string;
    allVersions?: string[];
  }>;
  
  /**
   * Discover versions for GitHub node
   */
  discoverGitHubNodeVersions(repoUrl: string): Promise<{
    tags: string[];
    latestCommit: string;
    verified: boolean;
  }>;
  
  /**
   * Discover commit hash for HuggingFace model
   */
  discoverHuggingFaceModelVersion(repo: string, file: string): Promise<{
    commit: string;
    fileSize: number;
    verified: boolean;
    downloadUrl: string;
  }>;
}
```

#### `VersionVerification` Interface

```typescript
interface VersionVerification {
  /**
   * Verify all versions in registry exist
   */
  verifyAllVersions(registry: Registry): Promise<VerificationReport>;
  
  /**
   * Verify a single node version
   */
  verifyNodeVersion(nodeName: string, source: NodeInstallSource): Promise<{
    verified: boolean;
    error?: string;
  }>;
  
  /**
   * Verify a single model version
   */
  verifyModelVersion(modelName: string, source: ModelSource): Promise<{
    verified: boolean;
    error?: string;
  }>;
}
```

#### `ScriptGenerator` Interface

```typescript
interface ScriptGenerator {
  /**
   * Generate pod install script
   */
  generateInstallScript(registry: Registry): Promise<string>; // Returns bash script
  
  /**
   * Generate serverless Dockerfile
   */
  generateDockerfile(registry: Registry): Promise<string>; // Returns Dockerfile content
}
```

---

## File Structure

### Scripts Directory

```
scripts/
├── setup/
│   ├── comfyui-dependency-resolver.ts    # F1: Main analyzer
│   ├── version-discovery.ts              # F2: Version discovery
│   ├── version-verification.ts           # F3: Version verification
│   ├── node-package-mapper.ts            # Maps node types → packages
│   ├── model-registry.ts                 # Model definitions
│   ├── generate-install-script.ts        # F5: Script generator
│   ├── generate-dockerfile.ts            # F6: Dockerfile generator
│   └── comfyui-registry.ts               # F4: Centralized registry
│
├── generated/                            # Auto-generated (git-ignored or committed)
│   ├── install-all-models.sh             # F5: Pod install script
│   ├── Dockerfile.comfyui-worker         # F6: Serverless Dockerfile
│   └── dependencies.json                  # F1: Dependency report
│
└── utils/                                 # Shared utilities
    ├── api-client.ts                      # HTTP client for external APIs
    ├── cache.ts                           # Version discovery cache
    └── logger.ts                          # Logging utilities
```

### CI/CD Workflows

```
.github/
└── workflows/
    ├── regenerate-dependencies.yml        # F7: Auto-regenerate on workflow changes
    └── verify-registry.yml                # F7: Pre-commit verification
```

---

## Component Architecture

### Script Modules

#### 1. Dependency Analyzer (`comfyui-dependency-resolver.ts`)

**Responsibilities**:
- Parse TypeScript workflow files
- Extract `class_type` values (custom nodes)
- Extract model filenames
- Generate dependency report

**Dependencies**:
- TypeScript compiler API (`typescript`)
- File system access (`fs`)
- Workflow registry (`libs/business/src/workflows/registry.ts`)

#### 2. Version Discovery (`version-discovery.ts`)

**Responsibilities**:
- Query ComfyUI Manager API
- Query GitHub API for tags/commits
- Query HuggingFace API for model commits
- Cache results

**Dependencies**:
- HTTP client (`node-fetch` or `axios`)
- Cache storage (file system or memory)

#### 3. Version Verification (`version-verification.ts`)

**Responsibilities**:
- Verify git tags/commits exist
- Verify HuggingFace files exist
- Verify Manager packages available
- Generate verification report

**Dependencies**:
- Version Discovery module
- Registry module

#### 4. Script Generators

**Install Script Generator** (`generate-install-script.ts`):
- Generates bash script for pod setup
- Downloads models to network volume
- Installs custom nodes
- Includes verification checks

**Dockerfile Generator** (`generate-dockerfile.ts`):
- Generates Dockerfile for serverless
- Installs custom nodes
- Uses versioned sources
- Includes model symlink setup

---

## Error Handling

### API Failures

- **ComfyUI Manager API**: Fallback to cached registry, log warning
- **GitHub API**: Retry with exponential backoff, use cached tags
- **HuggingFace API**: Retry with exponential backoff, use cached commits

### Version Verification Failures

- **Invalid Git Tag**: Log error, suggest alternative versions
- **Invalid Commit Hash**: Log error, use latest commit
- **Missing HuggingFace File**: Log error, mark as unverified

### Script Generation Failures

- **Missing Registry Entry**: Log error, skip dependency
- **Invalid Version**: Use fallback version or skip
- **Generation Error**: Log error, return partial script

---

## Environment Variables

```bash
# Optional: GitHub API token for higher rate limits
GITHUB_TOKEN=

# Optional: HuggingFace token (if needed for private repos)
HUGGINGFACE_TOKEN=

# Registry cache directory
REGISTRY_CACHE_DIR=./scripts/generated/.cache

# Generated files directory
GENERATED_DIR=./scripts/generated
```

---

## Dependencies

### Runtime Dependencies

- `typescript` - For parsing TypeScript workflow files
- `node-fetch` or `axios` - For HTTP requests to external APIs
- `fs-extra` - For file system operations

### Development Dependencies

- `@types/node` - TypeScript types for Node.js
- `ts-node` - For running TypeScript scripts directly

---

## Security Considerations

1. **API Rate Limits**: Implement caching and rate limiting for external APIs
2. **GitHub Token**: Use environment variable, never commit to repo
3. **HuggingFace Token**: Use environment variable if needed
4. **Generated Scripts**: Validate before execution, sanitize inputs
5. **Dockerfile**: Validate generated Dockerfile before building

---

## Performance Considerations

1. **Caching**: Cache API responses for 24 hours
2. **Parallel Requests**: Fetch versions in parallel where possible
3. **Incremental Analysis**: Only analyze changed workflow files
4. **Lazy Loading**: Load registry only when needed

---

## Testing Strategy

### Unit Tests

- Dependency analyzer: Test workflow parsing
- Version discovery: Mock API responses
- Version verification: Test verification logic
- Script generators: Test script generation

### Integration Tests

- End-to-end: Run analyzer → discovery → verification → generation
- API integration: Test with real APIs (with rate limiting)
- Script execution: Test generated scripts on clean pod

### E2E Tests

- Full pipeline: Workflow change → CI/CD → Generated scripts
- Dockerfile build: Test generated Dockerfile builds successfully
- Pod setup: Test install script on clean RunPod pod

---

## Next Steps (P5: Technical Spec)

1. Detailed file plan with exact file paths
2. Task breakdown (TSK-XXX tasks)
3. Implementation order
4. Dependencies between tasks

---

**Status**: ✅ P3 Complete  
**Last Updated**: 2026-01-27
