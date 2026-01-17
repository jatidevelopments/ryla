import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionDiscovery } from './version-discovery';
import { Cache } from '../utils/cache';
import { ApiClient } from '../utils/api-client';
import { Logger } from '../utils/logger';

// Mock dependencies
vi.mock('../utils/cache');
vi.mock('../utils/api-client');
vi.mock('../utils/logger');

describe('version-discovery', () => {
  let discovery: VersionDiscovery;
  let mockApi: { get: ReturnType<typeof vi.fn> };
  let mockCache: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn> };
  let mockLogger: { warn: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockApi = {
      get: vi.fn(),
    };
    mockCache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };
    mockLogger = {
      warn: vi.fn(),
    };

    // Mock the constructors
    vi.mocked(Cache).mockImplementation(function() {
      return mockCache as unknown as Cache;
    });
    vi.mocked(ApiClient).mockImplementation(function() {
      return mockApi as unknown as ApiClient;
    });
    vi.mocked(Logger).mockImplementation(function() {
      return mockLogger as unknown as Logger;
    });

    discovery = new VersionDiscovery();
  });

  describe('discoverManagerNodeVersions', () => {
    it('should return cached result when available', async () => {
      const cachedEntry = {
        package: 'res4lyf',
        version: '1.0.0',
        versions: ['1.0.0', '0.9.0'],
      };
      mockCache.get.mockResolvedValueOnce(cachedEntry);

      const result = await discovery.discoverManagerNodeVersions('res4lyf');

      expect(result.available).toBe(true);
      expect(result.latestVersion).toBe('1.0.0');
      expect(result.allVersions).toEqual(['1.0.0', '0.9.0']);
    });

    it('should fetch from Manager API when not cached', async () => {
      const registryResponse = [
        {
          package: 'res4lyf',
          version: '1.0.0',
          versions: ['1.0.0', '0.9.0'],
        },
      ];
      mockApi.get.mockResolvedValueOnce(registryResponse);

      const result = await discovery.discoverManagerNodeVersions('res4lyf');

      expect(result.available).toBe(true);
      expect(result.latestVersion).toBe('1.0.0');
      expect(result.allVersions).toEqual(['1.0.0', '0.9.0']);
    });

    it('should return unavailable when package not found', async () => {
      const registryResponse: unknown[] = [];
      mockApi.get.mockResolvedValueOnce(registryResponse);

      const result = await discovery.discoverManagerNodeVersions('unknown-package');

      expect(result.available).toBe(false);
    });

    it('should handle API failures gracefully', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await discovery.discoverManagerNodeVersions('res4lyf');

      expect(result.available).toBe(false);
    });
  });

  describe('discoverGitHubNodeVersions', () => {
    it('should return cached result when available', async () => {
      const cached = {
        tags: ['v1.0.0', 'v0.9.0'],
        latestCommit: 'abc123',
      };
      mockCache.get.mockResolvedValueOnce(cached);

      const result = await discovery.discoverGitHubNodeVersions(
        'https://github.com/user/repo.git'
      );

      expect(result.verified).toBe(true);
      expect(result.tags).toEqual(['v1.0.0', 'v0.9.0']);
      expect(result.latestCommit).toBe('abc123');
    });

    it('should fetch tags and commit from GitHub API', async () => {
      const tags = [{ name: 'v1.0.0' }, { name: 'v0.9.0' }];
      const commit = { sha: 'abc123' };

      mockApi.get
        .mockResolvedValueOnce(tags)
        .mockResolvedValueOnce(commit);

      const result = await discovery.discoverGitHubNodeVersions(
        'https://github.com/user/repo.git'
      );

      expect(result.verified).toBe(true);
      expect(result.tags).toEqual(['v1.0.0', 'v0.9.0']);
      expect(result.latestCommit).toBe('abc123');
    });

    it('should handle invalid repo URL', async () => {
      const result = await discovery.discoverGitHubNodeVersions('invalid-url');

      expect(result.verified).toBe(false);
      expect(result.tags).toEqual([]);
      expect(result.latestCommit).toBe('');
    });

    it('should handle API failures gracefully', async () => {
      const error = new Error('Network error') as Error & { response?: { status?: number } };
      error.response = { status: 500 };
      mockApi.get.mockRejectedValueOnce(error);

      const result = await discovery.discoverGitHubNodeVersions(
        'https://github.com/user/repo.git'
      );

      expect(result.verified).toBe(false);
    });
  });

  describe('discoverHuggingFaceModelVersion', () => {
    it('should return cached result when available', async () => {
      const cached = {
        commit: 'abc123',
        fileSize: 1234567890,
        downloadUrl: 'https://huggingface.co/repo/resolve/abc123/file.safetensors',
      };
      mockCache.get.mockResolvedValueOnce(cached);

      const result = await discovery.discoverHuggingFaceModelVersion('repo', 'file.safetensors');

      expect(result.verified).toBe(true);
      expect(result.commit).toBe('abc123');
      expect(result.fileSize).toBe(1234567890);
    });

    it('should fetch tree from HuggingFace API', async () => {
      const tree = [
        {
          path: 'file.safetensors',
          oid: 'abc123',
          size: 1234567890,
          type: 'blob',
        },
      ];
      mockApi.get.mockResolvedValueOnce(tree);

      const result = await discovery.discoverHuggingFaceModelVersion('repo', 'file.safetensors');

      expect(result.verified).toBe(true);
      expect(result.commit).toBe('abc123');
      expect(result.fileSize).toBe(1234567890);
    });

    it('should return unverified when file not found', async () => {
      const tree = [
        {
          path: 'other-file.safetensors',
          oid: 'def456',
          size: 987654321,
          type: 'blob',
        },
      ];
      mockApi.get.mockResolvedValueOnce(tree);

      const result = await discovery.discoverHuggingFaceModelVersion('repo', 'file.safetensors');

      expect(result.verified).toBe(false);
      expect(result.commit).toBe('');
      expect(result.fileSize).toBe(0);
    });

    it('should handle API failures gracefully', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await discovery.discoverHuggingFaceModelVersion('repo', 'file.safetensors');

      expect(result.verified).toBe(false);
    });
  });
});
