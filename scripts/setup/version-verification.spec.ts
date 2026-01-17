import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VersionVerification } from './version-verification';
import { VersionDiscovery } from './version-discovery';
import { RegistryFile } from './types';
import { MockApiClient } from './__test-utils__/mock-api-client';
import { MockCache } from './__test-utils__/mock-cache';
import { MockLogger } from './__test-utils__/mock-logger';

// Mock dependencies
vi.mock('./version-discovery');
vi.mock('../utils/cache');
vi.mock('../utils/api-client');
vi.mock('../utils/logger');

describe('version-verification', () => {
  let verification: VersionVerification;
  let mockDiscovery: VersionDiscovery;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDiscovery = new VersionDiscovery();
    verification = new VersionVerification(mockDiscovery);
  });

  describe('verifyAllVersions', () => {
    it('should verify Manager nodes', async () => {
      const registry: RegistryFile = {
        nodes: {
          'res4lyf': {
            managerPackage: 'res4lyf',
            expectedVersion: '1.0.0',
            verified: false,
          },
        },
        models: {},
      };

      vi.spyOn(mockDiscovery, 'discoverManagerNodeVersions').mockResolvedValue({
        available: true,
        latestVersion: '1.0.0',
        allVersions: ['1.0.0', '0.9.0'],
      });

      const result = await verification.verifyAllVersions(registry);

      expect(result.nodes['res4lyf']?.verified).toBe(true);
      expect(result.nodes['res4lyf']?.version).toBe('1.0.0');
    });

    it('should verify GitHub nodes', async () => {
      const registry: RegistryFile = {
        nodes: {
          'ComfyUI_PuLID': {
            gitRepo: {
              url: 'https://github.com/cubiq/ComfyUI_PuLID.git',
              version: 'v1.0.0',
            },
            verified: false,
          },
        },
        models: {},
      };

      vi.spyOn(mockDiscovery, 'discoverGitHubNodeVersions').mockResolvedValue({
        verified: true,
        tags: ['v1.0.0', 'v0.9.0'],
        latestCommit: 'abc123',
      });

      const result = await verification.verifyAllVersions(registry);

      expect(result.nodes['ComfyUI_PuLID']?.verified).toBe(true);
      expect(result.nodes['ComfyUI_PuLID']?.version).toBe('v1.0.0');
    });

    it('should verify HuggingFace models', async () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'flux1-dev-fp8.safetensors': {
            huggingface: {
              repo: 'black-forest-labs/FLUX.1-dev',
              file: 'flux1-dev-fp8.safetensors',
              commit: 'abc123',
            },
            verified: false,
          },
        },
      };

      vi.spyOn(mockDiscovery, 'discoverHuggingFaceModelVersion').mockResolvedValue({
        verified: true,
        commit: 'abc123',
        fileSize: 1234567890,
        downloadUrl: 'https://huggingface.co/...',
      });

      const result = await verification.verifyAllVersions(registry);

      expect(result.models['flux1-dev-fp8.safetensors']?.verified).toBe(true);
      expect(result.models['flux1-dev-fp8.safetensors']?.commit).toBe('abc123');
    });

    it('should mark direct URL models as verified', async () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'model.safetensors': {
            directUrl: {
              url: 'https://example.com/model.safetensors',
              path: 'checkpoints',
            },
            verified: false,
          },
        },
      };

      const result = await verification.verifyAllVersions(registry);

      expect(result.models['model.safetensors']?.verified).toBe(true);
      expect(result.models['model.safetensors']?.commit).toBe('direct');
    });

    it('should mark nodes without install source as unverified', async () => {
      const registry: RegistryFile = {
        nodes: {
          'unknown-node': {
            verified: false,
          },
        },
        models: {},
      };

      const result = await verification.verifyAllVersions(registry);

      expect(result.nodes['unknown-node']?.verified).toBe(false);
      expect(result.nodes['unknown-node']?.error).toBe('No install source defined');
    });

    it('should mark models without source as unverified', async () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'unknown-model': {
            verified: false,
          },
        },
      };

      const result = await verification.verifyAllVersions(registry);

      expect(result.models['unknown-model']?.verified).toBe(false);
      expect(result.models['unknown-model']?.error).toBe('No source defined');
    });

    it('should handle mixed registry entries', async () => {
      const registry: RegistryFile = {
        nodes: {
          'manager-node': {
            managerPackage: 'manager-node',
            verified: false,
          },
          'git-node': {
            gitRepo: {
              url: 'https://github.com/user/repo.git',
              version: 'v1.0.0',
            },
            verified: false,
          },
        },
        models: {
          'hf-model': {
            huggingface: {
              repo: 'user/repo',
              file: 'model.safetensors',
            },
            verified: false,
          },
          'direct-model': {
            directUrl: {
              url: 'https://example.com/model.safetensors',
            },
            verified: false,
          },
        },
      };

      vi.spyOn(mockDiscovery, 'discoverManagerNodeVersions').mockResolvedValue({
        available: true,
        latestVersion: '1.0.0',
        allVersions: ['1.0.0'],
      });
      vi.spyOn(mockDiscovery, 'discoverGitHubNodeVersions').mockResolvedValue({
        verified: true,
        tags: ['v1.0.0'],
        latestCommit: 'abc123',
      });
      vi.spyOn(mockDiscovery, 'discoverHuggingFaceModelVersion').mockResolvedValue({
        verified: true,
        commit: 'abc123',
        fileSize: 1234567890,
        downloadUrl: 'https://...',
      });

      const result = await verification.verifyAllVersions(registry);

      expect(result.nodes['manager-node']?.verified).toBe(true);
      expect(result.nodes['git-node']?.verified).toBe(true);
      expect(result.models['hf-model']?.verified).toBe(true);
      expect(result.models['direct-model']?.verified).toBe(true);
    });
  });

  describe('assertAllVerified', () => {
    it('should not throw when all verified', () => {
      const status = {
        nodes: {
          'node1': { verified: true, version: '1.0.0' },
        },
        models: {
          'model1': { verified: true, commit: 'abc123' },
        },
      };

      expect(() => verification.assertAllVerified(status)).not.toThrow();
    });

    it('should throw when nodes are unverified', () => {
      const status = {
        nodes: {
          'node1': { verified: false, version: '1.0.0', error: 'Not found' },
        },
        models: {},
      };

      expect(() => verification.assertAllVerified(status)).toThrow('Dependency verification failed');
    });

    it('should throw when models are unverified', () => {
      const status = {
        nodes: {},
        models: {
          'model1': { verified: false, commit: 'unknown', error: 'Not found' },
        },
      };

      expect(() => verification.assertAllVerified(status)).toThrow('Dependency verification failed');
    });
  });
});
