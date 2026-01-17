import { describe, it, expect } from 'vitest';
import { generateDockerfile } from './generate-dockerfile';
import { RegistryFile } from './types';

describe('generate-dockerfile', () => {
  describe('generateDockerfile', () => {
    it('should generate Dockerfile with base image', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {},
      };

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('FROM runpod/worker-comfyui:5.6.0-base');
      expect(dockerfile).toContain('RYLA ComfyUI Serverless Worker');
    });

    it('should include Manager node installation', () => {
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

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('# Install ComfyUI Manager nodes');
      expect(dockerfile).toContain('RUN comfy-node-install res4lyf controlaltai-nodes');
    });

    it('should include GitHub node installation', () => {
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

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('# Install GitHub custom nodes');
      expect(dockerfile).toContain('git clone https://github.com/cubiq/ComfyUI_PuLID.git ComfyUI_PuLID');
      expect(dockerfile).toContain('git checkout v1.0.0');
      expect(dockerfile).toContain('pip install -r requirements.txt');
    });

    it('should use branch when version not specified', () => {
      const registry: RegistryFile = {
        nodes: {
          'ComfyUI_PuLID': {
            gitRepo: {
              url: 'https://github.com/cubiq/ComfyUI_PuLID.git',
              branch: 'main',
            },
            verified: true,
          },
        },
        models: {},
      };

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('git checkout main');
    });

    it('should include model linking startup script', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {},
      };

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('/startup-link-models.sh');
      expect(dockerfile).toContain('/entrypoint-wrapper.sh');
      expect(dockerfile).toContain('ENTRYPOINT ["/entrypoint-wrapper.sh"]');
    });

    it('should handle empty registry gracefully', () => {
      const registry: RegistryFile = {
        nodes: {},
        models: {},
      };

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('FROM runpod/worker-comfyui:5.6.0-base');
      expect(dockerfile).not.toContain('comfy-node-install');
      expect(dockerfile).not.toContain('git clone');
    });

    it('should handle multiple GitHub nodes', () => {
      const registry: RegistryFile = {
        nodes: {
          'ComfyUI_PuLID': {
            gitRepo: {
              url: 'https://github.com/cubiq/ComfyUI_PuLID.git',
              version: 'v1.0.0',
            },
            verified: true,
          },
          'ComfyUI_InstantID': {
            gitRepo: {
              url: 'https://github.com/cubiq/ComfyUI_InstantID.git',
              version: 'v2.0.0',
            },
            verified: true,
          },
        },
        models: {},
      };

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('ComfyUI_PuLID');
      expect(dockerfile).toContain('ComfyUI_InstantID');
      expect(dockerfile).toContain('v1.0.0');
      expect(dockerfile).toContain('v2.0.0');
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
        models: {},
      };

      const dockerfile = generateDockerfile(registry);

      expect(dockerfile).toContain('comfy-node-install manager-node');
      expect(dockerfile).toContain('git clone https://github.com/user/repo.git');
    });
  });
});
