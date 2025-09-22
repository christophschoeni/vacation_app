import React from 'react';
import { View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  borderRadius?: number;
  className?: string;
}

export default function GlassContainer({
  children,
  style,
  intensity = 'medium',
  borderRadius = 16,
  className = '',
}: GlassContainerProps) {
  const colorScheme = useColorScheme();

  const intensityMap = {
    light: 15,
    medium: 25,
    strong: 35,
  };

  // Apple iOS 17 inspired glass background
  const glassBg = colorScheme === 'dark'
    ? 'rgba(28, 28, 30, 0.68)'  // iOS dark mode background
    : 'rgba(255, 255, 255, 0.78)';  // iOS light mode background

  const borderColor = colorScheme === 'dark'
    ? 'rgba(84, 84, 88, 0.5)'  // iOS dark separator
    : 'rgba(198, 198, 200, 0.6)';  // iOS light separator

  return (
    <View
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: glassBg,
          borderWidth: 0.5,
          borderColor,
          // iOS-style shadow
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        style,
      ]}
      className={className}
    >
      <BlurView
        intensity={intensityMap[intensity]}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        {children}
      </BlurView>
    </View>
  );
}