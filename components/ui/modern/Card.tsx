import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({
  children,
  onPress,
  onLongPress,
  style,
  padding = 16,
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardStyles = {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
    shadowColor: isDark ? '#000' : '#000',
  };

  const Wrapper = onPress || onLongPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.card,
        cardStyles,
        { padding },
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});