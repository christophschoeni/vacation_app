import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow, Layout } from '@/constants/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon, IconName } from './Icon';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: IconName;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  disabled?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
}

export function FloatingActionButton({
  onPress,
  icon = 'plus',
  size = 'medium',
  variant = 'primary',
  style,
  disabled = false,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          width: 48,
          height: 48,
        };
      case 'medium':
        return {
          width: Layout.sizes.fabSize,
          height: Layout.sizes.fabSize,
        };
      case 'large':
        return {
          width: 72,
          height: 72,
        };
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 20;
      case 'medium':
        return 24;
      case 'large':
        return 32;
    }
  };

  const getBackgroundColor = (): string => {
    if (variant === 'primary') {
      return Colors.primary[500];
    }
    return isDark ? Colors.dark.surface : Colors.light.surface;
  };

  const getIconColor = (): string => {
    if (variant === 'primary') {
      return Colors.neutral[0];
    }
    return isDark ? Colors.dark.onSurface : Colors.light.onSurface;
  };

  const fabStyles: ViewStyle = {
    ...getSizeStyles(),
    borderRadius: BorderRadius.full,
    backgroundColor: getBackgroundColor(),
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <TouchableOpacity
      style={[fabStyles, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
    >
      <Icon
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
      />
    </TouchableOpacity>
  );
}