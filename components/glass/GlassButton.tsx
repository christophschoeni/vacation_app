import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: string;
  className?: string;
}

export default function GlassButton({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  className = '',
}: GlassButtonProps) {
  const colorScheme = useColorScheme();

  const sizeMap = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: 14,
      height: 36,
      borderRadius: 8
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 16,
      height: 44,
      borderRadius: 10
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      fontSize: 18,
      height: 50,
      borderRadius: 12
    },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colorScheme === 'dark'
            ? 'rgba(0, 122, 255, 0.85)' // iOS blue
            : 'rgba(0, 122, 255, 1)',
          textColor: '#FFFFFF',
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colorScheme === 'dark'
            ? 'rgba(72, 72, 74, 0.85)' // iOS gray
            : 'rgba(142, 142, 147, 0.85)',
          textColor: '#FFFFFF',
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: colorScheme === 'dark' ? '#007AFF' : '#007AFF', // iOS blue
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? '#007AFF' : '#007AFF',
        };
      case 'destructive':
        return {
          backgroundColor: colorScheme === 'dark'
            ? 'rgba(255, 59, 48, 0.85)' // iOS red
            : 'rgba(255, 59, 48, 1)',
          textColor: '#FFFFFF',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: colorScheme === 'dark'
            ? 'rgba(0, 122, 255, 0.85)'
            : 'rgba(0, 122, 255, 1)',
          textColor: '#FFFFFF',
          borderWidth: 0,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = sizeMap[size];

  const buttonContent = (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: icon ? 6 : 0,
    }}>
      {icon && (
        <Text style={[
          {
            fontSize: sizeStyles.fontSize,
            color: variantStyles.textColor,
          }
        ]}>
          {icon}
        </Text>
      )}
      <Text
        style={[
          {
            fontSize: sizeStyles.fontSize,
            fontWeight: '600',
            color: variantStyles.textColor,
            textAlign: 'center',
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        {
          borderRadius: sizeStyles.borderRadius,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
          // iOS button shadow
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.5,
          elevation: 2,
        },
        style,
      ]}
      className={className}
    >
      {variantStyles.backgroundColor === 'transparent' ? (
        <View
          style={[
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: sizeStyles.paddingHorizontal,
              backgroundColor: variantStyles.backgroundColor,
              alignItems: 'center',
              justifyContent: 'center',
              height: sizeStyles.height,
              borderWidth: variantStyles.borderWidth,
              borderColor: variantStyles.borderColor,
              borderRadius: sizeStyles.borderRadius,
            },
          ]}
        >
          {buttonContent}
        </View>
      ) : (
        <BlurView
          intensity={20}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={{
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            backgroundColor: variantStyles.backgroundColor,
            alignItems: 'center',
            justifyContent: 'center',
            height: sizeStyles.height,
          }}
        >
          {buttonContent}
        </BlurView>
      )}
    </TouchableOpacity>
  );
}