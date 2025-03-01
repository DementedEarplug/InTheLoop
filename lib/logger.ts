/**
 * Simple logging utility for the application
 * Provides different log levels and consistent formatting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const context = options?.context ? `[${options.context}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${context} ${message}`;
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    // Always log errors, but only log other levels in development
    if (level === 'error' || this.isDevelopment) {
      const formattedMessage = this.formatMessage(level, message, options);
      
      switch (level) {
        case 'debug':
          console.debug(formattedMessage, options?.data || '');
          break;
        case 'info':
          console.info(formattedMessage, options?.data || '');
          break;
        case 'warn':
          console.warn(formattedMessage, options?.data || '');
          break;
        case 'error':
          console.error(formattedMessage, options?.data || '');
          break;
      }
    }
  }

  public debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options);
  }

  public info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  public warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }

  public error(message: string, options?: LogOptions): void {
    this.log('error', message, options);
  }
}

export const logger = Logger.getInstance();
