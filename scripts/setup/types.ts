export interface NodeInstallSource {
  managerPackage?: string;
  expectedVersion?: string;
  gitRepo?: {
    url: string;
    version?: string;
    branch?: string;
  };
  verified?: boolean;
  lastVerified?: string;
  availableVersions?: string[];
  error?: string;
}

export interface ModelSource {
  huggingface?: {
    repo: string;
    file: string;
    commit?: string;
    path: string;
  };
  directUrl?: {
    url: string;
    path: string;
  };
  verified?: boolean;
  lastVerified?: string;
  fileSize?: number;
  downloadUrl?: string;
  error?: string;
}

export interface WorkflowDependency {
  id: string;
  name: string;
  file: string;
  nodes: string[];
  models: string[];
}

export interface VerificationStatus {
  nodes: Record<
    string,
    {
      verified: boolean;
      version: string;
      availableVersions?: string[];
      error?: string;
    }
  >;
  models: Record<
    string,
    {
      verified: boolean;
      commit: string;
      fileSize?: number;
      error?: string;
    }
  >;
}

export interface DependencyReport {
  generatedAt: string;
  workflows: WorkflowDependency[];
  uniqueNodes: string[];
  uniqueModels: string[];
  missingFromRegistry: {
    nodes: string[];
    models: string[];
  };
  verificationStatus: VerificationStatus;
}

export interface RegistryFile {
  nodes: Record<string, NodeInstallSource>;
  models: Record<string, ModelSource>;
}

export interface VersionDiscoveryResult<T> {
  available: boolean;
  data?: T;
  error?: string;
}
