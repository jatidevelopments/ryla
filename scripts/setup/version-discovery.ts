import { Cache } from '../utils/cache';
import { ApiClient } from '../utils/api-client';
import { Logger } from '../utils/logger';
import { ModelSource, NodeInstallSource, RegistryFile } from './types';

const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const DEFAULT_MANAGER_REGISTRY_URL =
  'https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json';

const GITHUB_API_BASE = 'https://api.github.com';
const HUGGINGFACE_API_BASE = 'https://huggingface.co/api';

interface ManagerRegistryEntry {
  package?: string;
  name?: string;
  version?: string;
  versions?: string[];
}

function normalizeManagerRegistry(
  registry: unknown
): ManagerRegistryEntry[] {
  if (Array.isArray(registry)) {
    return registry as ManagerRegistryEntry[];
  }

  if (registry && typeof registry === 'object') {
    const values = Object.values(registry as Record<string, unknown>);
    const entries = values.filter((value) => typeof value === 'object');
    return entries as ManagerRegistryEntry[];
  }

  return [];
}

interface GitHubTag {
  name: string;
}

interface HuggingFaceTreeEntry {
  path: string;
  oid?: string;
  size?: number;
  type?: string;
}

export class VersionDiscovery {
  private readonly cache: Cache;
  private readonly api: ApiClient;
  private readonly logger: Logger;

  constructor(cacheDir = process.env.REGISTRY_CACHE_DIR ?? './scripts/generated/.cache') {
    this.cache = new Cache(cacheDir);
    this.api = new ApiClient({}, new Logger('version-discovery'));
    this.logger = new Logger('version-discovery');
  }

  async discoverManagerNodeVersions(packageName: string) {
    const cacheKey = `manager-${packageName}`;
    const cached = await this.cache.get<ManagerRegistryEntry | null>(cacheKey);
    if (cached) {
      return {
        available: true,
        latestVersion: cached.version,
        allVersions: cached.versions ?? [],
      };
    }

    const registryUrl =
      process.env.COMFYUI_MANAGER_REGISTRY_URL ?? DEFAULT_MANAGER_REGISTRY_URL;
    let registryRaw: unknown;
    try {
      registryRaw = await this.api.get<unknown>(registryUrl, {
        headers: { 'User-Agent': 'ryla-comfyui-deps' },
      });
    } catch (error) {
      this.logger.warn(`Manager registry fetch failed: ${String(error)}`);
      return { available: false };
    }

    const registry = normalizeManagerRegistry(registryRaw);
    if (registry.length === 0) {
      this.logger.warn('Manager registry response is empty or invalid');
      return { available: false };
    }

    const entry =
      registry.find((item) => item.package === packageName) ??
      registry.find((item) => item.name === packageName);

    if (!entry) {
      return { available: false };
    }

    await this.cache.set(cacheKey, entry, DEFAULT_CACHE_TTL_MS);

    return {
      available: true,
      latestVersion: entry.version,
      allVersions: entry.versions ?? [],
    };
  }

  async discoverGitHubNodeVersions(repoUrl: string) {
    const cacheKey = `github-${repoUrl}`;
    const cached = await this.cache.get<{
      tags: string[];
      latestCommit: string;
    }>(cacheKey);
    if (cached) {
      return { ...cached, verified: true };
    }

    const match = repoUrl.match(/github.com\/([^/]+)\/([^/.]+)/);
    if (!match) {
      return { tags: [], latestCommit: '', verified: false };
    }

    const owner = match[1];
    const repo = match[2];

    const baseHeaders: Record<string, string> = {
      'User-Agent': 'ryla-comfyui-deps',
    };
    const headersWithAuth: Record<string, string> = { ...baseHeaders };
    if (process.env.GITHUB_TOKEN) {
      headersWithAuth.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const fetchWithHeaders = async (headers: Record<string, string>) => {
      const tags = await this.api.get<GitHubTag[]>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/tags`,
        { headers }
      );
      const latestCommit = await this.api.get<{ sha: string }>(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/main`,
        { headers }
      );
      return {
        tags: tags.map((tag) => tag.name),
        latestCommit: latestCommit.sha ?? '',
      };
    };

    let data;
    try {
      data = await fetchWithHeaders(headersWithAuth);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 && headersWithAuth.Authorization) {
        this.logger.warn('GitHub auth failed, retrying without token');
        try {
          data = await fetchWithHeaders(baseHeaders);
        } catch (retryError) {
          this.logger.warn(`GitHub discovery failed: ${String(retryError)}`);
          return { tags: [], latestCommit: '', verified: false };
        }
      } else {
        this.logger.warn(`GitHub discovery failed: ${String(error)}`);
        return { tags: [], latestCommit: '', verified: false };
      }
    }

