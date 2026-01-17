type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  constructor(private readonly prefix = 'comfyui-deps') {}

  info(message: string): void {
    this.log('info', message);
  }

  warn(message: string): void {
    this.log('warn', message);
  }

  error(message: string): void {
    this.log('error', message);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      this.log('debug', message);
    }
  }

  private log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    const tag = `[${timestamp}] [${this.prefix}] [${level.toUpperCase()}]`;
    // eslint-disable-next-line no-console
    console.log(`${tag} ${message}`);
  }
}
