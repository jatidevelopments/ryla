import { describe, it, expect } from 'vitest';
import { generateInstallScript } from './generate-install-script';
import { RegistryFile } from './types';

describe('generate-install-script', () => {
  describe('generateInstallScript', () => {
    it('should generate script with Manager nodes', () => {
      const registry: RegistryFile = {
        nodes: {
          'res4lyf': {
            managerPackage: 'res4lyf',
            verified: true,
          },
          'controlaltai-nodes': {
            managerPackage: 'controlaltai-nodes',
            verified: true,
          },
        },
        models: {},
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('#!/bin/bash');
      expect(script).toContain('comfy-node-install res4lyf controlaltai-nodes');
      expect(script).toContain('COMFYUI_PATH');
      expect(script).toContain('MODELS_PATH');
    });

    it('should generate script with GitHub nodes', () => {
      const registry: RegistryFile = {
        nodes: {
          'ComfyUI_PuLID': {
            gitRepo: {
              url: 'https://github.com/cubiq/ComfyUI_PuLID.git',
              version: 'v1.0.0',
            },
            verified: true,
          },
        },
        models: {},
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID');
      expect(script).toContain('git checkout v1.0.0');
      expect(script).toContain('pip install -r requirements.txt');
    });

    it('should generate script with models', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'flux1-dev-fp8.safetensors': {
            huggingface: {
              repo: 'black-forest-labs/FLUX.1-dev',
              file: 'flux1-dev-fp8.safetensors',
              commit: 'abc123',
            },
            downloadUrl: 'https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/abc123/flux1-dev-fp8.safetensors',
            verified: true,
          },
        },
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('download_model');
      expect(script).toContain('flux1-dev-fp8.safetensors');
      expect(script).toContain('https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/abc123/flux1-dev-fp8.safetensors');
    });

    it('should handle empty registry gracefully', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {},
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('#!/bin/bash');
      expect(script).toContain('== RYLA ComfyUI Dependency Installer ==');
      expect(script).toContain('download_model()'); // Function definition is always included
      expect(script).not.toContain('comfy-node-install');
      expect(script).not.toContain('git clone');
      // download_model function is defined but not called when no models
      expect(script.split('download_model').length).toBe(2); // Only function definition, no calls
    });

    it('should use directUrl for models when available', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'model.safetensors': {
            directUrl: {
              url: 'https://example.com/model.safetensors',
              path: 'checkpoints',
            },
            verified: true,
          },
        },
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('https://example.com/model.safetensors');
      expect(script).toContain('checkpoints/model.safetensors');
    });

    it('should use downloadUrl when provided', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'model.safetensors': {
            downloadUrl: 'https://custom-url.com/model.safetensors',
            verified: true,
          },
        },
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('https://custom-url.com/model.safetensors');
    });

    it('should skip models without download URL', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {
          'model.safetensors': {
            verified: false,
          },
        },
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('⚠️ No download URL for model.safetensors. Skipping...');
    });

    it('should handle mixed node types', () => {
      const registry: RegistryFile = {
        nodes: {
          'manager-node': {
            managerPackage: 'manager-node',
            verified: true,
          },
          'git-node': {
            gitRepo: {
              url: 'https://github.com/user/repo.git',
              version: 'main',
            },
            verified: true,
          },
        },
        models: {
          'model.safetensors': {
            downloadUrl: 'https://example.com/model.safetensors',
            verified: true,
          },
        },
      };

      const script = generateInstallScript(registry);

      expect(script).toContain('comfy-node-install manager-node');
      expect(script).toContain('git clone https://github.com/user/repo.git');
      expect(script).toContain('download_model');
    });
  });
});
