'use client';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  data?: any;
}

interface LogMetadata {
  context?: string;
  data?: any;
  timestamp: string;
}

/**
 * Simple browser-compatible logger
 */
class BrowserLogger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string, metadata: LogMetadata): string {
    const meta = metadata.data ? `: ${JSON.stringify(metadata.data)}` : '';
    const context = metadata.context ? `[${metadata.context}]` : '';
    return `${metadata.timestamp} ${level} ${context} ${message}${meta}`;
  }

  info(message: string, options: LogOptions = {}) {
    const metadata = {
      context: options.context,
      data: options.data,
      timestamp: this.getTimestamp()
    };
    console.info(this.formatMessage('info', message, metadata));
  }

  warn(message: string, options: LogOptions = {}) {
    const metadata = {
      context: options.context,
      data: options.data,
      timestamp: this.getTimestamp()
    };
    console.warn(this.formatMessage('warn', message, metadata));
  }

  error(message: string, options: LogOptions = {}) {
    const metadata = {
      context: options.context,
      data: options.data,
      timestamp: this.getTimestamp()
    };
    console.error(this.formatMessage('error', message, metadata));
  }

  debug(message: string, options: LogOptions = {}) {
    const metadata = {
      context: options.context,
      data: options.data,
      timestamp: this.getTimestamp()
    };
    console.debug(this.formatMessage('debug', message, metadata));
  }

  createContextLogger(context: string) {
    return {
      info: (message: string, data?: any) => this.info(message, { context, data }),
      warn: (message: string, data?: any) => this.warn(message, { context, data }),
      error: (message: string, data?: any) => this.error(message, { context, data }),
      debug: (message: string, data?: any) => this.debug(message, { context, data })
    };
  }
}

const logger = new BrowserLogger();

export default logger;
