/**
 * RunPod API Client
 * 
 * Client for interacting with RunPod API for:
 * - Pod management
 * - Serverless endpoints
 * - Job execution
 * - Network volumes
 */

export interface RunPodConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface RunPodPod {
  id: string;
  name: string;
  status: string;
  gpuTypeId?: string;
  containerDiskInGb?: number;
  volumeInGb?: number;
  ports?: string[];
  env?: Record<string, string>;
}

export interface RunPodEndpoint {
  id: string;
  name: string;
  templateId?: string;
  gpuTypeIds?: string[];
  workersMin?: number;
  workersMax?: number;
}

export interface RunPodJob {
  id: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  input?: unknown;
  output?: unknown;
  error?: string;
}

export class RunPodClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: RunPodConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.runpod.io/graphql';
  }

  private async request<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`RunPod API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`RunPod API error: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }

  /**
   * List all pods
   */
  async listPods(): Promise<RunPodPod[]> {
    const query = `
      query {
        myself {
          pods {
            id
            name
            desiredStatus
            runtime {
              uptimeInSeconds
              ports {
                ip
                isIpPublic
                privatePort
                publicPort
                type
              }
            }
            machine {
              podHostId
              gpuCount
            }
          }
        }
      }
    `;

    const data = await this.request<{ myself: { pods: RunPodPod[] } }>(query);
    return data.myself.pods;
  }

  /**
   * Get pod details
   */
  async getPod(podId: string): Promise<RunPodPod> {
    const query = `
      query GetPod($input: Pod!) {
        pod(input: $input) {
          id
          name
          desiredStatus
          runtime {
            uptimeInSeconds
            ports {
              ip
              isIpPublic
              privatePort
              publicPort
              type
            }
          }
          machine {
            podHostId
            gpuCount
          }
        }
      }
    `;

    const data = await this.request<{ pod: RunPodPod }>(query, {
      input: { id: podId },
    });
    return data.pod;
  }

  /**
   * Create a pod
   */
  async createPod(config: {
    name: string;
    imageName: string;
    gpuTypeIds: string[];
    gpuCount?: number;
    containerDiskInGb?: number;
    volumeInGb?: number;
    volumeMountPath?: string;
    ports?: string[];
    env?: Record<string, string>;
  }): Promise<RunPodPod> {
    const mutation = `
      mutation CreatePod($input: PodCreateInput!) {
        podCreate(input: $input) {
          id
          name
          desiredStatus
        }
      }
    `;

    const data = await this.request<{ podCreate: RunPodPod }>(mutation, {
      input: config,
    });
    return data.podCreate;
  }

  /**
   * List serverless endpoints
   */
  async listEndpoints(): Promise<RunPodEndpoint[]> {
    const query = `
      query {
        myself {
          endpoints {
            id
            name
            templateId
            gpuIds
            workersMin
            workersMax
          }
        }
      }
    `;

    const data = await this.request<{ myself: { endpoints: RunPodEndpoint[] } }>(
      query
    );
    return data.myself.endpoints;
  }

  /**
   * Run a job on a serverless endpoint
   */
  async runJob(
    endpointId: string,
    input: unknown
  ): Promise<RunPodJob> {
    const mutation = `
      mutation RunJob($input: EndpointRunInput!) {
        endpointRun(input: $input) {
          id
          status
        }
      }
    `;

    const data = await this.request<{ endpointRun: RunPodJob }>(mutation, {
      input: {
        endpointId,
        input: JSON.stringify(input),
      },
    });
    return data.endpointRun;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<RunPodJob> {
    const query = `
      query GetJob($input: EndpointJobStatusInput!) {
        endpointJobStatus(input: $input) {
          id
          status
          output
          error
        }
      }
    `;

    const data = await this.request<{ endpointJobStatus: RunPodJob }>(query, {
      input: { jobId },
    });
    return data.endpointJobStatus;
  }
}

