import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import GlassContainer from './GlassContainer';

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  disabled?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  onPress,
  style,
  intensity = 'light',
  disabled = false,
  className = '',
}: GlassCardProps) {
  const colorScheme = useColorScheme();

  const cardContent = (
    <GlassContainer
      intensity={intensity}
      borderRadius={12}
      style={[
        {
          minHeight: 80,
        },
        style,
      ]}
      className={className}
    >
      {children}
    </GlassContainer>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          shadowColor: colorScheme === 'dark' ? '#000' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        shadowColor: colorScheme === 'dark' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {cardContent}
    </View>
  );
}