import { logger } from './utils/logger';
import { appSettingsRepository } from './db/repositories/app-settings-repository';

class OnboardingService {
  /**
   * Check if the user has completed the onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      return await appSettingsRepository.getOnboardingCompleted();
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
      await appSettingsRepository.setOnboardingCompleted(true);
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
      await appSettingsRepository.setOnboardingCompleted(false);
      logger.debug('Onboarding status reset');
    } catch (error) {
      logger.error('Failed to reset onboarding status:', error);
      throw error;
    }
  }
}

export const onboardingService = new OnboardingService();