import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './utils/logger';

const ONBOARDING_COMPLETED_KEY = '@reise_budget_onboarding_completed';

class OnboardingService {
  /**
   * Check if the user has completed the onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return value === 'true';
    } catch (error) {
      logger.error('Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark the onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      logger.debug('Onboarding marked as completed');
    } catch (error) {
      logger.error('Failed to save onboarding completion status:', error);
      throw error;
    }
  }

  /**
   * Reset the onboarding status (for testing purposes)
   */
  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      logger.debug('Onboarding status reset');
    } catch (error) {
      logger.error('Failed to reset onboarding status:', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();