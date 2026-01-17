import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from './logger';

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;

export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly logger: Logger;

  constructor(
    private readonly baseConfig: AxiosRequestConfig = {},
    logger = new Logger('api-client')
  ) {
    this.client = axios.create(baseConfig);
    this.logger = logger;
  }

  async get<T>(
    url: string,
    config: AxiosRequestConfig = {},
    retries = DEFAULT_RETRY_COUNT
  ): Promise<T> {
    return this.requestWithRetry<T>({ method: 'GET', url, ...config }, retries);
  }

  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    retries: number
  ): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      if (retries <= 0) {
        throw error;
      }

      const delay = DEFAULT_RETRY_DELAY_MS * (DEFAULT_RETRY_COUNT - retries + 1);
      this.logger.warn(
        `Request failed, retrying in ${delay}ms (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.requestWithRetry<T>(config, retries - 1);
    }
  }
}
