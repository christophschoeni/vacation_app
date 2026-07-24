// Removed NavigationThemeProvider to avoid conflicts with DynamicColorIOS
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, useColorScheme } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { db } from '@/lib/db/database';
import migrations from '@/lib/db/migrations/migrations';
import { appInitialization } from '@/lib/app-initialization';
import { ensureDefaultTemplates } from '@/lib/seed-templates';
import { translationService } from '@/lib/i18n';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { EntitlementProvider, useEntitlement } from '@/contexts/EntitlementContext';
import Paywall from '@/components/paywall/Paywall';
import { onboardingService } from '@/lib/onboarding-service';
import { notificationService } from '@/lib/services/notification-service';
import { migrateExpensesToSQLite } from '@/lib/db/migrate-expenses-to-sqlite';
import { migrateBudgetCurrency } from '@/lib/db/migrate-budget-currency';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/client';
import { useWidgetSync } from '@/hooks/use-widget-sync';

function RootNavigation({
  onRetryMigration,
}: {
  onRetryMigration: () => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { success, error } = useMigrations(db, migrations);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const { isPro, isLoading: entitlementLoading } = useEntitlement();

  // Keeps the home-screen widgets in step with the app's own data. Mounted
  // here because it needs the query and currency providers above it.
  useWidgetSync();

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

          // One-time move of expenses from the legacy AsyncStorage store into
          // SQLite. Idempotent; a no-op on fresh installs and after the first
          // successful run.
          await migrateExpensesToSQLite();

          // One-time conversion of each vacation's budget into the home currency
          // (budgetCurrency now means the home currency, not the trip currency).
          // Idempotent and offline-safe: defers records it cannot convert yet.
          await migrateBudgetCurrency();

          // Initialize notification service
          await notificationService.initialize();

          // Check onboarding status
          const completed = await onboardingService.hasCompletedOnboarding();
          setOnboardingCompleted(completed);
        } catch {
          // Failed to install default data
          // For new users, still check onboarding status even if initialization fails
          try {
            const completed = await onboardingService.hasCompletedOnboarding();
            setOnboardingCompleted(completed);
          } catch {
            // Only if onboarding check also fails, assume completed to avoid blocking
            setOnboardingCompleted(true);
          }
        }
      };

      initializeApp();
    }
  }, [success]);

  // A failed migration is otherwise a dead end: the same migration reruns on
  // every launch, so without a recovery path the app stays permanently
  // unusable and only a reinstall (losing all data) helps.
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ color: isDark ? '#fff' : '#000', fontSize: 18, marginBottom: 10 }}>
            Migration Error
          </Text>
          <Text style={{ color: isDark ? '#ccc' : '#666', textAlign: 'center', marginBottom: 24 }} selectable>
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={onRetryMigration}
            style={{ backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
            accessibilityRole="button"
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              Erneut versuchen
            </Text>
          </TouchableOpacity>
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

  // While RevenueCat resolves the first CustomerInfo, wait rather than flash the
  // paywall at a subscriber who is actually entitled.
  if (entitlementLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#007AFF'} />
      </View>
    );
  }

  // Hard paywall: without an active Pro entitlement (trial or paid), the app is
  // gated. During the 7-day free trial the entitlement is active, so the app is
  // open; once it lapses without a purchase, the paywall returns. A successful
  // purchase updates isPro via the SDK listener and this re-renders into the app.
  if (!isPro) {
    return (
      <>
        <Paywall />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      {/*
        Expo Router registers every file under app/ as a route automatically, so
        push screens need no explicit <Stack.Screen>. But `presentation: 'card'`
        must be the DEFAULT: without it, screens pushed on top of the
        transparentModal `(tabs)` surface inherit a modal presentation instead of
        a normal push — which turned the vacation detail (itself a tabs group)
        into a modal. Only the screens that genuinely deviate are listed below.
        On iOS the native stack's default push already is the slide-from-right
        transition, so no custom interpolator is needed.
      */}
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ presentation: 'transparentModal', animation: 'none' }}
        />
        <Stack.Screen name="vacation/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense/add" options={{ presentation: 'modal' }} />
        <Stack.Screen name="expense/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="vacation-edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  // Bumping this key remounts RootNavigation, which reruns useMigrations.
  // Without it a failed migration would have no way to be retried.
  const [migrationAttempt, setMigrationAttempt] = useState(0);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <CurrencyProvider>
            <EntitlementProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootNavigation
                  key={migrationAttempt}
                  onRetryMigration={() => setMigrationAttempt(attempt => attempt + 1)}
                />
              </GestureHandlerRootView>
            </EntitlementProvider>
          </CurrencyProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
