import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings/categories"
              options={{
                headerShown: true,
                title: 'Kategorien',
                headerBackTitle: '',
                headerBackVisible: true,
                headerBackButtonMenuEnabled: false,
                presentation: 'card',
                animationDuration: 300,
                ...slideFromRight,
              }}
            />
            <Stack.Screen
              name="settings/currency"
              options={{
                headerShown: true,
                title: 'Währung',
                headerBackTitle: '',
                headerBackVisible: true,
                headerBackButtonMenuEnabled: false,
                presentation: 'card',
                animationDuration: 300,
                ...slideFromRight,
              }}
            />
            <Stack.Screen
              name="settings/notifications"
              options={{
                headerShown: true,
                title: 'Benachrichtigungen',
                headerBackTitle: '',
                headerBackVisible: true,
                headerBackButtonMenuEnabled: false,
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
