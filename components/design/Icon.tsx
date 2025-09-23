import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

// Custom SVG-like icons using Unicode symbols and text
const iconMap = {
  // Navigation
  'arrow-left': '←',
  'arrow-right': '→',
  'arrow-up': '↑',
  'arrow-down': '↓',
  'chevron-left': '‹',
  'chevron-right': '›',
  'chevron-up': '⌃',
  'chevron-down': '⌄',

  // Actions - Apple HIG compliant
  'plus': '+',
  'minus': '−',
  'close': '×',
  'check': '✓',
  'edit': '✎',
  'delete': '🗑',
  'refresh': '↻',
  'search': '🔍',
  'filter': '⚲',
  'more': '⋯',

  // Navigation & UI - Apple HIG compliant
  'home': '⌂',
  'airplane': '✈',
  'compass': '⊙',
  'settings': '⚙',
  'menu': '☰',
  'back': '◀',

  // Categories
  'restaurant': '🍽️',
  'car': '🚗',
  'hotel': '🏨',
  'music': '🎵',
  'shopping': '🛍️',
  'other': '📦',

  // Status & Feedback
  'warning': '⚠️',
  'error': '❌',
  'success': '✅',
  'info': 'ℹ️',
  'heart': '♡',
  'heart-filled': '♥',
  'star': '☆',
  'star-filled': '★',

  // Currency & Money
  'currency': '💱',
  'wallet': '💳',
  'budget': '¤',

  // Misc
  'calendar': '📅',
  'clock': '🕐',
  'location': '📍',
  'camera': '📷',
  'image': '🖼️',
};

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function Icon({ name, size = 24, color = '#000000', style }: IconProps) {
  const iconSymbol = iconMap[name] || '?';

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: size,
          color: color,
          lineHeight: size * 1.1,
          width: size,
          height: size,
        },
        style,
      ]}
    >
      {iconSymbol}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: 'System',
  },
});