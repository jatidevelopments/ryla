import { AxiosRequestConfig } from 'axios';

export class MockApiClient {
  private responses: Map<string, unknown> = new Map();

  setResponse(url: string, data: unknown): void {
    this.responses.set(url, data);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = this.responses.get(url);
    if (response === undefined) {
      throw new Error(`No mock response for URL: ${url}`);
    }
    return response as T;
  }

  clear(): void {
    this.responses.clear();
  }
}
