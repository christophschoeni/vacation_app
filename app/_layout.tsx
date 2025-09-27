import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { insights } from 'expo-insights';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { ThemeProvider, useTheme } from '@/contexts/theme-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { db } from '@/lib/db/database';
import migrations from '@/lib/db/migrations/migrations';
import { appInitialization } from '@/lib/app-initialization';
import { ensureDefaultTemplates } from '@/lib/seed-templates';
import { translationService } from '@/lib/i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
  const { isDark } = useTheme();
  const { success, error } = useMigrations(db, migrations);

  // Install default data after successful migration
  useEffect(() => {
    if (success) {
      const installDefaults = async () => {
        try {
          // Initialize i18n system
          await translationService.initialize();

          // Install default app data (categories, settings)
          await appInitialization.installDefaultData();

          // Always ensure templates exist (independent of migration flag)
          await ensureDefaultTemplates();

          if (insights && typeof insights.track === 'function') {
            insights.track('app_launched');
          }
        } catch (error) {
          console.warn('Failed to install default data or track app launch:', error);
        }
      };

      installDefaults();
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

  if (!success) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#000' : '#fff' }}>
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#007AFF'} />
          <Text style={{ color: isDark ? '#fff' : '#000', marginTop: 16, fontSize: 16 }}>
            Initializing Vacation Assist...
          </Text>
          <Text style={{ color: isDark ? '#888' : '#666', marginTop: 8, fontSize: 14 }}>
            Running migrations...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
            animationDuration: 350,
            ...modalSlideUp,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RootNavigation />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
