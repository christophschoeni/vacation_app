import { Alert } from 'react-native';
import { logger } from './logger';

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  userMessage?: string;
  logError?: boolean;
  context?: string;
}

export interface StandardError {
  message: string;
  code?: string;
  details?: unknown;
  context?: string;
}

/**
 * Standard error handling utility for the application
 */
export class ErrorHandler {
  /**
   * Handle async operation errors with consistent logging and user feedback
   */
  static async handleAsyncError(
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): Promise<void> {
    const {
      showAlert = false,
      userMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      logError = true,
      context = 'Unknown operation'
    } = options;

    const standardError = this.normalizeError(error, context);

    // Log the error
    if (logError) {
      logger.error(`[${context}] ${standardError.message}`, {
        code: standardError.code,
        details: standardError.details,
        context: standardError.context
      });
    }

    // Show user alert if requested
    if (showAlert) {
      Alert.alert('Fehler', userMessage);
    }
  }

  /**
   * Handle database operation errors
   */
  static async handleDatabaseError(
    error: unknown,
    operation: string,
    showAlert: boolean = false
  ): Promise<void> {
    await this.handleAsyncError(error, {
      showAlert,
      userMessage: 'Fehler beim Zugriff auf die Datenbank. Bitte versuchen Sie es erneut.',
      context: `Database: ${operation}`
    });
  }

  /**
   * Handle network/API errors
   */
  static async handleNetworkError(
    error: unknown,
    operation: string,
    showAlert: boolean = true
  ): Promise<void> {
    await this.handleAsyncError(error, {
      showAlert,
      userMessage: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
      context: `Network: ${operation}`
    });
  }

  /**
   * Handle storage errors (AsyncStorage, FileSystem, etc.)
   */
  static async handleStorageError(
    error: unknown,
    operation: string,
    showAlert: boolean = false
  ): Promise<void> {
    await this.handleAsyncError(error, {
      showAlert,
      userMessage: 'Fehler beim Speichern der Daten. Bitte versuchen Sie es erneut.',
      context: `Storage: ${operation}`
    });
  }

  /**
   * Handle validation errors
   */
  static async handleValidationError(
    error: unknown,
    field: string,
    showAlert: boolean = true
  ): Promise<void> {
    await this.handleAsyncError(error, {
      showAlert,
      userMessage: `Ungültige Eingabe für ${field}. Bitte überprüfen Sie Ihre Angaben.`,
      context: `Validation: ${field}`
    });
  }

  /**
   * Normalize different error types into a standard format
   */
  private static normalizeError(error: unknown, context?: string): StandardError {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: 'ERROR',
        details: { stack: error.stack, name: error.name },
        context
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR',
        context
      };
    }

    if (typeof error === 'object' && error !== null) {
      const obj = error as Record<string, unknown>;
      return {
        message: obj.message?.toString() || 'Unknown error object',
        code: obj.code?.toString() || 'OBJECT_ERROR',
        details: obj,
        context
      };
    }

    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      details: { originalError: error },
      context
    };
  }

  /**
   * Create a wrapped async function with automatic error handling
   */
  static wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: ErrorHandlerOptions
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.handleAsyncError(error, options);
        throw error; // Re-throw to maintain function signature
      }
    }) as T;
  }

  /**
   * Execute an async operation with standardized error handling
   */
  static async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      await this.handleAsyncError(error, options);
      return null;
    }
  }
}

/**
 * Utility functions for common error handling patterns
 */
export const errorUtils = {
  /**
   * Safe async execution that never throws
   */
  async safeAsync<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: string = 'Safe async operation'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      await ErrorHandler.handleAsyncError(error, { context, logError: true });
      return fallback;
    }
  },

  /**
   * Retry an async operation with exponential backoff
   */
  async retryAsync<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context: string = 'Retry operation'
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          await ErrorHandler.handleAsyncError(error, {
            context: `${context} (final attempt)`,
            logError: true
          });
          throw error;
        }

        // Exponential backoff: 2^attempt * 100ms
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));

        logger.debug(`Retrying ${context} (attempt ${attempt + 1}/${maxRetries})`);
      }
    }

    throw lastError;
  }
};