    const result = {
      tags: data.tags,
      latestCommit: data.latestCommit,
      verified: true,
    };

    await this.cache.set(cacheKey, result, DEFAULT_CACHE_TTL_MS);

    return result;
  }

  async discoverHuggingFaceModelVersion(repo: string, file: string) {
    const cacheKey = `hf-${repo}-${file}`;
    const cached = await this.cache.get<{
      commit: string;
      fileSize: number;
      downloadUrl: string;
    }>(cacheKey);
    if (cached) {
      return { ...cached, verified: true };
    }

    const headers: Record<string, string> = {
      'User-Agent': 'ryla-comfyui-deps',
    };
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
    if (hfToken) {
      headers.Authorization = `Bearer ${hfToken}`;
    }

    let tree: HuggingFaceTreeEntry[];
    try {
      tree = await this.api.get<HuggingFaceTreeEntry[]>(
        `${HUGGINGFACE_API_BASE}/models/${repo}/tree/main`,
        { headers }
      );
    } catch (error) {
      this.logger.warn(`HuggingFace discovery failed: ${String(error)}`);
      return { commit: '', fileSize: 0, verified: false, downloadUrl: '' };
    }

    const entry = tree.find((item) => item.path === file);
    if (!entry || !entry.oid) {
      return { commit: '', fileSize: 0, verified: false, downloadUrl: '' };
    }

    const downloadUrl = `https://huggingface.co/${repo}/resolve/${entry.oid}/${file}`;
    const result = {
      commit: entry.oid,
      fileSize: entry.size ?? 0,
      verified: true,
      downloadUrl,
    };

    await this.cache.set(cacheKey, result, DEFAULT_CACHE_TTL_MS);

    return result;
  }

  async discoverAll(registry: RegistryFile): Promise<RegistryFile> {
    const updated: RegistryFile = {
      nodes: { ...registry.nodes },
      models: { ...registry.models },
    };

    for (const [key, node] of Object.entries(updated.nodes)) {
      if (node.managerPackage) {
        try {
          const discovery = await this.discoverManagerNodeVersions(
            node.managerPackage
          );
          node.verified = discovery.available;
          node.lastVerified = new Date().toISOString();
          node.availableVersions = discovery.allVersions;
          if (!node.expectedVersion) {
            node.expectedVersion = discovery.latestVersion ?? 'latest';
          }
        } catch (error) {
          this.logger.warn(`Manager discovery failed for ${key}`);
          node.verified = false;
          node.error = String(error);
        }
      }

      if (node.gitRepo?.url) {
        try {
          const discovery = await this.discoverGitHubNodeVersions(
            node.gitRepo.url
          );
          node.verified = discovery.verified;
          node.availableVersions = discovery.tags;
          node.lastVerified = new Date().toISOString();
          if (!node.gitRepo.version) {
            node.gitRepo.version = discovery.tags[0] ?? 'main';
          }
        } catch (error) {
          this.logger.warn(`GitHub discovery failed for ${key}`);
          node.verified = false;
          node.error = String(error);
        }
      }
    }

    for (const [key, model] of Object.entries(updated.models)) {
      if (model.huggingface) {
        try {
          const discovery = await this.discoverHuggingFaceModelVersion(
            model.huggingface.repo,
            model.huggingface.file
          );
          model.verified = discovery.verified;
          model.fileSize = discovery.fileSize;
          model.downloadUrl = discovery.downloadUrl;
          model.huggingface.commit = discovery.commit;
          model.lastVerified = new Date().toISOString();
        } catch (error) {
          this.logger.warn(`HuggingFace discovery failed for ${key}`);
          model.verified = false;
          model.error = String(error);
        }
      }
    }

    return updated;
  }
}

export function loadRegistry(): RegistryFile {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const registry = require('./comfyui-registry') as {
    COMFYUI_NODE_REGISTRY: Record<string, NodeInstallSource>;
    COMFYUI_MODEL_REGISTRY: Record<string, ModelSource>;
  };

  return {
    nodes: registry.COMFYUI_NODE_REGISTRY,
    models: registry.COMFYUI_MODEL_REGISTRY,
  };
}
