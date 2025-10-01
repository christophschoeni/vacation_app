import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '@/constants/design';
import { useColorScheme } from 'react-native';
import { Icon, IconName } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.lg,
      ...getSizeStyles(),
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: Colors.primary[500],
          ...Shadow.sm,
        };

      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
          borderWidth: 1,
          borderColor: isDark ? Colors.dark.border : Colors.light.border,
          ...Shadow.sm,
        };

      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary[500],
        };

      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };

      case 'destructive':
        return {
          ...baseStyle,
          backgroundColor: Colors.error[500],
          ...Shadow.sm,
        };

      default:
        return baseStyle;
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: Typography.fontWeight.semibold,
      textAlign: 'center',
      ...getTextSizeStyles(),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: Colors.neutral[0],
        };

      case 'secondary':
        return {
          ...baseStyle,
          color: isDark ? Colors.dark.onSurface : Colors.light.onSurface,
        };

      case 'outline':
        return {
          ...baseStyle,
          color: Colors.primary[500],
        };

      case 'ghost':
        return {
          ...baseStyle,
          color: isDark ? Colors.dark.onSurface : Colors.light.onSurface,
        };

      case 'destructive':
        return {
          ...baseStyle,
          color: Colors.neutral[0],
        };

      default:
        return baseStyle;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: 44, // iOS HIG minimum touch target
        };
      case 'medium':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: 48,
        };
      case 'large':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: 56,
        };
    }
  };

  const getTextSizeStyles = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: Typography.fontSize.footnote }; // iOS 13pt
      case 'medium':
        return { fontSize: Typography.fontSize.body }; // iOS 17pt (default)
      case 'large':
        return { fontSize: Typography.fontSize.title3 }; // iOS 20pt
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? Colors.neutral[0] : Colors.primary[500]}
          size="small"
        />
      );
    }

    const iconElement = icon && (
      <Icon
        name={icon}
        size={getIconSize()}
        color={getTextStyles().color as string}
        style={{
          marginRight: iconPosition === 'left' ? Spacing.xs : 0,
          marginLeft: iconPosition === 'right' ? Spacing.xs : 0,
        }}
      />
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}