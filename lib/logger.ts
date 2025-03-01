/**
 * Logger utility for consistent application logging
 * Provides different log levels and formatting options
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  level?: LogLevel;
  context?: string;
  data?: any;
}

/**
 * Application logger with support for different log levels and contexts
 * @param message - The message to log
 * @param options - Optional configuration for the log entry
 */
export function log(message: string, options: LogOptions = {}) {
  const { level = 'info', context, data } = options;
  
  // Format timestamp for log entries
  const timestamp = new Date().toISOString();
  
  // Base log object
  const logEntry = {
    timestamp,
    level,
    message,
    ...(context ? { context } : {}),
    ...(data ? { data } : {})
  };
  
  // Log to appropriate console method based on level
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry, null, 2));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry, null, 2));
      break;
    case 'debug':
      // Only log debug in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        console.debug(JSON.stringify(logEntry, null, 2));
      }
      break;
    case 'info':
    default:
      console.log(JSON.stringify(logEntry, null, 2));
  }
  
  // In a production app, you might want to send logs to a service
  // Example: if (process.env.NODE_ENV === 'production') sendToLogService(logEntry);
  
  return logEntry;
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
