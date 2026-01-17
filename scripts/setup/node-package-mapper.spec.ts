import { describe, it, expect } from 'vitest';
import { mapNodeToPackage, NODE_TO_PACKAGE_MAP } from './node-package-mapper';

describe('node-package-mapper', () => {
  describe('NODE_TO_PACKAGE_MAP', () => {
    it('should contain expected mappings', () => {
      expect(NODE_TO_PACKAGE_MAP).toBeDefined();
      expect(typeof NODE_TO_PACKAGE_MAP).toBe('object');
      expect(Object.keys(NODE_TO_PACKAGE_MAP).length).toBeGreaterThan(0);
    });

    it('should map known node types correctly', () => {
      expect(NODE_TO_PACKAGE_MAP['ETN_LoadImageBase64']).toBe('LoadImageBase64-ComfyUI');
      expect(NODE_TO_PACKAGE_MAP['ClownsharKSampler_Beta']).toBe('res4lyf');
      expect(NODE_TO_PACKAGE_MAP['FluxResolutionNode']).toBe('controlaltai-nodes');
    });
  });

  describe('mapNodeToPackage', () => {
    it('should return package name for known nodes', () => {
      expect(mapNodeToPackage('ETN_LoadImageBase64')).toBe('LoadImageBase64-ComfyUI');
      expect(mapNodeToPackage('ClownsharKSampler_Beta')).toBe('res4lyf');
      expect(mapNodeToPackage('FluxResolutionNode')).toBe('controlaltai-nodes');
    });

    it('should return null for unknown nodes', () => {
      expect(mapNodeToPackage('UnknownNodeType')).toBeNull();
      expect(mapNodeToPackage('NonExistentNode')).toBeNull();
    });

    it('should handle empty string', () => {
      expect(mapNodeToPackage('')).toBeNull();
    });

    it('should be case-sensitive', () => {
      expect(mapNodeToPackage('loadimagebase64-comfyui')).toBeNull();
      expect(mapNodeToPackage('RES4LYF')).toBeNull();
    });
  });
});
