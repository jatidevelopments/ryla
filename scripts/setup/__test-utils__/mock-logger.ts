export class MockLogger {
  public logs: Array<{ level: string; message: string }> = [];

  info(message: string): void {
    this.logs.push({ level: 'info', message });
  }

  warn(message: string): void {
    this.logs.push({ level: 'warn', message });
  }

  error(message: string): void {
    this.logs.push({ level: 'error', message });
  }

  clear(): void {
    this.logs = [];
  }
}
