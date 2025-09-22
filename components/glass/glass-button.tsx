import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { GlassContainer } from './glass-container';

interface GlassButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function GlassButton({ 
  title, 
  variant = 'primary',
  size = 'medium',
  className = '',
  ...props 
}: GlassButtonProps) {
  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      {...props}
    >
      <GlassContainer 
        blurAmount={10}
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          items-center 
          justify-center
          ${variant === 'primary' ? 'bg-blue-500/30' : 'bg-white/10'}
          ${className}
        `}
      >
        <ThemedText 
          className={`
            ${textSizes[size]} 
            font-semibold 
            ${variant === 'primary' ? 'text-white' : 'text-blue-600'}
          `}
        >
          {title}
        </ThemedText>
      </GlassContainer>
    </TouchableOpacity>
  );
}