interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  private isDevelopment = __DEV__;

  private log(level: keyof LogLevel, message: string, ...args: any[]) {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'ERROR':
        console.error(prefix, message, ...args);
        break;
      case 'WARN':
        console.warn(prefix, message, ...args);
        break;
      case 'INFO':
        console.info(prefix, message, ...args);
        break;
      case 'DEBUG':
        console.log(prefix, message, ...args);
        break;
    }
  }

  error(message: string, ...args: any[]) {
    this.log('ERROR', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('WARN', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('INFO', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.log('DEBUG', message, ...args);
  }
}

export const logger = new Logger();