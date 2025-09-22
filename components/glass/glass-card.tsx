import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { GlassContainer } from './glass-container';

interface GlassCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  className?: string;
  blurAmount?: number;
}

export function GlassCard({ 
  children, 
  className = '', 
  blurAmount = 15,
  onPress,
  ...props 
}: GlassCardProps) {
  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        <GlassContainer 
          blurAmount={blurAmount}
          className={`p-4 m-2 ${className}`}
        >
          {children}
        </GlassContainer>
      </TouchableOpacity>
    );
  }

  return (
    <GlassContainer 
      blurAmount={blurAmount}
      className={`p-4 m-2 ${className}`}
    >
      {children}
    </GlassContainer>
  );
}