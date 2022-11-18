import chalk from 'chalk';
import { inspect } from 'util';

const formatOutput = (...args: any[]) => {
  args = args.map((entry) => {
    if (entry instanceof Error) return `${entry.name} | ${entry.message}`
    if (typeof entry === 'object') return JSON.stringify(entry);
    return entry;
  });
  return inspect(args.join(' | '), {
    showHidden: false,
    depth: null,
    colors: false,
    compact: true,
    breakLength: Infinity,
  }).replace(/'/g, '');
};

export class Logger {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  debug(...args: any[]) {
    if (Logging.logLevel <= LogLevel.DEBUG) {
      console.debug(chalk.gray(`${chalk.bgWhite.black(' DEBUG ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  log(...args: any[]) {
    this.info(args);
  }

  info(...args: any[]) {
    if (Logging.logLevel <= LogLevel.INFO) {
      console.info(chalk.blue(`${chalk.bgBlue.white(' INFO ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  success(...args: any[]) {
    if (Logging.logLevel <= LogLevel.INFO) {
      console.info(chalk.green(`${chalk.bgGreen.black(' SUCCESS ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  warn(...args: any[]) {
    if (Logging.logLevel <= LogLevel.WARNING) {
      console.warn(chalk.yellow(`${chalk.bgYellow.black(' WARN ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }

  error(...args: any[]) {
    if (Logging.logLevel <= LogLevel.ERROR) {
      console.error(chalk.red(`${chalk.bgRed.black(' ERROR ')} ${this._name} | ${formatOutput(...args)}`));
    }
  }
}

export enum LogLevel {
  DEBUG = 0,
  INFO = 1, // & SUCCESS
  WARNING = 2,
  ERROR = 3,
  NONE = 4,
}

export namespace Logging {
  export let logLevel = LogLevel.INFO;

  export const init = (level: LogLevel) => {
    logLevel = level ?? LogLevel.INFO;
  };
}
