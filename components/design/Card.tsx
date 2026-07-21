import React from 'react';
import { View, ViewProps, ViewStyle, StyleProp , useColorScheme } from 'react-native';
import { Colors, BorderRadius, Shadow, Spacing } from '@/constants/design';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'clean';

interface CardProps extends Pick<ViewProps, 'accessible' | 'accessibilityRole' | 'accessibilityLabel' | 'accessibilityHint'> {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof Spacing;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  children,
  variant = 'default',
  padding = 'lg',
  style,
  ...accessibilityProps
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
    <View style={[getCardStyles(), style]} {...accessibilityProps}>
      {children}
    </View>
  );
}