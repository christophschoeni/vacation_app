import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Icon, IconName } from '@/components/design/Icon';

interface OnboardingSlideProps {
  icon: IconName;
  title: string;
  text: string;
  color: string;
}

export default function OnboardingSlide({ icon, title, text, color }: OnboardingSlideProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Convert hex color to rgba with transparency for background
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Icon color - use provided color
  const iconColor = color;
  // Background color - same color but with transparency
  const backgroundColor = isDark ? hexToRgba(color, 0.15) : hexToRgba(color, 0.1);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <Icon
            name={icon}
            size={80}
            color={iconColor}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {title}
        </Text>

        {/* Description Text */}
        <Text style={[styles.text, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 41,
  },
  text: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
});