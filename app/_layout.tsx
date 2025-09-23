import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { insights } from 'expo-insights';
import 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { appInitialization } from '@/lib/app-initialization';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize database and migration on app startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting app initialization...');
        const result = await appInitialization.initialize();

        if (result.success) {
          console.log('✅ App initialization completed');
          setIsInitialized(true);
        } else {
          console.error('❌ App initialization failed:', result.error);
          setInitError(result.error || 'Unknown initialization error');
        }
      } catch (error) {
        console.error('❌ App initialization crashed:', error);
        setInitError('App initialization crashed');
      }
    };

    initializeApp();
  }, []);

  // Initialize Expo Insights safely
  useEffect(() => {
    if (isInitialized) {
      try {
        if (insights && typeof insights.track === 'function') {
          insights.track('app_launched');
        }
      } catch (error) {
        console.warn('Failed to track app launch:', error);
      }
    }
  }, [isInitialized]);

  // Show loading screen during initialization
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        {initError ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: 18, marginBottom: 10 }}>
              Initialization Error
            </Text>
            <Text style={{ color: colorScheme === 'dark' ? '#ccc' : '#666', textAlign: 'center' }}>
              {initError}
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#007AFF'} />
            <Text style={{ color: colorScheme === 'dark' ? '#fff' : '#000', marginTop: 16, fontSize: 16 }}>
              Initializing Vacation Assist...
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
