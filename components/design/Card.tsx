import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow, Spacing } from '@/constants/design';
import { useColorScheme } from 'react-native';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'clean';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  style
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.xl,
      padding: Spacing[padding],
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...Shadow.md,
        };

      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: isDark ? Colors.dark.border : Colors.light.border,
        };

      case 'clean':
        return {
          ...baseStyle,
          backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
          borderRadius: BorderRadius.xl, // Apple standard rounded corners
          borderWidth: 0, // No border
        };

      case 'default':
      default:
        return {
          ...baseStyle,
          ...Shadow.sm,
        };
    }
  };

  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
}