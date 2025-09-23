import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card, Button } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle: string;
  buttonTitle: string;
  onButtonPress: () => void;
}

export default function EmptyState({
  icon = '📝',
  title,
  subtitle,
  buttonTitle,
  onButtonPress,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();

  return (
    <Card variant="clean" style={styles.container} accessible={true} accessibilityRole="region" accessibilityLabel={`${title}. ${subtitle}`}>
      <Text style={styles.icon} accessible={false}>{icon}</Text>
      <Text
        style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}
        accessible={true}
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text
        style={[styles.subtitle, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}
        accessible={true}
      >
        {subtitle}
      </Text>
      <Button
        title={buttonTitle}
        icon="plus"
        onPress={onButtonPress}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 60,
    paddingVertical: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 280,
  },
  button: {
    minWidth: 200,
  },
});