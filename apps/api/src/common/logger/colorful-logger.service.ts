import { Injectable, LoggerService } from '@nestjs/common';
import chalk from 'chalk';

@Injectable()
export class ColorfulLogger implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    const timestamp = new Date().toISOString();
    console.log(
      `${chalk.gray(timestamp)} ${chalk.blue('LOG')} ${chalk.cyan(`[${ctx}]`)} ${message}`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    const ctx = context || this.context || 'Application';
    const timestamp = new Date().toISOString();
    console.error(
      `${chalk.gray(timestamp)} ${chalk.red('ERROR')} ${chalk.cyan(`[${ctx}]`)} ${chalk.red(message)}`,
    );
    if (trace) {
      console.error(chalk.red(trace));
    }
  }

  warn(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    const timestamp = new Date().toISOString();
    console.warn(
      `${chalk.gray(timestamp)} ${chalk.yellow('WARN')} ${chalk.cyan(`[${ctx}]`)} ${chalk.yellow(message)}`,
    );
  }

  debug(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    const timestamp = new Date().toISOString();
    console.debug(
      `${chalk.gray(timestamp)} ${chalk.magenta('DEBUG')} ${chalk.cyan(`[${ctx}]`)} ${chalk.gray(message)}`,
    );
  }

  verbose(message: string, context?: string) {
    const ctx = context || this.context || 'Application';
    const timestamp = new Date().toISOString();
    console.log(
      `${chalk.gray(timestamp)} ${chalk.blue('VERBOSE')} ${chalk.cyan(`[${ctx}]`)} ${chalk.gray(message)}`,
    );
  }
}

