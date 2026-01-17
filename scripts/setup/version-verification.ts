import { Logger } from '../utils/logger';
import { RegistryFile, VerificationStatus } from './types';
import { VersionDiscovery } from './version-discovery';

export class VersionVerification {
  private readonly logger = new Logger('version-verification');
  private readonly discovery: VersionDiscovery;

  constructor(discovery = new VersionDiscovery()) {
    this.discovery = discovery;
  }

  async verifyAllVersions(registry: RegistryFile): Promise<VerificationStatus> {
    const status: VerificationStatus = { nodes: {}, models: {} };

    for (const [name, node] of Object.entries(registry.nodes)) {
      if (node.managerPackage) {
        const discovery = await this.discovery.discoverManagerNodeVersions(
          node.managerPackage
        );
        status.nodes[name] = {
          verified: discovery.available,
          version: node.expectedVersion ?? discovery.latestVersion ?? 'latest',
          availableVersions: discovery.allVersions,
          error: discovery.available ? undefined : 'Package not found',
        };
        continue;
      }

      if (node.gitRepo?.url) {
        const discovery = await this.discovery.discoverGitHubNodeVersions(
          node.gitRepo.url
        );
        const version = node.gitRepo.version ?? 'main';
        const versionExists =
          discovery.tags.includes(version) || discovery.latestCommit === version;
        status.nodes[name] = {
          verified: versionExists,
          version,
          availableVersions: discovery.tags,
          error: versionExists ? undefined : 'Version not found',
        };
        continue;
      }

      status.nodes[name] = {
        verified: false,
        version: 'unknown',
        error: 'No install source defined',
      };
    }

    for (const [name, model] of Object.entries(registry.models)) {
      if (model.huggingface) {
        const discovery = await this.discovery.discoverHuggingFaceModelVersion(
          model.huggingface.repo,
          model.huggingface.file
        );
        status.models[name] = {
          verified: discovery.verified,
          commit: discovery.commit,
          fileSize: discovery.fileSize,
          error: discovery.verified ? undefined : 'File not found',
        };
        continue;
      }

      if (model.directUrl) {
        status.models[name] = {
          verified: true,
          commit: 'direct',
        };
        continue;
      }

      status.models[name] = {
        verified: false,
        commit: 'unknown',
        error: 'No source defined',
      };
    }

    return status;
  }

  assertAllVerified(status: VerificationStatus): void {
    const nodeFailures = Object.entries(status.nodes).filter(
      ([, value]) => !value.verified
    );
    const modelFailures = Object.entries(status.models).filter(
      ([, value]) => !value.verified
    );

    if (nodeFailures.length === 0 && modelFailures.length === 0) {
      return;
    }

    this.logger.error(
      `Verification failed: ${nodeFailures.length} node(s), ${modelFailures.length} model(s)`
    );
    throw new Error('Dependency verification failed');
  }
}
