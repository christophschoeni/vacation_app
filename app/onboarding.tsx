import React from 'react';
import { router } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingService } from '@/lib/onboarding-service';

export default function OnboardingPage() {
  const handleComplete = async () => {
    try {
      await onboardingService.completeOnboarding();
      // Navigate to the main tabs
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Navigate anyway to prevent user from being stuck
      router.replace('/(tabs)');
    }
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}