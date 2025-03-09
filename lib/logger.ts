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

  info(message: string, metadata: LogMetadata) {
    console.info(this.formatMessage('info', message, metadata));
  }

  warn(message: string, metadata: LogMetadata) {
    console.warn(this.formatMessage('warn', message, metadata));
  }

  error(message: string, metadata: LogMetadata) {
    console.error(this.formatMessage('error', message, metadata));
  }

  debug(message: string, metadata: LogMetadata) {
    console.debug(this.formatMessage('debug', message, metadata));
  }
}

const logger = new BrowserLogger();

/**
 * Application logger with support for different log levels and contexts
 * @param message - The message to log
 * @param options - Optional configuration for the log entry
 */
export function log(message: string, options: LogOptions = {}) {
  const { level = 'info', context, data } = options;
  
  const metadata = {
    context,
    data,
    timestamp: new Date().toISOString()
  };

  switch (level) {
    case 'error':
      logger.error(message, metadata);
      break;
    case 'warn':
      logger.warn(message, metadata);
      break;
    case 'debug':
      logger.debug(message, metadata);
      break;
    case 'info':
    default:
      logger.info(message, metadata);
  }
}

/**
 * Creates a logger instance with a predefined context
 * @param context - The context to associate with all logs from this instance
 * @returns A logger function with the context pre-configured
 */
export function createContextLogger(context: string) {
  return {
    info: (message: string, data?: any) => log(message, { level: 'info', context, data }),
    warn: (message: string, data?: any) => log(message, { level: 'warn', context, data }),
    error: (message: string, data?: any) => log(message, { level: 'error', context, data }),
    debug: (message: string, data?: any) => log(message, { level: 'debug', context, data })
  };
}

// Default logger instance
export default {
  info: (message: string, data?: any) => log(message, { level: 'info', data }),
  warn: (message: string, data?: any) => log(message, { level: 'warn', data }),
  error: (message: string, data?: any) => log(message, { level: 'error', data }),
  debug: (message: string, data?: any) => log(message, { level: 'debug', data })
};
