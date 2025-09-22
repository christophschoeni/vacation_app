import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  hapticFeedback?: boolean;
  logError?: boolean;
  customMessage?: string;
}

export function useErrorHandler() {
  const handleError = useCallback(
    async (
      error: Error | unknown,
      options: ErrorHandlerOptions = {}
    ) => {
      const {
        showAlert = true,
        hapticFeedback = true,
        logError = true,
        customMessage,
      } = options;

      // Log error for debugging
      if (logError) {
        console.error('Error handled by useErrorHandler:', error);
      }

      // Provide haptic feedback
      if (hapticFeedback) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Show user-friendly error message
      if (showAlert) {
        const errorMessage = getErrorMessage(error, customMessage);
        Alert.alert('Fehler', errorMessage);
      }
    },
    []
  );

  const handleAsyncError = useCallback(
    (asyncFunction: () => Promise<any>, options?: ErrorHandlerOptions) => {
      return async () => {
        try {
          return await asyncFunction();
        } catch (error) {
          await handleError(error, options);
          throw error; // Re-throw to allow caller to handle if needed
        }
      };
    },
    [handleError]
  );

  return { handleError, handleAsyncError };
}

function getErrorMessage(error: Error | unknown, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Network request failed') ||
        error.message.includes('fetch')) {
      return 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.';
    }

    // Database errors
    if (error.message.includes('database') ||
        error.message.includes('storage')) {
      return 'Ein Fehler beim Speichern der Daten ist aufgetreten. Bitte versuchen Sie es erneut.';
    }

    // Currency conversion errors
    if (error.message.includes('currency') ||
        error.message.includes('exchange')) {
      return 'Währungsumrechnung fehlgeschlagen. Es werden Standardwerte verwendet.';
    }

    // Validation errors
    if (error.message.includes('validation') ||
        error.message.includes('required')) {
      return 'Bitte füllen Sie alle erforderlichen Felder aus.';
    }

    // Return the original error message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('undefined')) {
      return error.message;
    }
  }

  // Fallback message
  return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
}

// Hook for handling specific operation types
export function useOperationErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleSaveError = useCallback(
    (error: Error | unknown) => handleError(error, {
      customMessage: 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.',
    }),
    [handleError]
  );

  const handleLoadError = useCallback(
    (error: Error | unknown) => handleError(error, {
      customMessage: 'Laden der Daten fehlgeschlagen. Bitte versuchen Sie es erneut.',
    }),
    [handleError]
  );

  const handleDeleteError = useCallback(
    (error: Error | unknown) => handleError(error, {
      customMessage: 'Löschen fehlgeschlagen. Bitte versuchen Sie es erneut.',
    }),
    [handleError]
  );

  const handleNetworkError = useCallback(
    (error: Error | unknown) => handleError(error, {
      customMessage: 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.',
    }),
    [handleError]
  );

  return {
    handleSaveError,
    handleLoadError,
    handleDeleteError,
    handleNetworkError,
    handleError,
  };
}