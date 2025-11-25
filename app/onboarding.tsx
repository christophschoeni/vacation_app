import React from 'react';
import { router } from 'expo-router';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingService } from '@/lib/onboarding-service';

export default function OnboardingPage() {
  const handleComplete = async () => {
    try {
      await onboardingService.completeOnboarding();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
    // Navigate to the main tabs - dismiss all screens first to prevent layout issues
    router.dismissAll();
    router.push('/(tabs)');
  };

  return <OnboardingScreen onComplete={handleComplete} />;
}