import chalk from 'chalk';

export class LoggerHelper {
  static formatMethod(method: string): string {
    const methodColors: Record<string, (text: string) => string> = {
      GET: chalk.green,
      POST: chalk.blue,
      PUT: chalk.yellow,
      PATCH: chalk.magenta,
      DELETE: chalk.red,
      OPTIONS: chalk.gray,
    };
    const colorFn = methodColors[method.toUpperCase()] || chalk.white;
    return colorFn(method.padEnd(7));
  }

  static formatStatusCode(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
      return chalk.green(statusCode.toString());
    }
    if (statusCode >= 300 && statusCode < 400) {
      return chalk.yellow(statusCode.toString());
    }
    if (statusCode >= 400 && statusCode < 500) {
      return chalk.red(statusCode.toString());
    }
    if (statusCode >= 500) {
      return chalk.red.bold(statusCode.toString());
    }
    return chalk.gray(statusCode.toString());
  }

  static formatUrl(url: string): string {
    return chalk.cyan(url);
  }

  static formatTime(timeMs: number): string {
    if (timeMs < 100) {
      return chalk.green(`${timeMs}ms`);
    }
    if (timeMs < 500) {
      return chalk.yellow(`${timeMs}ms`);
    }
    return chalk.red(`${timeMs}ms`);
  }

  static formatRequest(method: string, url: string): string {
    return `${this.formatMethod(method)} ${this.formatUrl(url)}`;
  }

  static formatResponse(
    method: string,
    url: string,
    statusCode: number,
    timeMs: number,
  ): string {
    return `${this.formatMethod(method)} ${this.formatUrl(url)} ${this.formatStatusCode(statusCode)} ${this.formatTime(timeMs)}`;
  }

  static formatError(
    method: string,
    url: string,
    statusCode: number,
    timeMs: number,
    errorMessage: string,
  ): string {
    return `${this.formatMethod(method)} ${this.formatUrl(url)} ${this.formatStatusCode(statusCode)} ${this.formatTime(timeMs)} ${chalk.red(`Error: ${errorMessage}`)}`;
  }
}

