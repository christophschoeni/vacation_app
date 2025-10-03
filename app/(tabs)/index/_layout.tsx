import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: '',
        headerTitle: '',
        contentStyle: { backgroundColor: 'transparent' },
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          title: '',
          headerTitle: '',
          navigationBarHidden: true,
        }}
      />
    </Stack>
  );
}
