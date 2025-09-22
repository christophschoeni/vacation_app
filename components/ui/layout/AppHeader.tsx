import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { Button } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightButton?: {
    title: string;
    icon?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  leftButton?: {
    title: string;
    icon?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export default function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightButton,
  leftButton,
}: AppHeaderProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={[
      styles.header,
      {
        backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
        shadowRadius: 3,
        elevation: 2,
      }
    ]}>
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
            {title}
          </Text>

          {showBackButton && onBackPress ? (
            <Button
              title="Zurück"
              variant="outline"
              onPress={onBackPress}
              size="small"
              style={styles.backButton}
            />
          ) : rightButton ? (
            <Button
              title={rightButton.title}
              variant={rightButton.variant === 'primary' ? 'primary' : 'outline'}
              onPress={rightButton.onPress}
              size="small"
              style={styles.rightButton}
            />
          ) : leftButton ? (
            <Button
              title={leftButton.title}
              variant={leftButton.variant === 'primary' ? 'primary' : 'outline'}
              onPress={leftButton.onPress}
              size="small"
              style={styles.leftButton}
            />
          ) : null}
        </View>

        {subtitle && (
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerContent: {
    paddingVertical: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  backButton: {
    minWidth: 80,
  },
  leftButton: {
    minWidth: 80,
  },
  rightButton: {
    minWidth: 100,
  },
  placeholder: {
    width: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
});