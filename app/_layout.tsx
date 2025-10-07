// Removed NavigationThemeProvider to avoid conflicts with DynamicColorIOS
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import insights from 'expo-insights';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { db } from '@/lib/db/database';
import migrations from '@/lib/db/migrations/migrations';
import { appInitialization } from '@/lib/app-initialization';
import { ensureDefaultTemplates } from '@/lib/seed-templates';
import { translationService } from '@/lib/i18n';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { onboardingService } from '@/lib/onboarding-service';
import { notificationService } from '@/lib/services/notification-service';

const slideFromRight = {
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
    };
  },
};

const modalSlideUp = {
  cardStyleInterpolator: ({ current, layouts }: any) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  },
};

function RootNavigation() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { success, error } = useMigrations(db, migrations);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  // Check onboarding status and install default data after successful migration
  useEffect(() => {
    if (success) {
      const initializeApp = async () => {
        try {
          // Initialize i18n system
          await translationService.initialize();

          // Install default app data (categories, settings)
          await appInitialization.installDefaultData();

          // Always ensure templates exist (independent of migration flag)
          await ensureDefaultTemplates();

          // Initialize notification service
          await notificationService.initialize();

          // Check onboarding status
          const completed = await onboardingService.hasCompletedOnboarding();
          setOnboardingCompleted(completed);

          if (insights && typeof insights.track === 'function') {
            insights.track('app_launched');
          }
        } catch (error) {
          console.warn('Failed to install default data or track app launch:', error);
          // For new users, still check onboarding status even if initialization fails
          try {
            const completed = await onboardingService.hasCompletedOnboarding();
            setOnboardingCompleted(completed);
          } catch (onboardingError) {
            // Only if onboarding check also fails, assume completed to avoid blocking
            console.warn('Failed to check onboarding status:', onboardingError);
            setOnboardingCompleted(true);
          }
        }
      };

      initializeApp();
    }
  }, [success]);

  // Show loading screen during migration
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18, marginBottom: 10 }}>
            Migration Error
          </Text>
          <Text style={{ color: isDark ? '#ccc' : '#666', textAlign: 'center' }}>
            {error.message}
          </Text>
        </View>
      </View>
    );
  }

  if (!success || onboardingCompleted === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#007AFF'} />
          <Text style={{ color: isDark ? '#fff' : '#000', marginTop: 16, fontSize: 16 }}>
            Initializing Reise Budget...
          </Text>
          <Text style={{ color: isDark ? '#888' : '#666', marginTop: 8, fontSize: 14 }}>
            {!success ? 'Running migrations...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  // Show onboarding or main app based on completion status
  if (!onboardingCompleted) {
    return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'none',
          }}
        />
        <Stack.Screen
          name="debug"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/categories"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/currency"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/notifications"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/templates"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/currency-calculator"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/currency-data"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="settings/language"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="template/[id]/index"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="template/[id]/edit"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="vacation/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="vacation/add"
          options={{
            headerShown: false,
            presentation: 'modal',
            animationDuration: 350,
            ...modalSlideUp,
          }}
        />
        <Stack.Screen
          name="expense/add"
          options={{
            headerShown: false,
            presentation: 'modal',
            animationDuration: 350,
            ...modalSlideUp,
          }}
        />
        <Stack.Screen
          name="checklist/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
            animationDuration: 300,
            ...slideFromRight,
          }}
        />
        <Stack.Screen
          name="vacation-edit"
          options={{
            headerShown: false,
            presentation: 'modal',
            animationDuration: 350,
            ...modalSlideUp,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            headerShown: false,
            presentation: 'modal',
            animationDuration: 350,
            ...modalSlideUp,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <CurrencyProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootNavigation />
          </GestureHandlerRootView>
        </CurrencyProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
